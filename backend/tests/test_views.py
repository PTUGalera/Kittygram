from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from cats.models import Achievement, Cat
from django.contrib.auth import get_user_model


class CatViewSetTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="testcatowner", password="supersecret123"
        )
        # Получаем токен через Djoser
        response = self.client.post(
            "/api/token/login/",
            {"username": "testcatowner", "password": "supersecret123"},
        )
        self.token = response.data["auth_token"]
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token)

        self.cat_data = {
            "name": "Мурзик",
            "color": "#ffffff",
            "birth_year": 2020,
        }

    def test_create_cat_unauthenticated(self):
        """Создание кота без авторизации запрещено"""
        self.client.force_authenticate(user=None)
        url = reverse("cat-list")
        response = self.client.post(url, self.cat_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_cats(self):
        """Список котов возвращается с пагинацией"""
        Cat.objects.create(
            name="Барсик", color="#000000", birth_year=2021, owner=self.user
        )
        Cat.objects.create(
            name="Рыжик", color="#ff0000", birth_year=2019, owner=self.user
        )

        url = reverse("cat-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)
        self.assertEqual(len(response.data["results"]), 2)

    def test_delete_own_cat(self):
        """Удаление своего кота разрешено"""
        cat = Cat.objects.create(
            name="Пушок", color="#cccccc", birth_year=2021, owner=self.user
        )
        url = reverse("cat-detail", kwargs={"pk": cat.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Cat.objects.count(), 0)


class AchievementViewSetTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            username="achiever", password="supersecret123"
        )
        # Авторизация через токен
        resp = self.client.post(
            "/api/token/login/", {"username": "achiever", "password": "supersecret123"}
        )
        self.client.credentials(HTTP_AUTHORIZATION="Token " + resp.data["auth_token"])

        self.ach_data = {"name": "Чемпион мира по мурлыканью"}

    def test_create_achievement(self):
        """Успешное создание достижения, в ответе поле achievement_name"""
        url = reverse("achievement-list")
        data = {"achievement_name": "Чемпион по красоте"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["achievement_name"], "Чемпион по красоте")
        self.assertEqual(Achievement.objects.count(), 1)

    def test_list_achievements(self):
        """Получение списка достижений без пагинации"""
        Achievement.objects.create(name="Золото")
        Achievement.objects.create(name="Серебро")
        response = self.client.get(reverse("achievement-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["achievement_name"], "Золото")

    def test_retrieve_achievement(self):
        """Получение одного достижения по id"""
        ach = Achievement.objects.create(name="Самый пушистый")
        url = reverse("achievement-detail", args=[ach.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["achievement_name"], "Самый пушистый")

    def test_update_achievement(self):
        """Полное обновление достижения через PUT"""
        ach = Achievement.objects.create(name="Старое название")
        url = reverse("achievement-detail", args=[ach.id])
        data = {"achievement_name": "Новое эпичное название"}
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ach.refresh_from_db()
        self.assertEqual(ach.name, "Новое эпичное название")
        self.assertEqual(response.data["achievement_name"], "Новое эпичное название")

    def test_delete_achievement(self):
        """Удаление достижения"""
        ach = Achievement.objects.create(name="Временное достижение")
        url = reverse("achievement-detail", args=[ach.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Achievement.objects.count(), 0)
