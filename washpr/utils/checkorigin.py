from functools import wraps
from django.http import JsonResponse

ALLOWED_ORIGIN = [
    'https://pradelna1.cz',
    'https://www.pradelna1.cz',
    'https://api.pradelna1.cz',
]

def allow_only_pradelna1(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        origin = request.META.get('HTTP_ORIGIN') or request.META.get('HTTP_REFERER')

        if origin and origin.startswith(ALLOWED_ORIGIN):
            return view_func(request, *args, **kwargs)
        return JsonResponse({'error': 'Unauthorized domain'}, status=403)
    return _wrapped_view
