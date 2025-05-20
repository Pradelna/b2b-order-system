from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from django.utils.deprecation import MiddlewareMixin


class RefreshTokenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Не обрабатываем запросы для админки
        if request.path.startswith('/admin/'):
            return

        auth = JWTAuthentication()
        try:
            result = auth.authenticate(request)
            if result is not None:
                user, token = result
                request.user = user  # Устанавливаем пользователя
            else:
                if not hasattr(request, "user") or request.user is None:
                    request.user = None
        except InvalidToken:
            request.user = None


class DebugMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print("Request user in middleware:", request.user)
        if hasattr(request, "user") and request.user:
            print("Is authenticated:", request.user.is_authenticated)
            print("Is staff:", request.user.is_staff)
