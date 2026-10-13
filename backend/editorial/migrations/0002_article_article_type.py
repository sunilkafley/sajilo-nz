from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('editorial', '0001_initial')]

    operations = [migrations.AddField(
        model_name='article', name='article_type',
        field=models.CharField(max_length=10, default='guidance', choices=[
            ('guidance', 'Sourced guidance'), ('general', 'General information')],
            help_text='Use General information only for original introductions, welcome pages or site instructions. Factual advice about visas, rights, health, housing or money must use Sourced guidance. Human review is required for both types and each translation.'),
    )]
