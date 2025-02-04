from django.db.models.signals import post_save
from django.dispatch import receiver
from authentification.models import User
from .models import Profile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    print(f"Signal create_user_profile appelé pour {instance.username}")
    if created:
        try:
            Profile.objects.get_or_create(user=instance)
            print(f"Profil créé pour {instance.username}")
        except Exception as e:
            print(f"Erreur lors de la création du profil : {e}")

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    print(f"Signal save_user_profile appelé pour {instance.username}")
    try:
        # S'assurer que le profil existe
        profile, created = Profile.objects.get_or_create(user=instance)
        profile.save()
        print(f"Profil sauvegardé pour {instance.username}")
    except Exception as e:
        print(f"Erreur lors de la sauvegarde du profil : {e}")