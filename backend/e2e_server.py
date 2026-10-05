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
    call_command('runserver', '127.0.0.1:8000', use_reloader=False)
