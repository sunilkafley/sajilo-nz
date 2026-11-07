from django.contrib.auth import get_user_model
from django.conf import settings
from django.test import Client, TestCase
from django.urls import reverse
from django.contrib.auth.models import Permission
from django.contrib.admin.models import LogEntry, ADDITION
from django.contrib.contenttypes.models import ContentType
from editorial.models import Article


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


class AdminWorkspaceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.owner = get_user_model().objects.create_user('synthetic-workspace-owner', password='Synthetic-workspace-only-928!', is_staff=True, is_superuser=True)
        cls.viewer = get_user_model().objects.create_user('synthetic-workspace-viewer', is_staff=True)
        cls.viewer.user_permissions.add(Permission.objects.get(codename='view_article', content_type__app_label='editorial'))
        cls.empty = get_user_model().objects.create_user('synthetic-workspace-empty', is_staff=True)

    def test_dashboard_brands_and_orders_available_content_without_changing_native_controls(self):
        self.client.force_login(self.owner)
        response = self.client.get(reverse('admin:index'))
        self.assertContains(response, 'Your content workspace')
        self.assertContains(response, 'editorial/branding/workspace.css')
        self.assertContains(response, 'Draft first. Review before publishing.')
        self.assertContains(response, reverse('admin:editorial_article_add'))
        self.assertContains(response, reverse('admin:auth_user_add'))
        content = response.content.decode()
        self.assertLess(content.index('id="app-editorial-heading"'), content.index('id="app-auth-heading"'))
        self.assertContains(response, 'method="post" action="/admin/logout/"')
        self.assertContains(response, 'name="csrfmiddlewaretoken"')
        self.assertContains(response, reverse('admin:password_change'))

    def test_view_only_dashboard_never_offers_add_or_access_controls(self):
        self.client.force_login(self.viewer)
        response = self.client.get(reverse('admin:index'))
        self.assertContains(response, reverse('admin:editorial_article_changelist'))
        self.assertContains(response, 'View<span class="visually-hidden"> articles')
        for url in ['admin:editorial_article_add', 'admin:editorial_course_changelist', 'admin:auth_user_changelist']:
            self.assertNotContains(response, reverse(url))
        self.assertEqual(self.client.get(reverse('admin:editorial_article_add')).status_code, 403)

    def test_empty_staff_and_anonymous_access(self):
        self.assertRedirects(self.client.get(reverse('admin:index')), '/admin/login/?next=/admin/', fetch_redirect_response=False)
        self.client.force_login(self.empty)
        response = self.client.get(reverse('admin:index'))
        self.assertContains(response, 'No content access yet')
        self.assertNotContains(response, 'sajilo-model-card')

    def test_recent_actions_remain_specific_to_the_current_user(self):
        content_type = ContentType.objects.get_for_model(Article)
        for user, title in [(self.owner, 'Synthetic owner draft'), (self.viewer, 'Synthetic other-user draft')]:
            LogEntry.objects.create(user=user, content_type=content_type, object_id='9999', object_repr=title, action_flag=ADDITION)
        self.client.force_login(self.owner)
        response = self.client.get(reverse('admin:index'))
        self.assertContains(response, 'Synthetic owner draft')
        self.assertNotContains(response, 'Synthetic other-user draft')

    def test_native_article_form_keeps_review_fields_and_login_stays_branded(self):
        self.client.force_login(self.owner)
        response = self.client.get(reverse('admin:editorial_article_add'))
        self.assertContains(response, 'editorial/branding/workspace.css')
        self.assertContains(response, 'name="reviewed_by"')
        self.assertContains(response, 'name="verified_on"')
        self.assertNotContains(response, 'sajilo-model-card')
        self.client.logout()
        response = self.client.get(reverse('admin:login'))
        self.assertContains(response, 'Welcome back.')
        self.assertContains(response, 'editorial/branding/login.css')
