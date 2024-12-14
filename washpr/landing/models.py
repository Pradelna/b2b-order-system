from django.db import models


class Menu(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    about_us = models.CharField("about us", max_length=100)
    technology = models.CharField("technology", max_length=100)
    prices = models.CharField("prices", max_length=100)
    services = models.CharField("services", max_length=100)
    linen_rent = models.CharField("linen rent", max_length=100)
    vacancies = models.CharField("vacancies", max_length=100)
    contacts = models.CharField("contact", max_length=100)
    button_request_call = models.CharField("button request call", max_length=100)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Menu lang'
        verbose_name_plural = 'Menu lang'


class StartBanner(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    title = models.CharField("banner title", max_length=200)
    description = models.TextField("description", max_length=500)
    button_request_call = models.CharField("button request call", max_length=100)
    button_two = models.CharField("button second", max_length=100)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Start banner lang'
        verbose_name_plural = 'Start banner lang'


class AboutUs(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    title = models.CharField("title", max_length=200)
    description = models.TextField("description", max_length=100)
    guarantee_quality = models.CharField("guarantee_quality", max_length=100)
    fast_service = models.CharField("fast service", max_length=100)
    round_clock_service = models.CharField("round the clock service", max_length=100)
    super_quality = models.CharField("super_quality", max_length=100)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'About us lang'
        verbose_name_plural = 'About us lang'


class Service(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    title = models.CharField("title", max_length=200)
    sub_title_1 = models.CharField("sub title 1", max_length=200)
    description_1 = models.TextField("description 1", max_length=200)
    sub_title_2 = models.CharField("sub title 2", max_length=200)
    description_2 = models.TextField("description 2", max_length=200)
    sub_title_3 = models.CharField("sub title 3", max_length=200)
    description_3 = models.TextField("description 3", max_length=200)
    sub_title_4 = models.CharField("sub title 4", max_length=200)
    description_4 = models.TextField("description 4", max_length=200)
    sub_title_5 = models.CharField("sub title 5", max_length=200)
    description_5 = models.TextField("description 5", max_length=200)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Service lang'
        verbose_name_plural = 'Service lang'


class Technologies(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    title = models.CharField("title", max_length=200)
    description = models.TextField("main description", max_length=500)
    sub_title_1 = models.CharField("sub title 1", max_length=200)
    description_1 = models.TextField("description 1", max_length=500)
    sub_title_2 = models.CharField("sub title 2", max_length=200)
    description_2 = models.TextField("description 2", max_length=500)
    sub_title_3 = models.CharField("sub title 3", max_length=200)
    description_3 = models.TextField("description 3", max_length=500)
    sub_title_4 = models.CharField("sub title 4", max_length=200)
    description_4 = models.TextField("description 4", max_length=500)
    sub_title_5 = models.CharField("sub title 5", max_length=200)
    description_5 = models.TextField("description 5", max_length=500)
    sub_title_6 = models.CharField("sub title 6", max_length=200)
    description_6 = models.TextField("description 6", max_length=500)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Technologies lang'
        verbose_name_plural = 'Technologies lang'


class Price(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    title = models.CharField("title", max_length=200)
    description = models.TextField("main description", max_length=500)
    button_text = models.CharField("button text", max_length=100)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Price lang'
        verbose_name_plural = 'Price lang'


class Contacts(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    title = models.CharField("title", max_length=200)
    company_address = models.TextField("company address", max_length=500)
    laundry_address = models.TextField("laundry address", max_length=500)
    form_name = models.CharField("form name", max_length=100)
    form_email = models.CharField("form email", max_length=100)
    form_phone = models.CharField("form phone", max_length=100)
    form_message = models.CharField("form message", max_length=100)
    button_text = models.CharField("button text", max_length=100)
    agree = models.TextField("I agree", max_length=500)
    agree_link = models.CharField("agree link", max_length=100)
    map_link = models.TextField("map link", max_length=1000)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Contacts lang'
        verbose_name_plural = 'Contacts lang'


class Footer(models.Model):
    lang = models.CharField("language", max_length=100)
    prefix = models.CharField("language prefix", max_length=10)
    cookies = models.CharField("cookies", max_length=100)
    cookies_link = models.CharField("cookies", max_length=100)
    privacy_policy = models.CharField("privacy policy", max_length=100)
    privacy_policy_link = models.CharField("privacy policy link", max_length=100)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Footer lang'
        verbose_name_plural = 'Footer lang'


class LandingPage(models.Model):
    lang = models.CharField("language prefix", max_length=100)
    prefix = models.CharField("language name", max_length=10)
    menu_about_us = models.CharField("about us", max_length=100)
    menu_technology = models.CharField("technology", max_length=100)
    menu_prices = models.CharField("prices", max_length=100)
    menu_services = models.CharField("services", max_length=100)
    menu_linen_rent = models.CharField("linen rent", max_length=100)
    menu_vacancies = models.CharField("vacancies", max_length=100)
    menu_contacts = models.CharField("contact", max_length=100)
    menu_button_request_call = models.CharField("button request call", max_length=100)

    start_banner_title = models.CharField("banner title", max_length=200)
    start_banner_description = models.TextField("description", max_length=500)
    start_banner_button_request_call = models.CharField("button request call", max_length=100)
    start_banner_button_two = models.CharField("button second", max_length=100)

    about_us_title = models.CharField("title", max_length=200)
    about_us_description = models.TextField("description", max_length=1000)
    about_us_guarantee_quality = models.CharField("guarantee_quality", max_length=100)
    about_us_fast_service = models.CharField("fast service", max_length=100)
    about_us_round_clock_service = models.CharField("round the clock service", max_length=100)
    about_us_super_quality = models.CharField("super_quality", max_length=100)

    service_title = models.CharField("title", max_length=200)
    service_sub_title_1 = models.CharField("sub title 1", max_length=200)
    service_description_1 = models.TextField("description 1", max_length=1000)
    service_sub_title_2 = models.CharField("sub title 2", max_length=200)
    service_description_2 = models.TextField("description 2", max_length=1000)
    service_sub_title_3 = models.CharField("sub title 3", max_length=200)
    service_description_3 = models.TextField("description 3", max_length=1000)
    service_sub_title_4 = models.CharField("sub title 4", max_length=200)
    service_description_4 = models.TextField("description 4", max_length=1000)
    service_sub_title_5 = models.CharField("sub title 5", max_length=200)
    service_description_5 = models.TextField("description 5", max_length=1000)

    technologies_title = models.CharField("title", max_length=200)
    technologies_description = models.TextField("main description", max_length=500)
    technologies_sub_title_1 = models.CharField("sub title 1", max_length=200)
    technologies_description_1 = models.TextField("description 1", max_length=500)
    technologies_sub_title_2 = models.CharField("sub title 2", max_length=200)
    technologies_description_2 = models.TextField("description 2", max_length=500)
    technologies_sub_title_3 = models.CharField("sub title 3", max_length=200)
    technologies_description_3 = models.TextField("description 3", max_length=500)
    technologies_sub_title_4 = models.CharField("sub title 4", max_length=200)
    technologies_description_4 = models.TextField("description 4", max_length=500)
    technologies_sub_title_5 = models.CharField("sub title 5", max_length=200)
    technologies_description_5 = models.TextField("description 5", max_length=500)
    technologies_sub_title_6 = models.CharField("sub title 6", max_length=200)
    technologies_description_6 = models.TextField("description 6", max_length=500)

    price_title = models.CharField("title", max_length=200)
    price_description = models.TextField("main description", max_length=500)
    price_button_text = models.CharField("button text", max_length=100)

    contacts_title = models.CharField("title", max_length=200)
    contacts_company_address = models.TextField("company address", max_length=500)
    contacts_laundry_address = models.TextField("laundry address", max_length=500)
    contacts_form_name = models.CharField("form name", max_length=100)
    contacts_form_email = models.CharField("form email", max_length=100)
    contacts_form_phone = models.CharField("form phone", max_length=100)
    contacts_form_message = models.CharField("form message", max_length=100)
    contacts_button_text = models.CharField("button text", max_length=100)
    contacts_agree = models.TextField("I agree", max_length=500)
    contacts_agree_link = models.CharField("agree link", max_length=100)
    contacts_map_link = models.TextField("map link", max_length=1000)

    footer_cookies = models.CharField("cookies", max_length=100)
    footer_cookies_link = models.CharField("cookies", max_length=100)
    footer_privacy_policy = models.CharField("privacy policy", max_length=100)
    footer_privacy_policy_link = models.CharField("privacy policy link", max_length=100)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Landing page content. Language'
        verbose_name_plural = 'Landing page content. Languages'

