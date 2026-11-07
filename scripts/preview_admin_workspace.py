"""Local-only visual-test server; all users/content live in a temporary database."""
import os
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
with TemporaryDirectory(prefix='sajilo-admin-preview-') as directory:
    os.environ.update(DJANGO_SETTINGS_MODULE='config.settings',
                      DJANGO_SECRET_KEY='isolated-preview-only-not-a-deployment-key',
                      DJANGO_USE_SQLITE='true', DJANGO_DEBUG='true',
                      DJANGO_SQLITE_PATH=str(Path(directory) / 'preview.sqlite3'))
    import django
    django.setup()
    from django.core.management import call_command
    from django.contrib.auth import get_user_model
    from django.contrib.admin.models import LogEntry, ADDITION
    from django.contrib.contenttypes.models import ContentType
    from editorial.models import Article
    call_command('migrate', verbosity=0)
    editor = get_user_model().objects.create_user(
        'synthetic-dashboard-editor', password='Synthetic-preview-only-928!',
        is_staff=True, is_superuser=True)
    draft = Article.objects.create(topic='work', title='Synthetic article draft',
        summary='Isolated visual-test content.', body='Not public guidance.', slug='synthetic-dashboard-draft')
    LogEntry.objects.create(user=editor, content_type=ContentType.objects.get_for_model(Article),
        object_id=str(draft.pk), object_repr=draft.title, action_flag=ADDITION)
    call_command('runserver', '127.0.0.1:8001', use_reloader=False)
