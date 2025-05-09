# Generated by Django 5.1.4 on 2025-02-14 22:22

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_remove_directmessage_receiver_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='is_game_invite',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterUniqueTogether(
            name='gameinvite',
            unique_together={('sender', 'recipient', 'status')},
        ),
        migrations.AddIndex(
            model_name='gameinvite',
            index=models.Index(fields=['sender', 'recipient', 'status'], name='chat_gamein_sender__a32b23_idx'),
        ),
    ]
