"""Publishing UX tests use synthetic content and an isolated test database only."""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from .models import Article, SourceDomain
from .publishing import article_readiness


class ArticlePublishingTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.editor = get_user_model().objects.create_user('synthetic-publisher', is_staff=True, is_superuser=True)
        cls.other = get_user_model().objects.create_user('synthetic-other-reviewer', is_staff=True)
        cls.today = timezone.localdate()
        cls.source = SourceDomain.objects.create(hostname='official.example.org', kind='official', approved=True,
            review_note='Synthetic ownership check', approved_by=cls.editor, approved_on=cls.today)

    def setUp(self):
        self.client.force_login(self.editor)

    def data(self, **changes):
        data = dict(title='Synthetic publishing article', topic='work', language='en', article_type='general',
            summary='Synthetic summary', body='Synthetic body', status='draft', slug='synthetic-publishing',
            sections='[]', tags='[]', _save_draft='Save draft')
        data.update(changes)
        return data

    def draft(self, **changes):
        data = self.data(**changes)
        response = self.client.post(reverse('admin:editorial_article_add'), data)
        self.assertEqual(response.status_code, 302)
        return Article.objects.get(slug=data['slug'], language=data['language'])

    def publish_data(self, **changes):
        data = self.data(status='published', reviewed_by=str(self.other.pk), confirm_review='on',
            verified_on=str(self.today), next_review_on=str(self.today + timedelta(days=30)))
        data.pop('_save_draft')
        data['_publish'] = 'Publish article'
        data.update(changes)
        return data

    def test_save_and_preview_generates_url_without_recording_a_review(self):
        data = self.data(slug='')
        data.pop('_save_draft')
        data['_preview'] = 'Save & preview'
        response = self.client.post(reverse('admin:editorial_article_add'), data)
        obj = Article.objects.get(slug='synthetic-publishing-article')
        self.assertRedirects(response, reverse('admin:editorial_article_preview', args=[obj.pk]))
        self.assertEqual(obj.status, 'draft')
        self.assertIsNone(obj.reviewed_by_id)
        self.assertIsNone(obj.verified_on)
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)

    def test_source_link_selects_existing_approved_exact_host_only(self):
        obj = self.draft(article_type='guidance', source_url='https://official.example.org/careers')
        self.assertEqual(obj.source_id, self.source.pk)
        self.assertIsNone(obj.verified_on)
        count = SourceDomain.objects.count()
        for url in ['https://official.example.org.evil.example/careers', 'https://unapproved.example.org/careers']:
            response = self.client.post(reverse('admin:editorial_article_add'), self.data(source_url=url, slug='not-created'))
            self.assertEqual(response.status_code, 200)
            self.assertContains(response, 'No approved official domain matches this link.')
        self.assertEqual(SourceDomain.objects.count(), count)
        self.assertFalse(Article.objects.filter(slug='not-created').exists())

    def test_publish_requires_confirmation_and_records_signed_in_reviewer(self):
        obj = self.draft()
        url = reverse('admin:editorial_article_change', args=[obj.pk])
        response = self.client.post(url, self.publish_data(confirm_review=''))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Confirm that you reviewed this saved version')
        self.assertEqual(response.context['article_status'], 'Draft')
        obj.refresh_from_db()
        self.assertEqual(obj.status, 'draft')
        self.assertIsNone(obj.reviewed_by_id)
        self.assertRedirects(self.client.post(url, self.publish_data()), url)
        obj.refresh_from_db()
        self.assertEqual(obj.status, 'published')
        self.assertEqual(obj.reviewed_by_id, self.editor.pk)
        self.assertEqual(obj.verified_on, self.today)
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 1)

    def test_missing_dates_future_dates_and_unreviewed_source_block_publication(self):
        obj = self.draft()
        url = reverse('admin:editorial_article_change', args=[obj.pk])
        for changes in [dict(verified_on='', next_review_on=''),
                        dict(verified_on=str(self.today+timedelta(days=1))),
                        dict(article_type='guidance')]:
            response = self.client.post(url, self.publish_data(**changes))
            self.assertEqual(response.status_code, 200)
            if changes.get('verified_on') == '':
                self.assertTrue(response.context['adminform'].form.non_field_errors())
            obj.refresh_from_db()
            self.assertEqual(obj.status, 'draft')
            self.assertIsNone(obj.verified_on)
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)

    def test_new_article_and_changed_published_content_need_a_draft_save(self):
        self.assertEqual(self.client.post(reverse('admin:editorial_article_add'), self.publish_data()).status_code, 200)
        self.assertFalse(Article.objects.exists())
        obj = self.draft()
        url = reverse('admin:editorial_article_change', args=[obj.pk])
        self.client.post(url, self.publish_data())
        response = self.client.post(url, self.publish_data(body='Changed synthetic body'))
        self.assertEqual(response.status_code, 200)
        obj.refresh_from_db()
        self.assertEqual(obj.body, 'Synthetic body')
        self.assertEqual(obj.status, 'published')
        response = self.client.post(url, self.data(body='Changed synthetic body', status='published'))
        self.assertEqual(response.status_code, 302)
        obj.refresh_from_db()
        self.assertEqual(obj.status, 'draft')
        self.assertIsNone(obj.reviewed_by_id)
        self.assertIsNone(obj.verified_on)
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)

    def test_nepali_record_needs_its_own_review(self):
        english = self.draft()
        self.client.post(reverse('admin:editorial_article_change', args=[english.pk]), self.publish_data())
        nepali = self.draft(language='ne')
        data = self.publish_data(language='ne', verified_on='', next_review_on='', confirm_review='')
        self.assertEqual(self.client.post(reverse('admin:editorial_article_change', args=[nepali.pk]), data).status_code, 200)
        self.assertEqual(self.client.get('/api/explore/articles/?lang=ne').json()['count'], 0)
        self.assertEqual(self.client.get('/api/explore/articles/?lang=en').json()['count'], 1)

    def test_readiness_is_read_only_and_viewers_cannot_publish(self):
        obj = self.draft()
        self.assertTrue(article_readiness(obj, reviewer=self.editor))
        obj.refresh_from_db()
        self.assertEqual(obj.status, 'draft')
        self.assertIsNone(obj.reviewed_by_id)
        self.other.user_permissions.add(Permission.objects.get(codename='view_article', content_type__app_label='editorial'))
        self.client.force_login(self.other)
        url = reverse('admin:editorial_article_change', args=[obj.pk])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'value="Publish article"')
        self.assertEqual(self.client.post(url, self.publish_data()).status_code, 403)

    def test_add_only_staff_can_save_without_being_sent_to_a_forbidden_page(self):
        self.other.user_permissions.add(Permission.objects.get(codename='add_article', content_type__app_label='editorial'))
        self.client.force_login(self.other)
        url = reverse('admin:editorial_article_add')
        self.assertNotContains(self.client.get(url), 'value="Save &amp; preview"')
        response = self.client.post(url, self.data())
        self.assertRedirects(response, reverse('admin:index'))
        self.assertEqual(Article.objects.get().status, 'draft')
