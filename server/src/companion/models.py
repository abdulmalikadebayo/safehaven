from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """User model with voice preferences"""

    VOICE_CHOICES = [
        ("idera", "Idera - Melodic, gentle"),
        ("emma", "Emma - Authoritative, deep"),
        ("zainab", "Zainab - Soothing, gentle"),
        ("osagie", "Osagie - Smooth, calm"),
        ("wura", "Wura - Young, sweet"),
        ("jude", "Jude - Warm, confident"),
        ("chinenye", "Chinenye - Engaging, warm"),
        ("tayo", "Tayo - Upbeat, energetic"),
        ("regina", "Regina - Mature, warm"),
        ("femi", "Femi - Rich, reassuring"),
        ("adaora", "Adaora - Warm, engaging"),
        ("umar", "Umar - Calm, smooth"),
        ("mary", "Mary - Energetic, youthful"),
        ("nonso", "Nonso - Bold, resonant"),
        ("remi", "Remi - Melodious, warm"),
        ("adam", "Adam - Deep, clear"),
    ]

    voice_preference = models.CharField(
        max_length=50, choices=VOICE_CHOICES, default="tayo"
    )
    consent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Session(models.Model):
    """Session log for voice interactions"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sessions")
    timestamp = models.DateTimeField(auto_now_add=True)
    transcript = models.TextField()
    response_text = models.TextField()
    voice_used = models.CharField(max_length=50)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.user.username} - {self.timestamp}"
