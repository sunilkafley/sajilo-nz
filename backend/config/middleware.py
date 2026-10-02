class HostValidationMiddleware:
    """Validate Host even when static middleware returns before CommonMiddleware."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.get_host()
        response = self.get_response(request)
        if request.path.startswith(('/api/', '/admin/')):
            response['Cache-Control'] = 'no-store'
        response['X-Robots-Tag'] = 'noindex, nofollow'
        return response
