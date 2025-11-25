from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """User model with voice preferences"""

    VOICE_CHOICES = [
        ("Idera", "Idera - Melodic, gentle"),
        ("Emma", "Emma - Authoritative, deep"),
        ("Zainab", "Zainab - Soothing, gentle"),
        ("Osagie", "Osagie - Smooth, calm"),
        ("Wura", "Wura - Young, sweet"),
        ("Jude", "Jude - Warm, confident"),
        ("Chinenye", "Chinenye - Engaging, warm"),
        ("Tayo", "Tayo - Upbeat, energetic"),
        ("Regina", "Regina - Mature, warm"),
        ("Femi", "Femi - Rich, reassuring"),
        ("Adaora", "Adaora - Warm, engaging"),
        ("Umar", "Umar - Calm, smooth"),
        ("Mary", "Mary - Energetic, youthful"),
        ("Nonso", "Nonso - Bold, resonant"),
        ("Remi", "Remi - Melodious, warm"),
        ("Adam", "Adam - Deep, clear"),
    ]

    full_name = models.CharField(max_length=255, blank=True)
    voice_preference = models.CharField(
        max_length=50, choices=VOICE_CHOICES, default="Chinenye"
    )
    consent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name if self.full_name else self.username


class Session(models.Model):
    """Chat session grouping multiple messages"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    started_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=255, blank=True)  # Optional session title

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} - {self.started_at}"


class Message(models.Model):
    """Individual messages in a chat session"""

    ROLE_CHOICES = [
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="messages"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="messages", null=True, blank=True
    )
    user_full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    text = models.TextField()
    audio_file = models.FileField(upload_to="audio/", null=True, blank=True)
    voice_used = models.CharField(max_length=50, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def save(self, *args, **kwargs):
        # Auto-populate user_full_name from user if not set
        if self.user and not self.user_full_name:
            self.user_full_name = self.user.full_name
        super().save(*args, **kwargs)

    def __str__(self):
        username = self.user.username if self.user else "Anonymous"
        return f"{username} - {self.role}: {self.text[:50]}..."
