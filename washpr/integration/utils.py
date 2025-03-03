import datetime
import calendar

def get_dates_by_weekdays(start_date: datetime.date, weekdays: list[int]) -> list[datetime.date]:
    """
    Возвращает список дат от первого дня после start_date, который соответствует одному из
    указанных дней недели (weekdays), до конца месяца этого дня.

    Пример:
      Если start_date — вторник и weekdays = [1, 3] (вторник и четверг),
      то функция ищет первый день после start_date, удовлетворяющий условию.
      Если start_date — вторник, то первая найденная дата будет четверг, и граница — конец месяца этого четверга.
      Если же start_date — четверг, то следующей датой будет следующий вторник, и конец месяца определяется по нему.

    Функция универсальна и подходит для любых наборов дней недели, например, [0, 2, 4] для понедельника, среды и пятницы.

    :param start_date: Исходная дата (datetime.date)
    :param weekdays: Список индексов дней недели (0 — понедельник, 1 — вторник, …, 6 — воскресенье)
    :return: Список дат (datetime.date) от первого найденного дня до конца месяца этого дня
    """
    # Ищем первый день после start_date, удовлетворяющий условию (не включая сам start_date)
    current_date = start_date + datetime.timedelta(days=1)
    while current_date.weekday() not in weekdays:
        current_date += datetime.timedelta(days=1)
    first_valid_date = current_date

    # Определяем последний день месяца для найденной даты (first_valid_date)
    last_day = calendar.monthrange(first_valid_date.year, first_valid_date.month)[1]
    end_date = datetime.date(first_valid_date.year, first_valid_date.month, last_day)

    result = []
    # Перебираем даты от first_valid_date до конца месяца, выбирая только нужные дни недели
    current_date = first_valid_date
    while current_date <= end_date:
        if current_date.weekday() in weekdays:
            result.append(current_date)
        current_date += datetime.timedelta(days=1)
    return result