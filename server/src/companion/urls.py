from django.urls import path
from .views import VoiceInputView, UserProfileView, SessionHistoryView

urlpatterns = [
    path('voice_input/', VoiceInputView.as_view(), name='voice_input'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('sessions/', SessionHistoryView.as_view(), name='session_history'),
]
