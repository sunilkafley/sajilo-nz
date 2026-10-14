"""All content/review metadata here is synthetic and confined to test databases."""
import json
from datetime import timedelta

from django.contrib.admin.models import LogEntry
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.core.exceptions import ValidationError
from django.db.models.deletion import ProtectedError
from django.db.models import JSONField
from django.test import Client, TestCase, TransactionTestCase
from django.utils import timezone

from .models import Article, Course, DirectoryEntry, SourceDomain


class EditorialTests(TestCase):
    def setUp(self):
        self.today = timezone.localdate()
        self.editor = get_user_model().objects.create_user('synthetic-editor', is_staff=True, is_superuser=True)
        self.domains = {}
        for kind in ['official', 'provider', 'community', 'commercial']:
            self.domains[kind] = SourceDomain.objects.create(hostname=f'{kind}.example.org', kind=kind,
                approved=True, review_note='Synthetic test evidence only', approved_by=self.editor, approved_on=self.today)

    def record(self, model=Article, **changes):
        values = dict(slug='test-record', language='en', topic='study', title='Synthetic title',
            summary='Synthetic summary', body='Test-only body', source=self.domains['official'],
            source_url='https://official.example.org/resource')
        if model is Course:
            values.update(provider='Synthetic provider', city='Test city', subject='Testing')
        if model is DirectoryEntry:
            values.update(topic='community', kind='organisation', city='Test city', category='Testing')
        values.update(changes)
        return model.objects.create(**values)

    def published(self, model=Article, **changes):
        values = dict(status='published', reviewed_by=self.editor, verified_on=self.today,
            next_review_on=self.today + timedelta(days=30))
        values.update(changes)
        return self.record(model, **values)

    def test_all_types_start_private_and_require_review(self):
        for model, route in [(Article, 'articles'), (Course, 'courses'), (DirectoryEntry, 'directory')]:
            with self.subTest(model=model):
                obj = self.record(model)
                self.assertIsNone(obj.verified_on)
                self.assertEqual(self.client.get(f'/api/explore/{route}/').json()['results'], [])
                self.assertEqual(self.client.get(f'/api/explore/{route}/{obj.slug}/').status_code, 404)
                obj.status = 'published'
                with self.assertRaises(ValidationError): obj.save()

    def test_directory_filters_and_facets_preserve_publication_boundary(self):
        self.published(DirectoryEntry, slug='public', city='Christchurch', category='Support')
        self.record(DirectoryEntry, slug='private', city='Private city', category='Private category')
        self.published(DirectoryEntry, slug='translation', language='ne', city='Nepali city')
        route = '/api/explore/directory/'
        data = self.client.get(route).json()
        self.assertEqual(data['count'], 1)
        self.assertEqual(data['facets']['city'], ['Christchurch'])
        for params in [{'city':'Christchurch'}, {'kind':'organisation'}, {'category':'Support'}, {'q':'Synthetic'}]:
            self.assertEqual(self.client.get(route, params).json()['count'], 1)
        self.assertEqual(self.client.get(route, {'city':'Private city'}).json()['count'], 0)
        self.assertEqual(self.client.get(route, {'kind':'business'}).json()['count'], 0)
        self.assertEqual(self.client.get(route, {'kind':'invalid'}).status_code, 400)
        self.assertEqual(self.client.get(route+'private/').status_code, 404)
        self.assertEqual(self.client.get(route+'public/', {'lang':'ne'}).status_code, 404)
        domain = self.domains['official']; domain.approved = False; domain.save()
        data = self.client.get(route).json()
        self.assertEqual(data['count'], 0)
        self.assertEqual(data['facets']['category'], [])

    def test_publication_requirements_and_review_dates(self):
        for changes in [dict(reviewed_by=None), dict(verified_on=None), dict(next_review_on=None),
            dict(is_sample=True), dict(source=None, source_url=''), dict(source_url=''),
            dict(verified_on=self.today+timedelta(days=1)), dict(next_review_on=self.today)]:
            with self.subTest(changes=changes), self.assertRaises(ValidationError): self.published(**changes)
        nonstaff = get_user_model().objects.create_user('not-a-reviewer')
        with self.assertRaises(ValidationError): self.published(reviewed_by=nonstaff)

    def test_exact_https_source_and_no_lookalikes(self):
        for url in ['javascript:alert(1)', 'http://official.example.org/', 'https://official.example.org.evil.org/',
            'https://evilofficial.example.org/', 'https://user@official.example.org/',
            'https://official.example.org:444/', 'https://official.example.org\\@evil.org/',
            'https://127.0.0.1/', 'https://official.example.org/has space']:
            with self.subTest(url=url), self.assertRaises(ValidationError): self.record(source_url=url)

    def test_domain_approval_requires_human_and_immutable_identity(self):
        for changes in [dict(approved_by=None), dict(approved_on=None), dict(review_note=''),
                        dict(approved_on=self.today+timedelta(days=1))]:
            values = dict(hostname='other.example.org', kind='official', approved=True,
                approved_by=self.editor, approved_on=self.today, review_note='Synthetic')
            values.update(changes)
            with self.subTest(changes=changes), self.assertRaises(ValidationError): SourceDomain.objects.create(**values)
        for host in ['*.example.org', 'localhost', '127.0.0.1', 'https://example.org', 'EXAMPLE.org']:
            with self.subTest(host=host), self.assertRaises(ValidationError): SourceDomain.objects.create(hostname=host, kind='official')
        source = self.domains['official']
        source.kind = 'commercial'
        with self.assertRaises(ValidationError): source.save()
        source.refresh_from_db()
        source.hostname = 'replacement.example.org'
        with self.assertRaises(ValidationError): source.save()

    def test_unapproved_domain_blocks_publication_and_disabling_hides_existing(self):
        obj = self.published()
        source = self.domains['official']
        source.approved = False
        source.save()
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)
        self.assertEqual(self.client.get(f'/api/explore/articles/{obj.slug}/').status_code, 404)
        with self.assertRaises(ValidationError): self.published(slug='another')
        with self.assertRaises(ProtectedError): source.delete()

    def test_source_classification_is_not_endorsement(self):
        for model in [Article, Course, DirectoryEntry]:
            with self.subTest(model=model), self.assertRaises(ValidationError):
                self.record(model, source=self.domains['commercial'], source_url='https://commercial.example.org/')
        business = self.published(DirectoryEntry, kind='business', source=self.domains['commercial'],
            source_url='https://commercial.example.org/')
        result = self.client.get(f'/api/explore/directory/{business.slug}/').json()
        self.assertEqual(result['source_kind'], 'commercial')
        self.assertEqual(result['kind'], 'business')

    def test_edits_and_withdrawal_clear_review_for_every_type(self):
        for model in [Article, Course, DirectoryEntry]:
            with self.subTest(model=model):
                obj = self.published(model)
                obj.title = 'Changed title'
                with self.assertRaises(ValidationError): obj.save()
                obj.status = 'draft'
                obj.save()
                obj.refresh_from_db()
                self.assertIsNone(obj.reviewed_by_id)
                self.assertIsNone(obj.verified_on)
                self.assertIsNone(obj.next_review_on)
                obj.status = 'published'
                with self.assertRaises(ValidationError): obj.save()
        obj = self.published(slug='withdraw')
        obj.status = 'draft'
        obj.save()
        self.assertIsNone(obj.verified_on)

    def test_typed_content_changes_invalidate_review(self):
        for model, changes in [(Article, {'sections':[{'heading':'New', 'body':'New body'}]}),
            (Course, {'tuition':'Changed fee'}), (DirectoryEntry, {'city':'Different city'})]:
            with self.subTest(model=model):
                obj = self.published(model)
                for key, value in changes.items(): setattr(obj, key, value)
                with self.assertRaises(ValidationError): obj.save()
                obj.status = 'draft'
                obj.save()
                self.assertIsNone(obj.verified_on)

    def test_nepali_is_independent_and_no_fallback(self):
        self.published()
        ne = self.record(language='ne', title='परीक्षण सामग्री')
        self.assertEqual(self.client.get('/api/explore/articles/?lang=ne').json()['results'], [])
        self.assertEqual(self.client.get('/api/explore/articles/test-record/?lang=ne').status_code, 404)
        ne.status = 'published'
        ne.reviewed_by = self.editor
        ne.verified_on = self.today
        ne.next_review_on = self.today + timedelta(days=30)
        ne.save()
        self.assertEqual(self.client.get('/api/explore/articles/?lang=ne&q=परीक्षण').json()['count'], 1)

    def test_public_filters_search_and_detail_exclude_drafts_and_private_fields(self):
        for model, route in [(Article, 'articles'), (Course, 'courses'), (DirectoryEntry, 'directory')]:
            with self.subTest(model=model):
                obj = self.published(model)
                self.record(model, slug='secret-draft', title='Secret marker')
                result = self.client.get(f'/api/explore/{route}/?topic={obj.topic}&q=Synthetic')
                self.assertEqual(result.json()['count'], 1)
                for field in ['reviewed_by', 'reviewed_by_id', 'source', 'approved_by', 'review_note']:
                    self.assertNotIn(field, result.json()['results'][0])
                self.assertEqual(self.client.get(f'/api/explore/{route}/?q=Secret').json()['count'], 0)
                self.assertEqual(self.client.get(f'/api/explore/{route}/secret-draft/').status_code, 404)
                self.assertIn('no-store', result['Cache-Control'])
                self.assertEqual(self.client.post(f'/api/explore/{route}/', {}).status_code, 405)
                self.assertEqual(self.client.patch(f'/api/explore/{route}/{obj.slug}/', {}).status_code, 405)
        for query in ['lang=fr', 'topic=missing', 'stage=missing', 'q='+'x'*201]:
            self.assertEqual(self.client.get('/api/explore/articles/?'+query).status_code, 400)

    def test_defensive_api_gate_for_invalid_database_metadata(self):
        obj = self.published()
        for changes in [{'is_sample':True}, {'verified_on':self.today+timedelta(days=1)},
                        {'reviewed_by':None}, {'next_review_on':None}, {'source_url':''}]:
            Article.objects.filter(pk=obj.pk).update(**changes)  # Simulate legacy/import bypass.
            self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)
            Article.objects.filter(pk=obj.pk).update(**{key: getattr(obj, key) for key in changes})

    def test_overdue_review_not_fabricated_or_reset(self):
        obj = self.published(verified_on=self.today-timedelta(days=10), next_review_on=self.today-timedelta(days=1))
        result = self.client.get(f'/api/explore/articles/{obj.slug}/').json()
        self.assertTrue(result['review_overdue'])
        self.assertEqual(result['verified_on'], str(obj.verified_on))

    def test_structured_fields_reject_invalid_shapes(self):
        for sections in [{}, ['text'], [{'heading':'Only heading'}], [{'heading':'', 'body':'Text'}],
                         [{'heading':'Title', 'body':'Text', 'script':'bad'}]]:
            with self.subTest(sections=sections), self.assertRaises(ValidationError): self.record(sections=sections)
        for tags in ['text', [1], [''], ['a'*101]]:
            with self.subTest(tags=tags), self.assertRaises(ValidationError): self.record(tags=tags)
        with self.assertRaises(ValidationError): self.record(Course, qualification_level=11)
        with self.assertRaises(ValidationError): self.record(Course, topic='housing')
        with self.assertRaises(ValidationError): self.published(DirectoryEntry, kind='event')
        with self.assertRaises(ValidationError): self.record(DirectoryEntry, starts_at=timezone.now())
        with self.assertRaises(ValidationError): self.record(DirectoryEntry, kind='event', ends_at=timezone.now())

    def test_partial_save_rejected(self):
        obj = self.published()
        with self.assertRaises(ValueError): obj.save(update_fields=['title'])
        with self.assertRaises(ValueError): self.domains['official'].save(update_fields=['approved'])

    def test_preview_requires_staff_model_permission_and_is_escaped_and_uncached(self):
        obj = self.record(title='<script>alert(1)</script>', body='<img src=x onerror=alert(1)>',
                          sections=[{'heading':'<script>bad</script>', 'body':'<b>plain</b>'}])
        url = f'/admin/editorial/article/{obj.pk}/preview/'
        self.assertEqual(self.client.get(url).status_code, 302)
        user = get_user_model().objects.create_user('reader')
        self.client.force_login(user)
        self.assertEqual(self.client.get(url).status_code, 302)
        user.is_staff = True
        user.save()
        self.assertEqual(self.client.get(url).status_code, 403)
        user.user_permissions.add(Permission.objects.get(codename='view_article', content_type__app_label='editorial'))
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('no-store', response['Cache-Control'])
        self.assertIn('noindex', response['X-Robots-Tag'])
        self.assertContains(response, '&lt;script&gt;')
        self.assertNotContains(response, '<img src=x')
        self.assertContains(response, 'Staff-only saved-record preview')
        self.assertEqual(self.client.post(url, {}).status_code, 405)
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)

    def test_preview_permissions_are_model_specific(self):
        user = get_user_model().objects.create_user('article-viewer', is_staff=True)
        user.user_permissions.add(Permission.objects.get(codename='view_article', content_type__app_label='editorial'))
        self.client.force_login(user)
        for model in [Course, DirectoryEntry]:
            obj = self.record(model)
            url = f'/admin/editorial/{model._meta.model_name}/{obj.pk}/preview/'
            self.assertEqual(self.client.get(url).status_code, 403)
        self.assertEqual(self.client.get('/admin/editorial/sourcedomain/add/').status_code, 403)

    def admin_data(self, obj):
        data = {}
        for field in obj._meta.fields:
            if field.name in ['id', 'updated_at']: continue
            value = getattr(obj, field.attname)
            if isinstance(field, JSONField): value = json.dumps(value)
            if isinstance(value, bool):
                if value: data[field.name] = 'on'
            else: data[field.name] = '' if value is None else str(value)
        data['_save'] = 'Save'
        return data

    def test_admin_publish_edit_preview_withdraw_and_history_for_all_types(self):
        self.client.force_login(self.editor)
        for model in [Article, Course, DirectoryEntry]:
            with self.subTest(model=model):
                obj = self.record(model)
                url = f'/admin/editorial/{model._meta.model_name}/{obj.pk}/change/'
                self.assertContains(self.client.get(url), 'Preview saved record')
                data = self.admin_data(obj)
                data['status'] = 'published'
                self.assertEqual(self.client.post(url, data).status_code, 200)
                obj.refresh_from_db()
                self.assertEqual(obj.status, 'draft')
                data.update(reviewed_by=self.editor.pk, verified_on=str(self.today), next_review_on=str(self.today+timedelta(days=30)))
                self.assertEqual(self.client.post(url, data).status_code, 302)
                obj.refresh_from_db()
                self.assertEqual(obj.status, 'published')
                self.assertEqual(self.client.get(f'/admin/editorial/{model._meta.model_name}/{obj.pk}/preview/').status_code, 200)
                data.update(title='Edited title', status='draft')
                self.assertEqual(self.client.post(url, data).status_code, 302)
                obj.refresh_from_db()
                self.assertIsNone(obj.verified_on)
                self.assertEqual(model.objects.public().count(), 0)
        self.assertEqual(LogEntry.objects.filter(user=self.editor).count(), 6)

    def test_admin_csrf_protection(self):
        client = Client(enforce_csrf_checks=True)
        client.force_login(self.editor)
        self.assertEqual(client.post('/admin/editorial/article/add/', {}).status_code, 403)

    def test_pagination_is_bounded(self):
        for index in range(25): self.published(slug=f'item-{index}')
        response = self.client.get('/api/explore/articles/').json()
        self.assertEqual(len(response['results']), 24)
        self.assertEqual(response['count'], 25)
        self.assertIsNotNone(response['next'])

    def test_course_discovery_filters_and_facets_only_use_public_language_records(self):
        self.published(Course, city='Christchurch', provider='Synthetic college', subject='Computing',
            qualification_level=7, duration='3 years', intake='February')
        self.record(Course, slug='private-course', city='Private city', provider='Secret institution')
        self.published(Course, slug='ne-course', language='ne', city='Nepali-only city')
        for query in ['city=Christchurch', 'provider=Synthetic+college', 'subject=Computing',
                      'qualification_level=7', 'duration=3+years', 'intake=February', 'q=college', 'q=Computing']:
            with self.subTest(query=query):
                result = self.client.get('/api/explore/courses/?'+query).json()
                self.assertEqual(result['count'], 1)
                self.assertEqual(result['facets']['city'], ['Christchurch'])
                self.assertNotIn('Secret institution', result['facets']['provider'])
        self.assertEqual(self.client.get('/api/explore/courses/?city=Private+city').json()['count'], 0)
        self.assertEqual(self.client.get('/api/explore/courses/private-course/').status_code, 404)
        self.assertEqual(self.client.get('/api/explore/courses/?qualification_level=oops').status_code, 400)
        self.assertEqual(self.client.get('/api/explore/courses/?q=college&lang=invalid').status_code, 400)
        self.domains['official'].approved = False
        self.domains['official'].save()
        result = self.client.get('/api/explore/courses/').json()
        self.assertEqual(result['count'], 0)
        self.assertEqual(result['facets']['city'], [])

    def test_general_information_requires_review_but_not_external_source(self):
        obj = self.published(article_type='general', source=None, source_url='')
        result = self.client.get(f'/api/explore/articles/{obj.slug}/').json()
        self.assertEqual(result['article_type'], 'general')
        self.assertIsNone(result['source_kind'])
        self.assertIsNone(result['source_hostname'])
        for changes in [dict(reviewed_by=None), dict(verified_on=None), dict(next_review_on=None), dict(is_sample=True)]:
            with self.subTest(changes=changes), self.assertRaises(ValidationError):
                self.published(slug='invalid', article_type='general', source=None, source_url='', **changes)
        self.assertEqual(self.client.get('/api/explore/articles/?lang=ne').json()['count'], 0)
        obj.status = 'draft'
        obj.save()
        self.assertEqual(self.client.get(f'/api/explore/articles/{obj.slug}/').status_code, 404)

    def test_general_optional_sources_are_not_a_bypass(self):
        for changes in [dict(source_url=''), dict(source=None), dict(source_url='javascript:bad')]:
            with self.subTest(changes=changes), self.assertRaises(ValidationError):
                self.published(article_type='general', **changes)
        obj = self.published(article_type='general')
        self.domains['official'].approved = False
        self.domains['official'].save()
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)
        Article.objects.filter(pk=obj.pk).update(source=None)
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)

    def test_type_change_requires_new_review_and_default_stays_guidance(self):
        obj = self.published()
        self.assertEqual(obj.article_type, 'guidance')
        obj.article_type = 'general'
        obj.source = None
        obj.source_url = ''
        with self.assertRaises(ValidationError): obj.save()
        obj.status = 'draft'
        obj.save()
        self.assertIsNone(obj.verified_on)
        obj.status = 'published'
        with self.assertRaises(ValidationError): obj.save()

    def test_general_defensive_public_gate_and_search(self):
        obj = self.published(article_type='general', source=None, source_url='')
        self.assertEqual(self.client.get('/api/explore/articles/?q=Synthetic').json()['count'], 1)
        for changes in [dict(article_type='unknown'), dict(article_type='guidance'), dict(reviewed_by=None),
                        dict(is_sample=True), dict(verified_on=self.today+timedelta(days=1))]:
            Article.objects.filter(pk=obj.pk).update(**changes)
            self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 0)
            Article.objects.filter(pk=obj.pk).update(**{key:getattr(obj,key) for key in changes})

    def test_simple_admin_draft_generates_slug_and_never_review_dates(self):
        self.client.force_login(self.editor)
        response = self.client.get('/admin/editorial/article/add/')
        self.assertContains(response, 'Write your article')
        self.assertContains(response, 'Optional sections')
        response = self.client.post('/admin/editorial/article/add/', dict(title='Welcome here', topic='community',
            language='en', article_type='general', summary='Synthetic introduction', body='Synthetic content',
            status='draft', sections='[]', tags='[]', _save='Save'))
        self.assertEqual(response.status_code, 302)
        obj = Article.objects.get(slug='welcome-here')
        self.assertIsNone(obj.verified_on)
        self.assertIsNone(obj.source_id)
        data = self.admin_data(obj)
        data.update(status='published', reviewed_by=self.editor.pk, verified_on=str(self.today),
                    next_review_on=str(self.today+timedelta(days=30)))
        self.assertEqual(self.client.post(f'/admin/editorial/article/{obj.pk}/change/', data).status_code, 302)
        self.assertEqual(self.client.get('/api/explore/articles/').json()['count'], 1)


class EditorialMigrationTests(TransactionTestCase):
    def test_article_type_migration_preserves_existing_records_as_guidance(self):
        from django.db import connection
        from django.db.migrations.executor import MigrationExecutor
        try:
            executor = MigrationExecutor(connection)
            executor.migrate([('editorial', '0001_initial')])
            old_apps = executor.loader.project_state([('editorial', '0001_initial')]).apps
            legacy = old_apps.get_model('editorial', 'Article').objects.create(slug='legacy', language='en',
                topic='community', title='Preserved title', summary='Preserved summary', body='Preserved body')
            MigrationExecutor(connection).migrate([('editorial', '0002_article_article_type')])
            current = Article.objects.get(pk=legacy.pk)
            self.assertEqual(current.article_type, 'guidance')
            self.assertEqual(current.title, 'Preserved title')
            self.assertEqual(current.body, 'Preserved body')
            self.assertEqual(current.status, 'draft')
        finally:
            MigrationExecutor(connection).migrate([('editorial', '0002_article_article_type')])

    def test_additive_migration_preserves_existing_guides(self):
        from django.db import connection
        from django.db.migrations.executor import MigrationExecutor
        from guides.models import Guide
        Guide.objects.create(slug='migration-existing', language='en', title='Existing draft',
                             summary='Synthetic compatibility fixture', body='Keep this content.')
        before = list(Guide.objects.values())
        try:
            # Editorial tables are empty in this isolated test, never an editorial database.
            MigrationExecutor(connection).migrate([('editorial', None)])
            self.assertEqual(list(Guide.objects.values()), before)
            MigrationExecutor(connection).migrate([('editorial', '0002_article_article_type')])
            self.assertEqual(list(Guide.objects.values()), before)
            self.assertEqual(Article.objects.count(), 0)
            self.assertEqual(Course.objects.count(), 0)
            self.assertEqual(DirectoryEntry.objects.count(), 0)
        finally:
            MigrationExecutor(connection).migrate([('editorial', '0002_article_article_type')])
