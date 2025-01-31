from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.conf import settings
from urllib.parse import urlencode
from authentification.models import User
import secrets
import requests
from urllib.parse import urlencode
# Create your views here.
# authentication/views.py
from django.contrib.auth import login, authenticate, logout
# import des fonctions login et authenticate
from . import forms

def logout_user(request):

    logout(request)
    return HttpResponse(status=204)

def login_page(request):
    form = forms.LoginForm()
    message = ''

    if request.method == 'POST':
        form = forms.LoginForm(request.POST)
        if form.is_valid():
            user = authenticate(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
            )
            if user is not None:
                login(request, user)
                user.online = True
                user.save()
                message = f'Bonjour, {user.username}! Vous êtes connecté.'

            else:
                message = 'Identifiants invalides.'
    return render(
        request, 'authentification/login.html', context={'form': form, 'message': message})

def signup_page(request):
    form = forms.SignupForm()
    if request.method == 'POST':
        form = forms.SignupForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            # auto-login user
            login(request, user)
            return redirect('login')
    return render(request, 'authentification/signup.html', context={'form': form})

def generate_random_state():
    return secrets.token_urlsafe(32)

def initiate_42_auth(request):
    """Étape 1: Redirection vers l'autorisation 42"""
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
    """Étape 2: Traitement du callback et échange du code"""
    try:
        # Vérification du state pour la sécurité
        state = request.GET.get('state')
        if state != request.session.get('oauth_state'):
            print("État invalide")
            return redirect('login')

        # Récupération du code
        code = request.GET.get('code')
        if not code:
            print("Pas de code reçu")
            return redirect('login')

        # Échange du code contre un token
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

        print("Token response:", token_response.text)  # Debug
        if not token_response.ok:
            print(f"Erreur token: {token_response.status_code}")
            return redirect('login')

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        # Utilisation du token pour récupérer les informations utilisateur
        user_response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        print("User response:", user_response.text)  # Debug
        if not user_response.ok:
            print(f"Erreur user data: {user_response.status_code}")
            return redirect('login')

        user_data = user_response.json()
        print("User data:", user_data)  # Debug

        # Création de l'utilisateur avec un mot de passe aléatoire
        from django.contrib.auth.hashers import make_password
        import uuid

        try:
            user = User.objects.get(username=user_data['login'])
            print(f"Utilisateur existant trouvé: {user.username}")
        except User.DoesNotExist:
            print("Création d'un nouvel utilisateur")
            user = User.objects.create_user(
                username=user_data['login'],
                email=user_data['email'],
                password=None,
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', '')
            )
            user.set_unusable_password()

            # Ajout des informations spécifiques 42
            user.is_42_user = True
            user.is_staff = user_data.get('staff?', False)
            user.intra_profile_url = user_data.get('url')

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
                print(f"Erreur lors du traitement de l'image: {e}")

        # Connexion de l'utilisateur
        user.online = True
        user.save()

        # Login direct sans authentification par mot de passe
        login(request, user)
        print(f"Utilisateur {user.username} connecté avec succès")
        return redirect('home')

    except Exception as e:
        print(f"Erreur générale: {e}")
        return redirect('login')