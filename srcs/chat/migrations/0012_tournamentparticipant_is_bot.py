# Generated by Django 5.1.4 on 2025-04-08 20:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0011_alter_tournament_creator'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournamentparticipant',
            name='is_bot',
            field=models.BooleanField(default=False),
        ),
    ]
