from django import forms
from .models import Achievement

class AchievementForm(forms.Form):
    achievement = forms.ModelChoiceField(queryset=Achievement.objects.all(), label='Achievement')
