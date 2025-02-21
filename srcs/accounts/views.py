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
from accounts.models import Profile, Notification
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.files.storage import default_storage
from django.views.decorators.http import require_POST
from django.http import JsonResponse, HttpResponseRedirect

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
    """Retourne les données du profil utilisateur pour la SPA."""
    profile = request.user.profile

    profile_data = {
        "is_authenticated": True,
        "username": request.user.username,
        "email": request.user.email,
        "profile_photo": request.user.profile_photo.url if request.user.profile_photo else None,
        "level": profile.level,
        "games_played": profile.games_played,
        "win_rate": profile.win_rate,
        "total_score": profile.total_score,
        "last_played_game": profile.last_played_game,
        "time_played": profile.time_played,
        "profile_gradient_start": profile.profile_gradient_start,
        "profile_gradient_end": profile.profile_gradient_end,
        "achievements": [
            {"name": achievement.name, "icon": achievement.icon}
            for achievement in profile.achievements.all()
        ],
        "friends": [
            {"username": friend.user.username, "profile_photo": friend.user.profile_photo.url if friend.user.profile_photo else None}
            for friend in profile.friends.all()
        ],
        "notifications": [
            {"message": notification.message, "type": notification.type, "created_at": notification.created_at.strftime('%Y-%m-%d %H:%M:%S')}
            for notification in profile.notifications.all()
        ]
    }

    return JsonResponse(profile_data)


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
    """Retourne les données de la page d'accueil pour la SPA avec les vraies infos utilisateur."""

    if request.user.is_authenticated:
        # Récupérer le profil lié à l'utilisateur
        profile = request.user.profile

        # Construire le profil utilisateur à partir des données réelles
        user_profile = {
            "games_played": profile.games_played,
            "win_rate": profile.win_rate,
            "level": profile.level,
            "total_score": profile.total_score,
            "last_played_game": profile.last_played_game,
            "time_played": profile.time_played,
            "achievements": [achievement.name for achievement in profile.achievements.all()]
        }

        # Simuler les jeux populaires (à remplacer plus tard par de vraies données si nécessaire)
        featured_games = [
            {"title": "Game 1", "image": "/static/images/game1.jpg", "url": "/game1"},
            {"title": "Game 2", "image": "/static/images/game2.jpg", "url": "/game2"},
            {"title": "Game 3", "image": "/static/images/game3.jpg", "url": "/game3"}
        ]

        # Activité récente basée sur les notifications
        recent_activity = [
            f"{notif.user.username} - {notif.message}"
            for notif in Notification.objects.filter(user=request.user).order_by('-created_at')[:5]
        ]

        # Données à retourner
        data = {
            "is_authenticated": True,
            "username": request.user.username,
            "profile_photo": request.user.profile_photo.url,  # Photo de profil
            "user_profile": user_profile,
            "featured_games": featured_games,
            "recent_activity": recent_activity
        }
        return JsonResponse(data)

    else:
        # Si l'utilisateur n'est pas connecté
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
    return HttpResponseRedirect(auth_url)

from django.shortcuts import redirect

def callback_view(request):
    try:
        state = request.GET.get('state')
        if state != request.session.get('oauth_state'):
            return JsonResponse({'success': False, 'error': 'Invalid authentication state'})

        code = request.GET.get('code')
        if not code:
            return JsonResponse({'success': False, 'error': 'No authentication code received'})

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
            return JsonResponse({'success': False, 'error': 'Failed to retrieve authentication token'})

        access_token = token_response.json().get('access_token')

        user_response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if not user_response.ok:
            return JsonResponse({'success': False, 'error': 'Failed to retrieve user information'})

        user_data = user_response.json()

        # Création ou récupération de l'utilisateur
        user, created = User.objects.get_or_create(
            username=user_data['login'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data.get('first_name', ''),
                'last_name': user_data.get('last_name', ''),
                'is_42_user': True,
                'intra_profile_url': user_data.get('url'),
            }
        )
        if created:
            user.set_unusable_password()
            user.save()

        # Mise à jour de la photo de profil
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
                print(f"Photo de profil non téléchargée : {e}")

        # Connexion de l'utilisateur
        login(request, user)
        user.online = True
        user.save()
        Profile.objects.get_or_create(user=user)

        # ✅ Redirection vers la page d'accueil
        return redirect('/')

    except Exception as e:
        return JsonResponse({'success': False, 'error': f'Authentication failed: {e}'})


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
