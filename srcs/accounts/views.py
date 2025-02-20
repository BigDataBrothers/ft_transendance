from django.views.generic import CreateView
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.contrib.auth.forms import AuthenticationForm
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.files.storage import default_storage
from django.views.decorators.http import require_POST
from django.http import JsonResponse

import requests
import secrets
import uuid
import json

from .models import Profile, Achievement
from .forms import AchievementForm, LoginForm, SignupForm
from urllib.parse import urlencode

User = get_user_model()

class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

@login_required
def profile_view(request):
    user_profile = get_object_or_404(Profile, user=request.user)

    if request.method == 'POST':
        start_color = request.POST.get('startColor')
        end_color = request.POST.get('endColor')

        if start_color and end_color:
            user_profile.profile_gradient_start = start_color
            user_profile.profile_gradient_end = end_color
            user_profile.save()
            return JsonResponse({'success': True})

    context = {
        'user': request.user,
        'user_profile': user_profile,
        'friends': user_profile.friends.all(),
    }
    return render(request, 'profile.html', context)

@login_required
def add_achievement(request):
    if request.method == 'POST':
        form = AchievementForm(request.POST)
        if form.is_valid():
            achievement = form.cleaned_data['achievement']
            user_profile = get_object_or_404(Profile, user=request.user)
            user_profile.achievements.add(achievement)
            messages.success(request, 'Achievement added successfully.')
            return redirect('profile')
    else:
        form = AchievementForm()
    return render(request, 'add_achievement.html', {'form': form})

@login_required
def add_friend(request, username):
    try:
        friend_user = User.objects.get(username=username)
        friend_profile = Profile.objects.get(user=friend_user)
        current_user_profile = Profile.objects.get(user=request.user)
        
        if friend_profile not in current_user_profile.friends.all():
            current_user_profile.friends.add(friend_profile)
            messages.success(request, f'{username} has been added to your friends')
        else:
            messages.info(request, f'{username} is already in your friends list')
    
    except User.DoesNotExist:
        messages.error(request, 'User not found')
    except Profile.DoesNotExist:
        messages.error(request, 'Profile not found')

    return redirect('profile')

@login_required
def remove_friend(request, username):
    if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        try:
            # Récupérer l'utilisateur correspondant au nom d'utilisateur
            friend_user = User.objects.get(username=username)
            # Récupérer le profil de l'ami
            friend_profile = Profile.objects.get(user=friend_user)
            # Récupérer le profil de l'utilisateur actuel
            current_user_profile = request.user.profile
            # Supprimer l'ami de la liste d'amis
            current_user_profile.friends.remove(friend_profile)
            return JsonResponse({'success': True})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'})
        except Profile.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Profile not found'})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required
def get_notifications(request):
    notifications = request.user.notifications.all().order_by('-created_at')[:5]
    return JsonResponse({
        'notifications': [{
            'message': notif.message,
            'type': notif.type,
            'created_at': notif.created_at.strftime('%Y-%m-%d %H:%M')
        } for notif in notifications]
    })

def home(request):
    return render(request, 'home.html')

def api_home(request):
    """Retourne les données de la page d'accueil pour la SPA."""
    
    if request.user.is_authenticated:
        # Données pour un utilisateur connecté
        user_profile = {
            "games_played": 42,
            "win_rate": 75.3
        }

        featured_games = [
            {"title": "Game 1", "image": "/static/images/game1.jpg"},
            {"title": "Game 2", "image": "/static/images/game2.jpg"},
            {"title": "Game 3", "image": "/static/images/game3.jpg"}
        ]

        recent_activity = [
            {"user": "User1", "action": "achieved a new high score in Game 1."},
            {"user": "User2", "action": "completed all levels in Game 2."},
            {"user": "User3", "action": "joined the platform."}
        ]

        data = {
            "is_authenticated": True,
            "username": request.user.username,
            "user_profile": user_profile,
            "featured_games": featured_games,
            "recent_activity": recent_activity
        }
        return JsonResponse(data)
    
    else:
        # Si l'utilisateur n'est pas connecté, renvoyer un message d'erreur ou un message standard
        data = {
            "is_authenticated": False,
            "message": "You are not logged in. Log in here."
        }
        return JsonResponse(data)


def login_view(request):
    if request.headers.get('HX-Request') or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'accounts/login.html')  # Retourne juste le contenu HTML
    return render(request, 'base.html')  # Sinon, charge tout le template avec base.html


# Extrait de views.py
@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return JsonResponse({'success': True})
        return JsonResponse({'success': False, 'error': 'Invalid credentials'})

    return JsonResponse({'error': 'Invalid method'}, status=405)

@csrf_exempt
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True, 'message': 'Déconnexion réussie'})
    return JsonResponse({'error': 'Méthode non autorisée'}, status=405)

def login_page(request):
    form = LoginForm()
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
            )
            if user is not None:
                login(request, user)
                user.online = True
                user.save()
                messages.success(request, 'You are successfully logged in.')
                return redirect('home')
            else:
                messages.error(request, 'Invalid credentials.')
    return render(
        request, 'accounts/login.html', context={'form': form}
    )

@csrf_exempt
@require_POST
def signup_view(request):
    username = request.POST.get('username')
    email = request.POST.get('email')
    first_name = request.POST.get('first_name')
    last_name = request.POST.get('last_name')
    password = request.POST.get('password')
    confirm_password = request.POST.get('confirm_password')
    avatar = request.FILES.get('profile_photo')

    if password != confirm_password:
        return JsonResponse({'detail': 'Les mots de passe ne correspondent pas.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'detail': 'Nom d\'utilisateur déjà pris.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password, first_name=first_name, last_name=last_name)

    if avatar:
        filename = default_storage.save(f'avatars/{user.username}/{avatar.name}', avatar)
        print("Avatar sauvegardé à :", filename)

    return JsonResponse({'detail': 'Inscription réussie !', 'redirect_url': reverse_lazy('login')}, status=201)

# def signup(request):
#     if request.method == 'POST':
#         form = SignupForm(request.POST, request.FILES)  # Assurez-vous que request.FILES est inclus pour les fichiers
#         if form.is_valid():
#             # Créer un nouvel utilisateur
#             user = form.save(commit=False)
#             user.set_password(form.cleaned_data['password1'])  # Gère le mot de passe
#             user.save()
            
#             return JsonResponse({'success': True, 'message': 'Inscription réussie!'})
#         else:
#             return JsonResponse({'success': False, 'errors': form.errors}, status=400)
#     return JsonResponse({'success': False, 'errors': 'Méthode de requête invalide'}, status=400)


def generate_random_state():
    return secrets.token_urlsafe(32)

def initiate_42_auth(request):
    """Step 1: Redirect to 42 authorization"""
    state = generate_random_state()
    request.session['oauth_state'] = state

    auth_params = {
        'client_id': settings.FT_CLIENT_ID,
        'redirect_uri': settings.FT_REDIRECT_URI,
        'response_type': 'code',
        'scope': 'public',
        'state': state
    }

    auth_url = f"{settings.AUTHORIZE_URL}?{urlencode(auth_params)}"
    return redirect(auth_url)

def callback_view(request):
    """Step 2: Process the callback and exchange the code"""
    try:
        # State verification for security
        state = request.GET.get('state')
        if state != request.session.get('oauth_state'):
            messages.error(request, 'Invalid authentication state')
            return redirect('login')

        # Retrieve the code
        code = request.GET.get('code')
        if not code:
            messages.error(request, 'No authentication code received')
            return redirect('login')

        # Exchange the code for a token
        token_response = requests.post(
            settings.TOKEN_URL,
            data={
                'grant_type': 'authorization_code',
                'client_id': settings.FT_CLIENT_ID,
                'client_secret': settings.FT_CLIENT_SECRET,
                'code': code,
                'redirect_uri': settings.FT_REDIRECT_URI,
            }
        )

        if not token_response.ok:
            messages.error(request, 'Failed to retrieve authentication token')
            return redirect('login')

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        # Use the token to retrieve user information
        user_response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if not user_response.ok:
            messages.error(request, 'Failed to retrieve user information')
            return redirect('login')

        user_data = user_response.json()

        try:
            user = User.objects.get(username=user_data['login'])
        except User.DoesNotExist:
            user = User.objects.create_user(
                username=user_data['login'],
                email=user_data['email'],
                password=None,
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', '')
            )
            user.set_unusable_password()
            user.is_42_user = True
            user.is_staff = user_data.get('staff?', False)
            user.intra_profile_url = user_data.get('url')
            user.save()

        # Update profile photo
        if 'image' in user_data and 'link' in user_data['image']:
            try:
                image_response = requests.get(user_data['image']['link'])
                if image_response.ok:
                    from django.core.files.base import ContentFile
                    image_name = f"avatar_{user.username}.jpg"
                    user.profile_photo.save(
                        image_name,
                        ContentFile(image_response.content),
                        save=True
                    )
            except Exception as e:
                messages.warning(request, f'Could not download profile photo: {e}')

        # Log in the user
        user.online = True
        user.save()
        Profile.objects.get_or_create(user=user)
        login(request, user)
        messages.success(request, 'You have successfully logged in via 42.')
        return redirect('home')

    except Exception as e:
        messages.error(request, f'Authentication failed: {e}')
        return redirect('login')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def save_profile_colors(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        start_color = data.get('startColor')
        end_color = data.get('endColor')

        if request.user.is_authenticated:
            profile = request.user.profile
            profile.profile_gradient_start = start_color
            profile.profile_gradient_end = end_color
            profile.save()
            return JsonResponse({'success': True})

    return JsonResponse({'success': False})


def home_vue(request):
    return render(request, 'home.html')

def profile_vue(request):
    return render(request, 'profile.html')

def login_vue(request):
    return render(request, 'login.html')

def api_check_auth(request):
    return JsonResponse({'is_authenticated': request.user.is_authenticated})
