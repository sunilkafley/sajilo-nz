import unittest
from .staging_policy import staging_options


class StagingPolicyTests(unittest.TestCase):
    def setUp(self):
        self.env = {
            'DJANGO_SECRET_KEY': 'test-only-' + 'abcdefghijklmnopqrstuvwxyz0123456789' * 2,
            'DJANGO_ALLOWED_HOSTS': 'staging.example.com',
            'DJANGO_CSRF_TRUSTED_ORIGINS': 'https://staging.example.com',
            'POSTGRES_DB': 'test', 'POSTGRES_USER': 'test',
            'POSTGRES_PASSWORD': 'test-only', 'POSTGRES_HOST': 'db.example.com',
            'POSTGRES_SSLMODE': 'verify-full',
        }

    def test_accepts_explicit_https_configuration_without_implicit_proxy_trust(self):
        result = staging_options(self.env)
        self.assertFalse(result['trust_proxy'])
        self.assertEqual(result['hosts'], ['staging.example.com'])
        self.assertEqual(result['sslmode'], 'verify-full')

    def test_requires_database_secrets_and_explicit_hosts(self):
        for key in self.env:
            with self.subTest(key=key):
                env = self.env.copy()
                del env[key]
                with self.assertRaises(ValueError):
                    staging_options(env)

    def test_rejects_insecure_settings(self):
        for key, value in [('DJANGO_DEBUG', 'true'), ('DJANGO_USE_SQLITE', 'true'),
                           ('DJANGO_SECRET_KEY', 'short'), ('POSTGRES_SSLMODE', 'disable'),
                           ('DJANGO_ALLOWED_HOSTS', '*'), ('DJANGO_ALLOWED_HOSTS', '.example.com'),
                           ('DJANGO_ALLOWED_HOSTS', 'https://staging.example.com'),
                           ('DJANGO_CSRF_TRUSTED_ORIGINS', 'http://staging.example.com'),
                           ('DJANGO_CSRF_TRUSTED_ORIGINS', 'https://other.example.com'),
                           ('DJANGO_CSRF_TRUSTED_ORIGINS', 'https://staging.example.com/path'),
                           ('DJANGO_TRUST_PROXY_HTTPS', 'yes')]:
            with self.subTest(key=key, value=value):
                with self.assertRaises(ValueError):
                    staging_options({**self.env, key: value})

    def test_accepts_proxy_trust_only_when_explicit(self):
        self.assertTrue(staging_options({**self.env, 'DJANGO_TRUST_PROXY_HTTPS': 'true'})['trust_proxy'])
