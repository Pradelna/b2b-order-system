from rest_framework import serializers
from .models import LandingPage


class LandingPageSerializer(serializers.ModelSerializer):
    # Кастомные поля
    menu = serializers.SerializerMethodField()
    start_banner = serializers.SerializerMethodField()
    about_us = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    technologies = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()
    contacts = serializers.SerializerMethodField()
    footer = serializers.SerializerMethodField()
    auth = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    buttons = serializers.SerializerMethodField()
    messages = serializers.SerializerMethodField()
    order = serializers.SerializerMethodField()
    form = serializers.SerializerMethodField()
    place = serializers.SerializerMethodField()
    success = serializers.SerializerMethodField()

    class Meta:
        model = LandingPage
        fields = [
            'lang', 'prefix', 'menu', 'start_banner', 'about_us', 'service', 'messages', 'form',
            'technologies', 'price', 'contacts', 'footer', 'auth', 'customer', 'buttons', 'order',
            'place', 'success'
        ]

    def get_menu(self, obj):
        return {
            'about_us': obj.menu_about_us,
            'technology': obj.menu_technology,
            'prices': obj.menu_prices,
            'services': obj.menu_services,
            'linen_rent': obj.menu_linen_rent,
            'vacancies': obj.menu_vacancies,
            'contacts': obj.menu_contacts,
            'button_request_call': obj.menu_button_request_call,
            'header_home': obj.header_home,
            'header_login': obj.header_login,
            'header_logout': obj.header_logout,
            'header_account': obj.header_account,
            'header_panel': obj.header_panel,
        }

    def get_start_banner(self, obj):
        return {
            'title': obj.start_banner_title,
            'description': obj.start_banner_description,
            'button_request_call': obj.start_banner_button_request_call,
            'button_two': obj.start_banner_button_two,

        }

    def get_about_us(self, obj):
        return {
            'title': obj.about_us_title,
            'description': obj.about_us_description,
            'guarantee_quality': obj.about_us_guarantee_quality,
            'fast_service': obj.about_us_fast_service,
            'round_clock_service': obj.about_us_round_clock_service,
            'super_quality': obj.about_us_super_quality,
        }

    def get_service(self, obj):
        return {
            'title': obj.service_title,
            'sub_title_1': obj.service_sub_title_1,
            'description_1': obj.service_description_1,
            'sub_title_2': obj.service_sub_title_2,
            'description_2': obj.service_description_2,
            'sub_title_3': obj.service_sub_title_3,
            'description_3': obj.service_description_3,
            'sub_title_4': obj.service_sub_title_4,
            'description_4': obj.service_description_4,
            'sub_title_5': obj.service_sub_title_5,
            'description_5': obj.service_description_5,
        }

    def get_technologies(self, obj):
        return {
            'title': obj.technologies_title,
            'description': obj.technologies_description,
            'sub_title_1': obj.technologies_sub_title_1,
            'description_1': obj.technologies_description_1,
            'sub_title_2': obj.technologies_sub_title_2,
            'description_2': obj.technologies_description_2,
            'sub_title_3': obj.technologies_sub_title_3,
            'description_3': obj.technologies_description_3,
            'sub_title_4': obj.technologies_sub_title_4,
            'description_4': obj.technologies_description_4,
            'sub_title_5': obj.technologies_sub_title_5,
            'description_5': obj.technologies_description_5,
            'sub_title_6': obj.technologies_sub_title_6,
            'description_6': obj.technologies_description_6,
        }

    def get_price(self, obj):
        return {
            'title': obj.price_title,
            'description': obj.price_description,
            'button_text': obj.price_button_text,
        }

    def get_contacts(self, obj):
        return {
            'title': obj.contacts_title,
            'company_address': obj.contacts_company_address,
            'laundry_address': obj.contacts_laundry_address,
            'form_name': obj.contacts_form_name,
            'form_email': obj.contacts_form_email,
            'form_phone': obj.contacts_form_phone,
            'form_message': obj.contacts_form_message,
            'button_text': obj.contacts_button_text,
            'agree': obj.contacts_agree,
            'agree_link': obj.contacts_agree_link,
            'map_link': obj.contacts_map_link,
        }

    def get_footer(self, obj):
        return {
            'cookies': obj.footer_cookies,
            'cookies_link': obj.footer_cookies_link,
            'privacy_policy': obj.footer_privacy_policy,
            'privacy_policy_link': obj.footer_privacy_policy_link,
        }

    def get_auth(self, obj):
        return {
            'login': obj.auth_login,
            'email': obj.auth_email,
            'password': obj.auth_pass,
            'no_account': obj.auth_no_account,
            'create_one': obj.auth_create_one,
            'forgot_password': obj.auth_forgot,
            'register': obj.auth_reg,
            'check_email': obj.auth_check_email,
            'account_activated': obj.auth_activate,
            'activation_error': obj.auth_activate_error,
            'server_error': obj.auth_failed_server,
            'invalid_token': obj.auth_invalid_link,
            'button_ok': obj.auth_button_ok,
            'button_error': obj.auth_button_error,
            'author_error': obj.auth_author_error,
            'unknown_error': obj.auth_unknown_error,
            'network_error': obj.auth_network_error,
            'logout': obj.auth_logout,
            'pass_reset': obj.auth_pass_reset,
            'log_data': obj.auth_log_data,
        }

    def get_customer(self, obj):
        return {
            'full_name': obj.customer_full_name,
            'company_name': obj.customer_company_name,
            'company_number': obj.customer_company_number,
            'vat_number': obj.customer_vat_number,
            'phone': obj.customer_phone,
            'company_address': obj.customer_company_address,
            'vop': obj.customer_vop,
            'terms_use': obj.customer_terms_use,
            'gdpr': obj.customer_gdpr,
            'vop_check': obj.customer_vop_check,
            'terms_use_check': obj.customer_terms_use_check,
            'gdpr_check': obj.customer_gdpr_check,
            'uploaded_files': obj.customer_uploaded_files,
            'important_files': obj.customer_important_files,
            'send_to_check': obj.customer_send_to_check,
            'wait_for_active': obj.customer_wait_for_active,
            'your_places': obj.customer_your_places,
            'you_dont_have_place': obj.customer_you_dont_have_place,
            'new_data_change': obj.new_data_change,
            'new_data_wait': obj.new_data_wait,
            'new_data_faktur': obj.new_data_faktur,
        }

    def get_buttons(self, obj):
        return {
            'submit': obj.button_submit,
            'cancel': obj.button_cancel,
            'upload': obj.button_upload,
            'uploading': obj.button_uploading,
            'add_place': obj.button_add_place,
            'all_history': obj.button_all_history,
            'invoices': obj.button_invoices,
            'new_order': obj.button_new_order,
            'details': obj.button_details,
            'back': obj.button_back,
            'delete_place': obj.button_delete_place,
        }

    def get_messages(self, obj):
        return {
            'file_ok': obj.message_file_ok,
            'file_del_quest': obj.message_file_del_quest,
            'file_failed': obj.message_file_failed,
            'file_try_again': obj.message_file_try_again,
            'file_deleted': obj.message_file_deleted,
            'file_failed_delete': obj.message_file_failed_delete,
            'file_failed_while_deleting': obj.message_file_failed_while_deleting,
            'file_size': obj.message_file_size,
            'order_created': obj.message_order_created,
        }

    def get_order(self, obj):
        return {
            'type_sipping_clear_for_dirty': obj.order_type_sipping_clear_for_dirty,
            'type_sipping_1_in_3': obj.order_type_sipping_1_in_3,
            'one_time': obj.order_one_time,
            'quick': obj.order_quick,
            'note_sh_cl_dr': obj.order_note_sh_cl_dr,
            'note_sh_1_3': obj.order_note_sh_1_3,
            'note_one_time': obj.order_note_one_time,
            'note_quick': obj.order_note_quick,
            'note_every_week': obj.order_note_every_week,
            'mon_wed_fri': obj.order_mon_wed_fri,
            'tue_thu': obj.order_tue_thu,
            'every_day': obj.order_every_day,
            'every_day_with_weekend': obj.order_every_day_with_weekend,
            'own_system': obj.order_own_system,
            'day_next_visit': obj.order_day_next_visit,
            'info_waiting': obj.order_info_waiting,
            'status': obj.order_status,
            'current_order': obj.order_current_order,
            'days': obj.order_days,
        }

    def get_form(self, obj):
        return {
            'add_place': obj.form_add_place,
            'place_name': obj.form_place_name,
            'rp_city': obj.form_rp_city,
            'rp_street': obj.form_rp_street,
            'rp_zip': obj.form_rp_zip,
            'rp_number': obj.form_rp_number,
            'rp_person': obj.form_rp_person,
            'rp_email': obj.form_rp_email,
            'rp_phone': obj.form_rp_phone,
            'create_order': obj.form_create_order,
            'place': obj.form_place,
            'type_ship': obj.form_type_ship,
            'system': obj.form_system,
            'start_day': obj.form_start_day,
            'note': obj.form_note,
            'type_note': obj.form_type_note,
            'select_place': obj.form_select_place,
            'select_type': obj.form_select_type,
            'select_system': obj.form_select_system,
            'close': obj.form_close,
            'monday': obj.form_monday,
            'tuesday': obj.form_tuesday,
            'wednesday': obj.form_wednesday,
            'thursday': obj.form_thursday,
            'friday': obj.form_friday,
            'saturday': obj.form_saturday,
            'sunday': obj.form_sunday,
        }

    def get_success(self, obj):
        return {
            'success': obj.success_success,
            'message_mistake_1': obj.success_message_mistake_1,
            'message_mistake_2': obj.success_message_mistake_2,
            'message_mistake_3': obj.success_message_mistake_3,
            'message_mate_30': obj.success_message_mate_30,
            'order_success': obj.success_order_success,
        }

    def get_place(self, obj):
        return {
            'detail_title': obj.place_detail_title,
            'address': obj.place_address,
            'edit_place': obj.place_edit_place,
            'no_edit_place': obj.place_no_edit_place,
        }