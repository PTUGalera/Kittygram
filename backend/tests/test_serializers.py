import datetime as dt
from django.test import TestCase

# Импортируем модель User через get_user_model для надежности
from django.contrib.auth import get_user_model
from cats.models import Achievement, Cat
from cats.serializers import CatSerializer

User = get_user_model()


class CatSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(username="test_user")
        self.achievement = Achievement.objects.create(name="Поймать мышку")

        self.cat = Cat.objects.create(
            name="Мурзик", birth_year=2020, color="#000000", owner=self.user
        )
        self.cat.achievements.add(self.achievement)

    def test_cat_serializer_contains_expected_fields(self):
        """Тест: Сериализатор возвращает все необходимые поля."""
        serializer = CatSerializer(instance=self.cat)
        data = serializer.data
        expected_fields = {
            "id",
            "name",
            "color",
            "birth_year",
            "achievements",
            "owner",
            "age",
            "image",
            "image_url",
        }
        self.assertEqual(set(data.keys()), expected_fields)

    def test_hex2name_color_field_representation(self):
        """Тест: Поле color преобразует hex-код в название цвета при чтении."""
        serializer = CatSerializer(instance=self.cat)
        self.assertEqual(serializer.data["color"], "black")

    def test_hex2name_color_field_internal_value(self):
        """Тест: Поле color преобразует название цвета в hex-код при записи."""
        data = {
            "name": "Васька",
            "birth_year": 2021,
            "color": "white",
            "achievements": [],
        }
        serializer = CatSerializer(data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        self.assertEqual(serializer.validated_data["color"], "#ffffff")

    def test_age_field_calculation(self):
        """Тест: Поле age вычисляется корректно."""
        serializer = CatSerializer(instance=self.cat)
        current_year = dt.datetime.now().year
        expected_age = current_year - self.cat.birth_year
        self.assertEqual(serializer.data["age"], expected_age)

    def test_cat_serializer_create_with_achievements(self):
        """Тест: Создание кота с новыми достижениями через сериализатор."""
        data = {
            "name": "Барсик",
            "birth_year": 2022,
            "color": "red",
            "achievements": [
                # ИСПОЛЬЗУЕМ КЛЮЧ achievement_name ВМЕСТО name
                {"achievement_name": "Спать весь день"},
                {"achievement_name": "Поймать мышку"},
            ],
        }
        serializer = CatSerializer(data=data)
        # Добавляем msg=serializer.errors, чтобы видеть причину ошибки в консоли, если она возникнет
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)

        cat = serializer.save(owner=self.user)

        self.assertEqual(Cat.objects.count(), 2)
        self.assertEqual(cat.achievements.count(), 2)

        achievement_names = [a.name for a in cat.achievements.all()]
        self.assertIn("Спать весь день", achievement_names)
        self.assertIn("Поймать мышку", achievement_names)

    def test_cat_serializer_update_achievements(self):
        """Тест: Обновление списка достижений кота."""
        # Создаем достижение заранее, чтобы проверить, что оно подцепится по имени
        Achievement.objects.create(name="Прыгнуть выше головы")

        data = {
            "name": "Мурзик",
            "birth_year": 2020,
            "color": "black",
            "achievements": [
                # ИСПОЛЬЗУЕМ КЛЮЧ achievement_name ВМЕСТО name
                {"achievement_name": "Прыгнуть выше головы"}
            ],
        }

        serializer = CatSerializer(instance=self.cat, data=data)
        self.assertTrue(serializer.is_valid(), msg=serializer.errors)
        cat = serializer.save()

        self.assertEqual(cat.achievements.count(), 1)
        self.assertEqual(cat.achievements.first().name, "Прыгнуть выше головы")

    def test_validation_invalid_color_name(self):
        """Тест: Ошибка при передаче несуществующего имени цвета."""
        data = {
            "name": "Рыжик",
            "birth_year": 2019,
            "color": "not_a_real_color_name",
            "achievements": [],
        }
        serializer = CatSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("color", serializer.errors)

    def test_validation_required_fields(self):
        """Тест: Ошибка при отсутствии обязательных полей."""
        data = {"color": "black"}
        serializer = CatSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)
        self.assertIn("birth_year", serializer.errors)
