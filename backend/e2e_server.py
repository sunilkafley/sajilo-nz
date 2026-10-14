"""Isolated browser-test API; temporary SQLite DB and synthetic content only."""
import os
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory(prefix='sajilo-e2e-') as directory:
    os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
    os.environ['DJANGO_SECRET_KEY'] = 'isolated-browser-test-only'
    os.environ['DJANGO_DEBUG'] = 'true'
    os.environ['DJANGO_USE_SQLITE'] = 'true'
    os.environ['DJANGO_SQLITE_PATH'] = str(Path(directory) / 'e2e.sqlite3')
    import django
    django.setup()
    from django.core.management import call_command
    from django.contrib.auth import get_user_model
    from guides.models import Guide
    from django.utils import timezone
    from datetime import timedelta
    call_command('migrate', verbosity=0)
    reviewer = get_user_model().objects.create_user('synthetic-test-reviewer')
    Guide.objects.create(slug='test-documents', language='en', title='Test travel documents',
        summary='Synthetic browser-test content.', body='This guide exists only in an isolated test database.',
        sources=[{'title':'Immigration New Zealand', 'url':'https://www.immigration.govt.nz/'}],
        checklist_ids=['passport'], status='published', reviewed_by=reviewer,
        verified_on=timezone.localdate(), next_review_on=timezone.localdate()+timedelta(days=30))
    # A separate bilingual slug keeps test-documents/ne genuinely unavailable.
    # Synthetic review metadata belongs only to this temporary test database.
    for language, title, body, age in [
        ('en', 'Test bilingual documents', 'Synthetic English guide for the bilingual journey.', 3),
        ('ne', 'परीक्षण यात्रा कागजात', 'यो नेपाली सामग्री परीक्षणका लागि मात्र हो।', 7),
    ]:
        Guide.objects.create(slug='test-bilingual-documents', language=language, title=title,
            summary=body, body=body,
            sources=[{'title': 'Immigration New Zealand', 'url': 'https://www.immigration.govt.nz/'}],
            checklist_ids=['passport'], status='published', reviewed_by=reviewer,
            verified_on=timezone.localdate()-timedelta(days=age),
            next_review_on=timezone.localdate()+timedelta(days=30-age))
    # City slug is real routing identity, but text/review are synthetic and isolated.
    Guide.objects.create(slug='christchurch-arrival-plan', language='en', title='Test Christchurch preparation',
        summary='Synthetic city browser fixture.', body='Synthetic Christchurch guidance, not travel advice.',
        sources=[{'title':'Christchurch Airport', 'url':'https://www.christchurchairport.co.nz/travellers/parking-and-transport/'},
                 {'title':'Metro', 'url':'https://www.metroinfo.co.nz/travel-information/getting-started-with-metro/'}],
        checklist_ids=['airport-transport'], status='published', reviewed_by=reviewer,
        verified_on=timezone.localdate()-timedelta(days=5), next_review_on=timezone.localdate()+timedelta(days=25))
    Guide.objects.create(slug='christchurch-arrival-plan', language='ne', title='Unreviewed test city translation',
        summary='Synthetic draft only.', body='Never shown in the public city journey.', sources=[], status='draft')
    for language, title in [('en', 'Test first-week travel'), ('ne', 'परीक्षण पहिलो हप्ताको यात्रा')]:
        Guide.objects.create(slug='test-firstweek', language=language, stage='firstweek', title=title,
            summary='Synthetic arrival fixture.', body='Synthetic first-week content, not travel advice.',
            sources=[{'title':'Metro', 'url':'https://www.metroinfo.co.nz/'}],
            checklist_ids=['arrival-transport'], status='published', reviewed_by=reviewer,
            verified_on=timezone.localdate()-timedelta(days=4), next_review_on=timezone.localdate()+timedelta(days=26))
    Guide.objects.create(slug='test-firstweek-draft', language='ne', stage='firstweek', title='Unreviewed arrival translation',
        summary='Synthetic draft.', body='Do not expose.', sources=[], status='draft')
    # Editorial fixtures and login exist only in this disposable browser-test DB.
    from editorial.models import Article, Course, SourceDomain
    editor = get_user_model().objects.create_user('editorial-test-admin', password='isolated-editorial-test-only',
        is_staff=True, is_superuser=True)
    domain = SourceDomain.objects.create(hostname='official.example.org', kind='official', approved=True,
        review_note='Synthetic test approval, not editorial evidence.', approved_by=editor, approved_on=timezone.localdate())
    Article.objects.create(slug='editorial-draft', language='en', topic='study', title='Synthetic draft article',
        summary='Private test content — never production guidance.', body='Draft body for staff preview.',
        sections=[{'heading':'Synthetic section', 'body':'Staff-only section text.'}],
        source=domain, source_url='https://official.example.org/test')
    Article.objects.create(slug='editorial-public', language='en', topic='study', title='Synthetic published article',
        summary='Isolated browser fixture only.', body='Not real guidance.', source=domain,
        source_url='https://official.example.org/test', status='published', reviewed_by=editor,
        verified_on=timezone.localdate(), next_review_on=timezone.localdate()+timedelta(days=30))
    # Topic-page fixtures: synthetic, disposable and never seeded by deployment.
    for topic, slug, language, title in [
        ('housing', 'test-housing', 'en', 'Synthetic housing information'),
        ('nepal', 'test-nepal', 'en', 'Synthetic document information'),
        ('study', 'editorial-nepali', 'ne', 'परीक्षण अध्ययन जानकारी'),
        ('aotearoa', 'about-new-zealand', 'en', 'Synthetic New Zealand introduction'),
        ('cities', 'auckland', 'en', 'Synthetic Auckland introduction'),
    ]:
        Article.objects.create(slug=slug, language=language, topic=topic, title=title,
            summary='Isolated topic browser fixture, not real guidance.', body='Synthetic article body only.',
            sections=[{'heading':'Synthetic section', 'body':'Synthetic section details, not advice.'}],
            source=domain, source_url='https://official.example.org/test', status='published', reviewed_by=editor,
            verified_on=timezone.localdate()-timedelta(days=4), next_review_on=timezone.localdate()+timedelta(days=26))
    # Course fixtures are synthetic and live only in this temporary database.
    for index in range(4):
        Course.objects.create(slug=f'test-course-{index}', language='en', topic='study',
            title=f'Synthetic course {index}', summary='Isolated test programme, not a real course.',
            body='Synthetic qualification information for testing only.', provider=f'Test institution {index}',
            city='Christchurch' if index<2 else 'Auckland', subject='Computing' if index<2 else 'Design',
            qualification_level=7, duration='3 years', intake='February', source=domain,
            source_url='https://official.example.org/test', status='published', reviewed_by=editor,
            verified_on=timezone.localdate(), next_review_on=timezone.localdate()+timedelta(days=30))
    Course.objects.create(slug='test-course-0', language='ne', topic='study', title='परीक्षण पाठ्यक्रम',
        summary='परीक्षणका लागि मात्र।', body='Synthetic translation fixture only.', provider='Test institution 0',
        city='Christchurch', subject='Computing', source=domain, source_url='https://official.example.org/test',
        status='published', reviewed_by=editor, verified_on=timezone.localdate(), next_review_on=timezone.localdate()+timedelta(days=30))
    Course.objects.create(slug='secret-course', language='en', topic='study', title='Private synthetic course',
        summary='Never show this draft.', provider='Private institution', city='Private city', subject='Private subject')
    call_command('runserver', '127.0.0.1:8000', use_reloader=False)
