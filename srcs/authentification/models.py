from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.


class User(AbstractUser):
    email = models.EmailField(unique=True)
    profile_photo = models.ImageField(
        verbose_name='Avatar',
        upload_to='avatars/',
        default='avatars/default.jpg'
    )
    online = models.BooleanField(default=False)

    # Champs spÃ©cifiques pour les utilisateurs 42
    is_42_user = models.BooleanField(default=False)
    intra_profile_url = models.URLField(max_length=255, null=True, blank=True)
    is_staff = models.BooleanField(default=False)