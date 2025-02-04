from django.urls import path
from .views import SignUpView, profile_view, add_achievement
from django.conf import settings
from django.conf.urls.static import static

import authentification.views

from . import views 

app_name = 'accounts'

urlpatterns = [
    path("signup/", authentification.views.signup_page, name="signup"),
    path("profile/", profile_view, name="profile"),
    path("add_achievement/", add_achievement, name="add_achievement"),
    path('api/', authentification.views.initiate_42_auth, name='api'),
    path('callback/', authentification.views.callback_view, name='callback'),
    path('add_friend/<str:username>/', views.add_friend, name='add_friend'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
