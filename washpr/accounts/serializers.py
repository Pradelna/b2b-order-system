from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Сериализатор для регистрации нового пользователя.
    """
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        # Если у вас кастомная модель, где нет username, то укажите поля, доступные для заполнения
        fields = ('email', 'password', 'lang')

    def create(self, validated_data):
        # Хешируем пароль (или используем user.set_password())
        validated_data['password'] = make_password(validated_data['password'])
        # user = super().create(validated_data)
        user = User.objects.create(is_active=False, **validated_data)
        return user
