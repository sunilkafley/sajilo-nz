from datetime import timedelta
from io import StringIO
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.test import TestCase
from django.utils import timezone
from .models import Guide

class GuideTests(TestCase):
    def setUp(self):
        self.reviewer = get_user_model().objects.create_user('editor', is_staff=True)
        self.today = timezone.localdate()

    def guide(self, **changes):
        values = dict(slug='travel-documents', language='en', title='Documents', summary='Prepare documents',
                      body='Check official information.', sources=[{'title':'INZ','url':'https://www.immigration.govt.nz/'}],
                      checklist_ids=['passport'])
        values.update(changes)
        return Guide.objects.create(**values)

    def published(self, **changes):
        values = dict(status='published', reviewed_by=self.reviewer, verified_on=self.today,
                      next_review_on=self.today + timedelta(days=30))
        values.update(changes)
        return self.guide(**values)

    def test_draft_can_be_saved_without_review(self):
        self.assertIsNone(self.guide(sources=[]).verified_on)

    def test_publication_requires_human_review(self):
        for missing in ['reviewed_by', 'verified_on', 'next_review_on']:
            with self.subTest(missing=missing), self.assertRaises(ValidationError):
                self.published(**{missing:None})

    def test_sample_or_missing_source_cannot_publish(self):
        for changes in [{'is_sample':True}, {'sources':[]}]:
            with self.subTest(changes=changes), self.assertRaises(ValidationError):
                self.published(**changes)

    def test_sources_reject_unsafe_or_lookalike_urls(self):
        for url in ['javascript:alert(1)', 'http://www.mpi.govt.nz/', 'https://www.mpi.govt.nz.evil.com/',
                    'https://user@www.mpi.govt.nz/', 'https://www.mpi.govt.nz:123/']:
            with self.subTest(url=url), self.assertRaises(ValidationError):
                self.guide(sources=[{'title':'MPI','url':url}])

    def test_future_and_inverted_review_dates_fail(self):
        with self.assertRaises(ValidationError):
            self.published(verified_on=self.today + timedelta(days=1))
        with self.assertRaises(ValidationError):
            self.published(next_review_on=self.today)

    def test_city_sources_accept_exact_official_hosts_only(self):
        from guides.christchurch_drafts import SOURCES
        guide = self.guide(sources=SOURCES)
        self.assertEqual(guide.sources, SOURCES)
        for url in ['https://www.metroinfo.co.nz.evil.com/', 'http://www.metroinfo.co.nz/',
                    'https://user@www.christchurchairport.co.nz/', 'https://www.metroinfo.co.nz:123/']:
            with self.subTest(url=url), self.assertRaises(ValidationError):
                self.guide(slug='invalid-city', sources=[{'title': 'Invalid', 'url': url}])

    def test_city_starters_require_separate_review_and_preserve_existing_records(self):
        from guides.christchurch_drafts import SLUG, SOURCES, TASK_IDS, TEXT
        call_command('seed_drafts', stdout=StringIO())
        for language, text in TEXT.items():
            guide = Guide.objects.get(slug=SLUG, language=language)
            self.assertEqual(guide.body, text['body'])
            self.assertEqual(guide.sources, SOURCES)
            self.assertEqual(guide.checklist_ids, TASK_IDS)
            self.assertIsNone(guide.reviewed_by_id)
            self.assertIsNone(guide.verified_on)
            self.assertIsNone(guide.next_review_on)
            self.assertEqual(self.client.get(f'/api/guides/{SLUG}/?lang={language}').status_code, 404)
            guide.status = 'published'
            with self.assertRaises(ValidationError):
                guide.save()
        english = Guide.objects.get(slug=SLUG, language='en')
        english.status = 'published'
        english.reviewed_by = self.reviewer
        english.verified_on = self.today
        english.next_review_on = self.today + timedelta(days=30)
        english.save()
        nepali = Guide.objects.get(slug=SLUG, language='ne')
        nepali.title = 'Editor translation in progress'
        nepali.save()
        before = list(Guide.objects.filter(slug=SLUG).order_by('language').values())
        call_command('seed_drafts', stdout=StringIO())
        self.assertEqual(list(Guide.objects.filter(slug=SLUG).order_by('language').values()), before)
        self.assertEqual(self.client.get(f'/api/guides/{SLUG}/?lang=en').status_code, 200)
        self.assertEqual(self.client.get(f'/api/guides/{SLUG}/?lang=ne').status_code, 404)

    def test_city_review_packet_matches_seed_text(self):
        from pathlib import Path
        from guides.christchurch_drafts import TEXT, REVISION
        packet = (Path(__file__).resolve().parents[2] / 'docs/content/christchurch-review.md').read_text(encoding='utf-8')
        self.assertIn(REVISION, packet)
        for text in TEXT.values():
            self.assertIn(text['title'], packet)
            self.assertIn(text['summary'], packet)
            for paragraph in text['body'].split('\n\n'):
                self.assertIn(paragraph, packet)

    def test_unknown_task_fails(self):
        with self.assertRaises(ValidationError):
            self.guide(checklist_ids=['nonexistent'])

    def test_edits_require_draft_and_invalidate_review(self):
        guide = self.published()
        guide.body = 'Changed information'
        with self.assertRaises(ValidationError):
            guide.save()
        guide.status = 'draft'
        guide.save()
        guide.refresh_from_db()
        self.assertIsNone(guide.reviewed_by_id)
        self.assertIsNone(guide.verified_on)
        self.assertIsNone(guide.next_review_on)
        guide.status = 'published'
        with self.assertRaises(ValidationError):
            guide.save()

    def test_public_api_hides_drafts_samples_and_reviewer_identity(self):
        self.published()
        self.guide(slug='draft')
        self.guide(slug='sample', is_sample=True)
        response = self.client.get('/api/guides/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertNotIn('reviewed_by', response.json()[0])
        for slug in ['draft', 'sample', 'missing']:
            self.assertEqual(self.client.get(f'/api/guides/{slug}/').status_code, 404)

    def test_nepali_needs_separate_review_and_no_fallback(self):
        self.published()
        translation = self.guide(language='ne')
        self.assertEqual(self.client.get('/api/guides/?lang=ne').json(), [])
        self.assertEqual(self.client.get('/api/guides/travel-documents/?lang=ne').status_code, 404)
        translation.status = 'published'
        translation.reviewed_by = self.reviewer
        translation.verified_on = self.today
        translation.next_review_on = self.today + timedelta(days=10)
        translation.save()
        self.assertEqual(self.client.get('/api/guides/?lang=ne').json()[0]['language'], 'ne')

    def test_overdue_review_is_explicit_not_refreshed(self):
        guide = self.published(verified_on=self.today-timedelta(days=20), next_review_on=self.today-timedelta(days=1))
        response = self.client.get('/api/guides/travel-documents/').json()
        self.assertTrue(response['review_overdue'])
        self.assertEqual(response['verified_on'], str(guide.verified_on))

    def test_public_api_is_read_only_and_language_validated(self):
        self.assertEqual(self.client.post('/api/guides/', {}).status_code, 405)
        self.assertEqual(self.client.get('/api/guides/?lang=invalid').status_code, 400)

    def test_seed_creates_drafts_and_preserves_edits(self):
        call_command('seed_drafts', stdout=StringIO())
        guide = Guide.objects.get(slug='travel-documents', language='en')
        guide.title = 'My edited title'
        guide.save()
        call_command('seed_drafts', stdout=StringIO())
        guide.refresh_from_db()
        self.assertEqual(guide.title, 'My edited title')
        self.assertFalse(Guide.objects.exclude(status='draft').exists())
        self.assertEqual(self.client.get('/api/guides/').json(), [])

    def test_travel_drafts_need_independent_review_before_publication(self):
        call_command('seed_drafts', stdout=StringIO())
        for language in ('en', 'ne'):
            with self.subTest(language=language):
                guide = Guide.objects.get(slug='travel-documents', language=language)
                self.assertEqual(guide.status, 'draft')
                self.assertIsNone(guide.reviewed_by_id)
                self.assertIsNone(guide.verified_on)
                self.assertIsNone(guide.next_review_on)
                self.assertEqual(guide.checklist_ids, ['passport', 'visa', 'offer', 'document-copies'])
                self.assertEqual(len(guide.sources), 3)
                self.assertEqual(self.client.get(f'/api/guides/?lang={language}').json(), [])
                self.assertEqual(self.client.get(f'/api/guides/travel-documents/?lang={language}').status_code, 404)
                guide.status = 'published'
                with self.assertRaises(ValidationError):
                    guide.save()

        english = Guide.objects.get(slug='travel-documents', language='en')
        english.status = 'published'
        english.reviewed_by = self.reviewer
        english.verified_on = self.today
        english.next_review_on = self.today + timedelta(days=30)
        english.save()
        self.assertEqual(self.client.get('/api/guides/travel-documents/?lang=en').status_code, 200)
        self.assertEqual(self.client.get('/api/guides/?lang=ne').json(), [])
        self.assertEqual(self.client.get('/api/guides/travel-documents/?lang=ne').status_code, 404)

    def test_seed_preserves_full_existing_draft_and_published_records(self):
        # Cover each language as the published one; compare every stored field,
        # including sources, reviewer, dates and updated_at, after two reruns.
        for published_language, draft_language in [('en', 'ne'), ('ne', 'en')]:
            with self.subTest(published_language=published_language):
                Guide.objects.all().delete()
                self.published(language=published_language, title='Existing reviewed title',
                               body='Existing reviewed wording.', verified_on=self.today-timedelta(days=10))
                self.guide(language=draft_language, title='Editor work in progress',
                           body='Keep this unpublished edit.', checklist_ids=['offer'])
                before = list(Guide.objects.order_by('language').values())
                call_command('seed_drafts', stdout=StringIO())
                call_command('seed_drafts', stdout=StringIO())
                after = list(Guide.objects.filter(slug='travel-documents').order_by('language').values())
                self.assertEqual(after, before)
                self.assertEqual(Guide.objects.filter(slug='travel-documents').count(), 2)

    def test_admin_requires_login(self):
        self.assertEqual(self.client.get('/admin/guides/guide/').status_code, 302)

    def test_admin_can_publish_reviewed_draft_and_blocks_unreviewed_publish(self):
        import json
        self.reviewer.is_superuser = True
        self.reviewer.save()
        self.client.force_login(self.reviewer)
        guide = self.guide()
        url = f'/admin/guides/guide/{guide.pk}/change/'
        data = {'slug': guide.slug, 'language': 'en', 'stage': 'predeparture', 'title': guide.title,
                'summary': guide.summary, 'body': guide.body, 'sources': json.dumps(guide.sources),
                'checklist_ids': json.dumps(guide.checklist_ids), 'status': 'published', '_save': 'Save'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 200)
        guide.refresh_from_db()
        self.assertEqual(guide.status, 'draft')
        data.update(reviewed_by=self.reviewer.pk, verified_on=str(self.today),
                    next_review_on=str(self.today + timedelta(days=30)))
        self.assertEqual(self.client.post(url, data).status_code, 302)
        self.assertEqual(self.client.get('/api/guides/travel-documents/').status_code, 200)
        data.update(body='Edited through admin', status='draft')
        self.assertEqual(self.client.post(url, data).status_code, 302)
        guide.refresh_from_db()
        self.assertIsNone(guide.verified_on)
        self.assertEqual(self.client.get('/api/guides/travel-documents/').status_code, 404)
