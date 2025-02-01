from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from .views import CustomLoginView

import authentification.views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path('auth/password_change/', auth_views.PasswordChangeView.as_view(template_name='registration/password_change.html'), name='password_change'),
    path('auth/password_change/done/', auth_views.PasswordChangeDoneView.as_view(template_name='registration/password_change_done.html'), name='password_change_done'),
    path('auth/login/', 
         CustomLoginView.as_view(), 
         name='login'),
    path("auth/", include("django.contrib.auth.urls")),
    path("", TemplateView.as_view(template_name="home.html"), name="home"),
    path('logout/', authentification.views.logout_user, name='logout'),
    
    # Ajout des routes pour l'authentification 42
    path('auth/42/', authentification.views.initiate_42_auth, name='42_auth'),
    path('callback/', authentification.views.callback_view, name='42_callback'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)