from rest_framework import serializers
from .models import User, Session


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'voice_preference', 'locale', 'consent']
        read_only_fields = ['id']


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'user', 'timestamp', 'transcript', 'response_text', 'voice_used']
        read_only_fields = ['id', 'timestamp']
