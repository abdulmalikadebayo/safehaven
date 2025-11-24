from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Message, Session, User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = [
        "username",
        "full_name",
        "email",
        "voice_preference",
        "consent",
        "created_at",
    ]
    list_filter = ["voice_preference", "consent"]
    search_fields = ["username", "full_name", "email"]
    fieldsets = UserAdmin.fieldsets + (
        (
            "Profile",
            {"fields": ("full_name", "voice_preference", "consent", "created_at")},
        ),
    )
    readonly_fields = ["created_at"]


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ["user", "started_at", "updated_at", "message_count"]
    list_filter = ["started_at"]
    search_fields = ["user__username", "user__full_name", "title"]
    readonly_fields = ["started_at", "updated_at"]

    def message_count(self, obj):
        return obj.messages.count()

    message_count.short_description = "Messages"


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["user_full_name", "user", "session", "role", "text_preview", "voice_used", "timestamp"]
    list_filter = ["role", "voice_used", "timestamp", "user"]
    search_fields = ["text", "user_full_name", "session__user__username", "user__username", "user__full_name"]
    readonly_fields = ["timestamp"]

    def text_preview(self, obj):
        return obj.text[:50] + "..." if len(obj.text) > 50 else obj.text

    text_preview.short_description = "Text"
