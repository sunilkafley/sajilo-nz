from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('guides', '0001_initial')]
    operations = [migrations.AlterField(
        model_name='guide', name='stage',
        field=models.CharField(choices=[('predeparture', 'Before you fly'), ('firstweek', 'First week')],
                               default='predeparture', max_length=20),
    )]
