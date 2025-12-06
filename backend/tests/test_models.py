from cats.models import Achievement, Cat, AchievementCat
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.db import IntegrityError

User = get_user_model()


class ModelsTestCase(TestCase):
    def setUp(self):
        """Создаём пользователя — он нужен для создания кота"""
        self.user = User.objects.create_user(username="testowner", password="12345")

    def test_achievement_creation(self):
        """Тест: Achievement успешно создаётся и сохраняется в БД"""
        achievement = Achievement.objects.create(name="Прыгать на диван")

        self.assertEqual(Achievement.objects.count(), 1)
        self.assertEqual(achievement.name, "Прыгать на диван")

    def test_cat_creation(self):
        """Тест: Cat успешно создаётся и сохраняется в БД"""
        cat = Cat.objects.create(
            name="Барсик", color="#8e5e5e", birth_year=2020, owner=self.user
        )
        self.assertEqual(Cat.objects.count(), 1)
        self.assertEqual(cat.name, "Барсик")
        self.assertEqual(cat.color, "#8e5e5e")
        self.assertEqual(cat.birth_year, 2020)
        self.assertEqual(cat.owner, self.user)

    def test_achievement_cat_creation(self):
        """Тест: AchievementCat успешно создаётся и сохраняется в БД"""
        achievement = Achievement.objects.create(name="Прыгать на диван")
        cat = Cat.objects.create(
            name="Барсик", color="#8e5e5e", birth_year=2020, owner=self.user
        )

        link = AchievementCat.objects.create(achievement=achievement, cat=cat)
        self.assertEqual(AchievementCat.objects.count(), 1)
        self.assertEqual(link.achievement, achievement)
        self.assertEqual(link.cat, cat)

    def test_try_false_achievement_creation(self):
        """Тест: Achievement не создаётся без обязательного поля name"""
        with self.assertRaises(IntegrityError):
            Achievement.objects.create(name=None)

    def test_cat_cascade_delete_on_user(self):
        """Тест: При удалении User каскадно удаляется связанный Cat"""
        Cat.objects.create(
            name="Барсик", color="#8e5e5e", birth_year=2020, owner=self.user
        )
        self.assertEqual(Cat.objects.count(), 1)
        self.user.delete()
        self.assertEqual(Cat.objects.count(), 0)

    def test_achievement_cascade_delete_on_achievement(self):
        """Тест: При удалении Achievement каскадно удаляется AchievementCat"""
        achievement = Achievement.objects.create(name="Ловец мух")
        cat = Cat.objects.create(
            name="Барсик", color="#8e5e5e", birth_year=2020, owner=self.user
        )
        AchievementCat.objects.create(achievement=achievement, cat=cat)
        self.assertEqual(AchievementCat.objects.count(), 1)
        achievement.delete()
        self.assertEqual(AchievementCat.objects.count(), 0)

    def test_achievement_cat_cascade_delete_on_cat(self):
        """Тест: При удалении Cat каскадно удаляется AchievementCat"""
        achievement = Achievement.objects.create(name="Ловец мух")
        cat = Cat.objects.create(
            name="Барсик", color="#8e5e5e", birth_year=2020, owner=self.user
        )
        AchievementCat.objects.create(achievement=achievement, cat=cat)
        self.assertEqual(AchievementCat.objects.count(), 1)
        cat.delete()
        self.assertEqual(AchievementCat.objects.count(), 0)

    def test_add_achievement_to_cat_via_manytomany(self):
        """Тест: Добавление Achievement к Cat через ManyToMany работает корректно"""
        achievement1 = Achievement.objects.create(name="Прыгун")
        achievement2 = Achievement.objects.create(name="Ловец")
        cat = Cat.objects.create(
            name="Барсик", color="#8e5e5e", birth_year=2020, owner=self.user
        )
        cat.achievements.add(achievement1, achievement2)
        self.assertEqual(cat.achievements.count(), 2)
        self.assertIn(achievement1, cat.achievements.all())
        self.assertIn(achievement2, cat.achievements.all())
        self.assertEqual(AchievementCat.objects.count(), 2)

    def test_cat_birth_year_integer_validation(self):
        """Тест: Cat не создаётся, если birth_year не integer"""
        with self.assertRaises(ValidationError):
            cat = Cat(
                name="Барсик",
                color="#8e5e5e",
                birth_year="двадцать двадцать",
                owner=self.user,
            )
            cat.full_clean()

    def test_cat_birth_year_required(self):
        """Тест: Cat не создаётся без обязательного поля birth_year — вызывает IntegrityError"""
        with self.assertRaises(IntegrityError):
            Cat.objects.create(name="Барсик", color="#8e5e5e", owner=self.user)
