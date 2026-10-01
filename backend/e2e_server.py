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
    call_command('runserver', '127.0.0.1:8000', use_reloader=False)
