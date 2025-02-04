from django.views.generic import CreateView
from django.contrib.auth.views import LoginView
from django.urls import reverse_lazy
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required


from .models import Profile, Achievement, User
from .forms import AchievementForm
from django.contrib import messages

from django.contrib.auth import get_user_model
User = get_user_model()

class SignUpView(CreateView):
    form_class = UserCreationForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"

@login_required
def profile_view(request):
    user_profile = Profile.objects.get(user=request.user)
    context = {
        'user_profile': user_profile,
    }
    return render(request, 'profile.html', context)

@login_required
def add_achievement(request):
    if request.method == 'POST':
        form = AchievementForm(request.POST)
        if form.is_valid():
            achievement = form.cleaned_data['achievement']
            user_profile = get_object_or_404(Profile, user=request.user)
            user_profile.achievements.append(achievement)
            user_profile.save()
            return redirect('profile')
    else:
        form = AchievementForm()
    return render(request, 'add_achievement.html', {'form': form})

@login_required
def add_friend(request, username):
    try:
        # Trouver le profil de l'utilisateur à ajouter
        friend_user = User.objects.get(username=username)
        friend_profile = Profile.objects.get(user=friend_user)
        
        # Trouver le profil de l'utilisateur connecté
        current_user_profile = Profile.objects.get(user=request.user)
        
        # Vérifier que ce n'est pas déjà un ami
        if friend_profile not in current_user_profile.friends_set.all():
            # Ajouter l'ami
            current_user_profile.friends_set.add(friend_profile)
            messages.success(request, f'{username} a été ajouté à vos amis')
        else:
            messages.info(request, f'{username} est déjà dans votre liste d\'amis')
    
    except User.DoesNotExist:
        messages.error(request, 'Utilisateur non trouvé')
    except Profile.DoesNotExist:
        messages.error(request, 'Profil non trouvé')

    return redirect('profile')



# def settings_view(request):
#     return render(request, 'settings.html')