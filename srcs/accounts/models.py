from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Achievement(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    level = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    win_rate = models.FloatField(default=0.0)
    total_score = models.IntegerField(default=0)
    friends = models.ManyToManyField('self', symmetrical=False, related_name='friends_set')
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    last_played_game = models.CharField(max_length=100, blank=True, null=True)
    time_played = models.FloatField(default=0.0)
    achievements = models.ManyToManyField(Achievement, related_name='profiles')

    def __str__(self):
        return self.user.username

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
