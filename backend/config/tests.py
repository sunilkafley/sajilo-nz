from django.contrib.auth import get_user_model
from django.conf import settings
from django.test import Client, TestCase
from django.urls import reverse


class AdminLoginTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Synthetic users exist only in Django's isolated test database.
        cls.staff = get_user_model().objects.create_user(
            'synthetic-login-editor', password='Synthetic-test-only-928!', is_staff=True)
        get_user_model().objects.create_user(
            'synthetic-nonstaff', password='Synthetic-test-only-928!')

    def test_branding_preserves_native_form_and_accessibility(self):
        response = self.client.get(reverse('admin:login') + '?next=/admin/editorial/article/')
        self.assertContains(response, 'Welcome back.')
        self.assertContains(response, 'editorial/branding/login.css')
        self.assertContains(response, 'editorial/branding/sajilonz-logo.png')
        self.assertContains(response, 'name="csrfmiddlewaretoken"')
        self.assertContains(response, 'autocomplete="username"')
        self.assertContains(response, 'autocomplete="current-password"')
        self.assertContains(response, 'for="id_password"')
        self.assertContains(response, 'value="/admin/editorial/article/"')
        self.assertContains(response, 'NONE,NOARCHIVE')
        self.assertNotContains(response, 'Forgotten your login credentials?')

    def test_staff_login_keeps_requested_destination(self):
        response = self.client.post(reverse('admin:login'), {
            'username': self.staff.username, 'password': 'Synthetic-test-only-928!',
            'next': '/admin/editorial/article/',
        })
        self.assertRedirects(response, '/admin/editorial/article/', fetch_redirect_response=False)

    def test_invalid_credentials_and_nonstaff_stay_on_branded_form(self):
        for username, password in [('synthetic-login-editor', 'incorrect'),
                                   ('synthetic-nonstaff', 'Synthetic-test-only-928!')]:
            with self.subTest(username=username):
                response = self.client.post(reverse('admin:login'), {
                    'username': username, 'password': password,
                })
                self.assertEqual(response.status_code, 200)
                self.assertTrue(response.context['form'].errors)
                self.assertContains(response, 'Welcome back.')
                self.assertNotIn('_auth_user_id', self.client.session)

    def test_csrf_and_safe_redirect_checks_remain_enabled(self):
        self.assertEqual(Client(enforce_csrf_checks=True).post(reverse('admin:login'), {}).status_code, 403)
        response = self.client.post(reverse('admin:login'), {
            'username': self.staff.username, 'password': 'Synthetic-test-only-928!',
            'next': 'https://untrusted.example/',
        })
        self.assertRedirects(response, settings.LOGIN_REDIRECT_URL, fetch_redirect_response=False)
