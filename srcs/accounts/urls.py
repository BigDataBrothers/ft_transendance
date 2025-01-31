from django.urls import path
from .views import SignUpView, profile_view, add_achievement

app_name = 'accounts'

urlpatterns = [
    path("signup/", SignUpView.as_view(), name="signup"),
    path("profile/", profile_view, name="profile"),
    path("add_achievement/", add_achievement, name="add_achievement"),
]
