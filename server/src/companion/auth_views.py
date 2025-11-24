from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class RegisterView(APIView):
    """Register a new user with just their full name"""

    permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        full_name = request.data.get("full_name", "").strip()

        if not full_name:
            return Response(
                {"error": "Full name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Generate a unique username from full_name
        base_username = full_name.lower().replace(" ", "_")
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        # Create user without password (we'll use token auth)
        user = User.objects.create_user(
            username=username,
            full_name=full_name,
            consent=True,  # Implicit consent by registering
        )
        user.set_unusable_password()  # No password needed
        user.save()

        # Create token for authentication
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "username": user.username,
                    "voice_preference": user.voice_preference,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Login existing user by full name"""

    permission_classes = []  # Allow unauthenticated access

    def post(self, request):
        full_name = request.data.get("full_name", "").strip()

        if not full_name:
            return Response(
                {"error": "Full name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Find user by full_name
        try:
            user = User.objects.get(full_name=full_name)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found. Please register first."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get or create token
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "token": token.key,
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "username": user.username,
                    "voice_preference": user.voice_preference,
                },
            }
        )


class MeView(APIView):
    """Get current user info"""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Not authenticated"}, status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(
            {
                "id": request.user.id,
                "full_name": request.user.full_name,
                "username": request.user.username,
                "voice_preference": request.user.voice_preference,
            }
        )
