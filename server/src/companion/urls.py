from django.urls import path

from .auth_views import LoginView, MeView, RegisterView
from .views import SessionHistoryView, UserProfileView, VoiceInputView

urlpatterns = [
    # Authentication
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/me/", MeView.as_view(), name="me"),
    # Voice & Chat
    path("voice_input/", VoiceInputView.as_view(), name="voice_input"),
    path("profile/", UserProfileView.as_view(), name="user_profile"),
    path("sessions/", SessionHistoryView.as_view(), name="session_history"),
]
