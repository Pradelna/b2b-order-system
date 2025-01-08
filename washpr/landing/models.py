from django.db import models


class LandingPage(models.Model):
    lang = models.CharField("language prefix", max_length=100)
    prefix = models.CharField("language name", max_length=10)
    header_home = models.CharField("about us", max_length=100)
    header_login = models.CharField("login", max_length=100)
    header_logout = models.CharField("logout", max_length=100)
    header_account = models.CharField("account", max_length=100)
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

    auth_login = models.CharField("log in", max_length=100, blank=True, null=True)
    auth_email = models.CharField("your email", max_length=100, blank=True, null=True)
    auth_pass = models.CharField("password", max_length=100, blank=True, null=True)
    auth_no_account = models.CharField("Don't have an account yet", max_length=150, blank=True, null=True)
    auth_create_one = models.CharField("Create one", max_length=150, blank=True, null=True)
    auth_forgot = models.CharField("Forgot pass", max_length=150, blank=True, null=True)
    auth_reg = models.CharField("Create account", max_length=150, blank=True, null=True)
    auth_check_email = models.CharField("User created. Check your email", max_length=150, blank=True, null=True)
    auth_activate = models.CharField("Account activated successfully", max_length=150, blank=True, null=True)
    auth_activate_error = models.CharField("Activation error", max_length=150, blank=True, null=True)
    auth_failed_server = models.CharField("Failed to contact the server", max_length=150, blank=True, null=True)
    auth_invalid_link = models.CharField("Invalid or expired token", max_length=150, blank=True, null=True)
    auth_button_ok = models.CharField("Log in", max_length=100, blank=True, null=True)
    auth_button_error = models.CharField("Back to web site if error", max_length=100, blank=True, null=True)
    auth_author_error = models.CharField("Authorization error", max_length=100, blank=True, null=True)
    auth_unknown_error = models.CharField("unknown error", max_length=50, blank=True, null=True)
    auth_network_error = models.CharField("network error", max_length=50, blank=True, null=True)

    customer_full_name = models.CharField("Name and surname", max_length=200, blank=True, null=True)
    customer_company_name = models.CharField("Company name", max_length=200, blank=True, null=True)
    customer_company_number = models.CharField("Company number", max_length=200, blank=True, null=True)
    customer_vat_number = models.CharField("VAT EU number", max_length=200, blank=True, null=True)
    customer_phone = models.CharField("Phone number", max_length=200, blank=True, null=True)
    customer_company_address = models.CharField("Company address", max_length=200, blank=True, null=True)
    customer_vop = models.CharField("VOP", max_length=200, blank=True, null=True)
    customer_terms_use = models.CharField("Terms of use", max_length=200, blank=True, null=True)
    customer_gdpr = models.CharField("GDPR", max_length=200, blank=True, null=True)
    customer_vop_check = models.CharField("VOP read", max_length=200, blank=True, null=True)
    customer_terms_use_check = models.CharField("Terms of use read", max_length=200, blank=True, null=True)
    customer_gdpr_check = models.CharField("GDPR read", max_length=200, blank=True, null=True)

    button_submit = models.CharField("Button submit", max_length=50, blank=True, null=True)
    button_upload = models.CharField("Button upload file", max_length=50, blank=True, null=True)
    button_uploading = models.CharField("Button uploading", max_length=50, blank=True, null=True)

    message_file_ok = models.CharField("File uploaded successfully!", max_length=100, blank=True, null=True)
    message_file_size = models.CharField("The selected file exceeds the maximum size of 2MB", max_length=100,
                                         blank=True, null=True)
    message_file_del_quest = models.CharField("Are you sure you want to delete this file?", max_length=100, blank=True,
                                              null=True)
    message_file_failed = models.CharField("Failed to upload file", max_length=100, blank=True, null=True)
    message_file_try_again = models.CharField("An error occurred while uploading the file. Please try again",
                                           max_length=200, blank=True, null=True)
    message_file_deleted = models.CharField("File deleted successfully!", max_length=100, blank=True, null=True)
    message_file_failed_delete = models.CharField("Failed to delete the file", max_length=100, blank=True, null=True)
    message_file_failed_while_deleting = models.CharField("An error occurred while deleting the file", max_length=100,
                                                          blank=True, null=True)

    def __str__(self):
        return self.lang

    class Meta:
        verbose_name = 'Landing page content. Language'
        verbose_name_plural = 'Landing page content. Languages'
