from django.contrib.auth import login, authenticate, logout
from django.shortcuts import render, redirect
from authentification.models import User
from django.http import HttpResponse
from django.contrib import messages
from urllib.parse import urlencode
from django.conf import settings
import requests
import secrets
from . import forms

# class CustomLoginView(LoginView):
#     template_name = 'authentification/login.html'

#     def form_valid(self, form):
#         response = super().form_valid(form)
#         messages.success(self.request, 'You are successfully logged in.')
#         return response

#     def form_invalid(self, form):
#         messages.error(self.request, 'Invalid credentials.')
#         return self.render_to_response(self.get_context_data(form=form))

def logout_user(request):
    logout(request)
    messages.success(request, 'You have been successfully logged out.')
    return redirect('home')

def login_page(request):
    form = forms.LoginForm()
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
                messages.success(request, 'You are successfully logged in.')
                return redirect('home')  # Redirect to the home page
            else:
                messages.error(request, 'Invalid credentials.')
    return render(
        request, 'authentification/login.html', context={'form': form}
    )

def signup_page(request):
    form = forms.SignupForm()
    if request.method == 'POST':
        form = forms.SignupForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            # auto-login user
            login(request, user)
            messages.success(request, 'Your account has been created successfully.')
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
    """Step 2: Process the callback and exchange the code"""
    try:
        # State verification for security
        state = request.GET.get('state')
        if state != request.session.get('oauth_state'):
            print("Invalid state")
            return redirect('login')

        # Retrieve the code
        code = request.GET.get('code')
        if not code:
            print("No code received")
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

        print("Token response:", token_response.text)  # Debug
        if not token_response.ok:
            print(f"Token error: {token_response.status_code}")
            return redirect('login')

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        # Use the token to retrieve user information
        user_response = requests.get(
            'https://api.intra.42.fr/v2/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )

        print("User response:", user_response.text)  # Debug
        if not user_response.ok:
            print(f"User data error: {user_response.status_code}")
            return redirect('login')

        user_data = user_response.json()
        print("User data:", user_data)  # Debug

        # Create the user with a random password
        from django.contrib.auth.hashers import make_password
        import uuid

        try:
            user = User.objects.get(username=user_data['login'])
            print(f"Existing user found: {user.username}")
        except User.DoesNotExist:
            print("Creating a new user")
            user = User.objects.create_user(
                username=user_data['login'],
                email=user_data['email'],
                password=None,
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', '')
            )
            user.set_unusable_password()

            # Add 42-specific information
            user.is_42_user = True
            user.is_staff = user_data.get('staff?', False)
            user.intra_profile_url = user_data.get('url')

            user.save()

        # Update the profile photo
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
                print(f"Error processing image: {e}")

        # Log in the user
        user.online = True
        user.save()

        # Direct login without password authentication
        login(request, user)
        messages.success(request, 'You have successfully logged in via 42.')
        print(f"User {user.username} logged in successfully")
        return redirect('home')

    except Exception as e:
        print(f"General error: {e}")
        return redirect('login')
