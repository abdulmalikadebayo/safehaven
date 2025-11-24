from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Session


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'voice_preference', 'consent', 'created_at']
    list_filter = ['voice_preference', 'consent']
    fieldsets = UserAdmin.fieldsets + (
        ('Voice Settings', {'fields': ('voice_preference', 'consent')}),
    )


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'timestamp', 'voice_used']
    list_filter = ['voice_used', 'timestamp']
    search_fields = ['user__username', 'transcript', 'response_text']
    readonly_fields = ['timestamp']
