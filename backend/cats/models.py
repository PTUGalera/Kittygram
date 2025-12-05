from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Achievement(models.Model):
    name = models.CharField(max_length=64)

    def __str__(self):
        return self.name


class Cat(models.Model):
    color = models.CharField(max_length=16)
    name = models.CharField(max_length=16)
    birth_year = models.IntegerField()
    achievements = models.ManyToManyField(Achievement,
                                          through='AchievementCat')
    image = models.ImageField(
        upload_to='cats/images/',
        null=True,
        default=None
    )
    owner = models.ForeignKey(
        User, related_name='cats',
        on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name


class AchievementCat(models.Model):
    cat = models.ForeignKey(Cat, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.achievement} {self.cat}'
