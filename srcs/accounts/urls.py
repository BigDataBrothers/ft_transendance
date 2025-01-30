from django.urls import path
from .views import SignUpView, profile_view

app_name = 'accounts'

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("profile/", profile_view, name="profile"),
]
