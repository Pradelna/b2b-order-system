#!/bin/sh
set -e

# Конфигурация из переменных окружения
ALIAS_NAME=myminio
MINIO_URL=${AWS_S3_ENDPOINT_URL:-http://minio:9000}
ROOT_USER=$MINIO_ROOT_USER
ROOT_PASS="$MINIO_ROOT_PASSWORD"
NEW_USER=$AWS_ACCESS_KEY_ID
NEW_PASS="$AWS_SECRET_ACCESS_KEY"
BUCKET_NAME=$AWS_STORAGE_BUCKET_NAME

# Настроить alias (если не настроен)
mc alias set $ALIAS_NAME $MINIO_URL "$ROOT_USER" "$ROOT_PASS"

# Проверка и создание пользователя
if mc admin user list $ALIAS_NAME | grep -q "$NEW_USER"; then
    echo "✅ Пользователь $NEW_USER уже существует."
else
    echo "➕ Создаём пользователя $NEW_USER..."
    mc admin user add $ALIAS_NAME "$NEW_USER" "$NEW_PASS"
    mc admin policy attach $ALIAS_NAME readwrite --user "$NEW_USER"
    echo "✅ Пользователь $NEW_USER создан и получил политику readwrite."
fi

# Проверка и создание бакета
if mc ls $ALIAS_NAME | grep -q "$BUCKET_NAME/"; then
    echo "✅ Бакет $BUCKET_NAME уже существует."
else
    echo "➕ Создаём бакет $BUCKET_NAME..."
    mc mb $ALIAS_NAME/$BUCKET_NAME
    echo "✅ Бакет $BUCKET_NAME создан."
fi