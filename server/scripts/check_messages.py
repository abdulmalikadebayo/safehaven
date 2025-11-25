"""Script to check all messages in the database"""
import os
import sys
import django

# Add the project root to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mindvoice_project.settings')
django.setup()

from companion.models import User, Session, Message

def check_messages():
    """Display all messages with user information"""
    
    print("\n" + "="*80)
    print("SAFEHAVEN DATABASE - ALL MESSAGES")
    print("="*80 + "\n")
    
    # Total counts
    total_users = User.objects.count()
    total_sessions = Session.objects.count()
    total_messages = Message.objects.count()
    
    print(f"📊 SUMMARY:")
    print(f"   Users: {total_users}")
    print(f"   Sessions: {total_sessions}")
    print(f"   Messages: {total_messages}\n")
    
    # Get all messages ordered by timestamp
    messages = Message.objects.select_related('user', 'session').order_by('timestamp')
    
    if not messages.exists():
        print("❌ No messages found in database.\n")
        return
    
    print("-"*80)
    
    current_session = None
    
    for msg in messages:
        # Print session header when session changes
        if current_session != msg.session.id:
            current_session = msg.session.id
            print(f"\n🗂️  SESSION #{msg.session.id}")
            print(f"   User: {msg.user.full_name if msg.user else 'Unknown'} (@{msg.user.username if msg.user else 'N/A'})")
            print(f"   Started: {msg.session.started_at.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"   Voice: {msg.session.user.voice_preference if msg.session.user else 'N/A'}")
            print("-"*80)
        
        # Print message
        role_icon = "👤" if msg.role == "user" else "🤖"
        timestamp = msg.timestamp.strftime('%H:%M:%S')
        
        print(f"\n{role_icon} {msg.role.upper()} ({timestamp})")
        print(f"   {msg.text}")
        
        if msg.audio_file:
            print(f"   🎵 Audio: {msg.audio_file.name}")
        
        if msg.voice_used:
            print(f"   🎤 Voice: {msg.voice_used}")
    
    print("\n" + "="*80 + "\n")

if __name__ == "__main__":
    check_messages()
