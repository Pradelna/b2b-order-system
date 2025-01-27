def get_items_by_language(queryset, lang, default_lang='cz'):
    """
    Возвращает записи из базы данных на основе языка.
    Если данных для указанного языка нет, возвращает записи для языка по умолчанию.
    """
    # Если язык не указан, используем язык по умолчанию
    if not lang:
        lang = default_lang

    # Фильтрация по языку
    items = queryset.filter(lang=lang)

    # Если записи отсутствуют, используем язык по умолчанию
    if not items.exists():
        items = queryset.filter(lang=default_lang)

    # Если нет данных даже для языка по умолчанию, возвращаем None
    if not items.exists():
        return None, {"error": f"Контент для языка '{lang}' или '{default_lang}' не найден."}

    return items, None
