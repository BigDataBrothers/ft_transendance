from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from .views import CustomLoginView

import accounts.views

urlpatterns = [
    path('admin/',
        admin.site.urls),
    path("accounts/",
        include("accounts.urls")),
    path('auth/password_change/',
        auth_views.PasswordChangeView.as_view(template_name='registration/password_change.html'),
        name='password_change'),
    path('auth/password_change/done/',
         auth_views.PasswordChangeDoneView.as_view(template_name='registration/password_change_done.html'), name='password_change_done'),
    path('accounts/login/', 
         accounts.views.login_page, 
         name='login'),
    path("",
        TemplateView.as_view(template_name="home.html"),
        name="home"),
    path('logout/',
        accounts.views.logout_user,
        name='logout'),
    




    
    # Ajout des routes pour l'auth 42
    path('auth/42/', accounts.views.initiate_42_auth, name='42_auth'),
    path('callback/', accounts.views.callback_view, name='42_callback'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)