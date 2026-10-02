from django.http import JsonResponse
from django.urls import path
from django.views.decorators.cache import never_cache
from .urls import urlpatterns as application_urls


@never_cache
def health(request):
    # Liveness only. Database readiness is checked by startup migrations.
    return JsonResponse({'status': 'ok'})


urlpatterns = [path('api/health/', health), *application_urls]
