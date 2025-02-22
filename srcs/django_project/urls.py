from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static
from .views import CustomLoginView
import accounts.views

urlpatterns = [
    path('admin/', admin.site.urls),
    path("accounts/", include("accounts.urls")),
    path('auth/password_change/', accounts.views.PasswordChangeAPIView.as_view(), name='password_change'),
    path('auth/password_change/done/', accounts.views.PasswordChangeDoneAPIView.as_view(), name='password_change_done'),

    # API routes
    path('api/login/', accounts.views.api_login, name='api_login'),
    path('login/', accounts.views.login_view, name='login'),
    path('', accounts.views.home, name='home'),
    path('api/home/', accounts.views.api_home, name='api_home'),
    path('api/signup/', accounts.views.signup_view, name='signup_api'),
    path('logout/', accounts.views.logout_user, name='logout'),
    path('api/check-auth/', accounts.views.api_check_auth, name='api_check_auth'),
    path('api/42/', accounts.views.initiate_42_auth, name='initiate_42_auth'),
    path('callback/', accounts.views.callback_view, name='callback_42'),
    path('api/profile/', accounts.views.profile_view, name='profile_view'),
    path('debug-photo/', accounts.views.debug_profile_photo, name='debug_photo'),

    # Route catch-all pour la SPA
    # re_path(r'^(?!api|admin|accounts|auth|login|logout|callback).*$',
    #     TemplateView.as_view(template_name='base.html'), name='spa_catch_all'),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
