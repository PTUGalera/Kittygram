from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from cats.models import Achievement, Cat

User = get_user_model()


class UrlsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="testpass")
        self.admin_user = User.objects.create_superuser(username="admin", password="adminpass")

    def test_user_registration(self):
            """Тест: Регистрация нового пользователя возвращает 201"""
            data = {
                "username": "newuser",
                "password": "newpass123"
            }
            response = self.client.post("/api/users/", data, format="json")
            self.assertEqual(response.status_code, 201)
            self.assertIn("username", response.data)

    def test_cats_list_authorized(self):
        """Тест: Авторизованный пользователь получает список котов с 200"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/cats/")
        self.assertEqual(response.status_code, 200)


    def test_achievements_list(self):
        """Тест: Авторизованный пользователь получает список достижений с 200"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/achievements/")
        self.assertEqual(response.status_code, 200)

    def test_achievements_list_authorized(self):
        """Тест: Авторизованный пользователь получает список достижений с 200"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get("/api/achievements/")
        self.assertEqual(response.status_code, 200)

    def test_achievements_create_authorized(self):
        """Тест: Авторизованный пользователь создаёт достижение с 201"""
        self.client.force_authenticate(user=self.user)
        data = {
            "achievement_name": "Прыгать с дивана"
        }
        response = self.client.post("/api/achievements/", data, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["achievement_name"], "Прыгать с дивана")

    def test_cats_list_unauthorized(self):
        """Тест: Неавторизованный пользователь получает 401 при доступе к списку котов"""
        response = self.client.get("/api/cats/")
        self.assertEqual(response.status_code, 401)

    def test_cats_create_unauthorized(self):
        """Тест: Неавторизованный пользователь не может создать кота — 401"""
        data = {
            "name": "Мурзик",
            "color": "#000000",
            "birth_year": 2021
        }
        response = self.client.post("/api/cats/", data, format="json")
        self.assertEqual(response.status_code, 401)

    def test_achievements_list_unauthorized(self):
        """Тест: Неавторизованный пользователь получает 401 при доступе к списку достижений"""
        response = self.client.get("/api/achievements/")
        self.assertEqual(response.status_code, 401)

    def test_achievements_create_unauthorized(self):
        """Тест: Неавторизованный пользователь не может создать достижение — 401"""
        data = {"name": "Ловец лазера"}
        response = self.client.post("/api/achievements/", data, format="json")
        self.assertEqual(response.status_code, 401)

    def test_admin_unauthorized(self):
        """Тест: Неавторизованный доступ к admin возвращает 302 (redirect to login)"""
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, 302)
