from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import *
from .serializer import *


def landing_page(request):
    return render(request, 'index.html')


class LandingView(APIView):
    def get(self, request):
        output = [
            {
                'lang': output.lang,
                'prefix': output.prefix,
                'about_us': output.about_us,
                'technology': output.technology,
                'prices': output.prices,
                'services': output.services,
                'linen_rent': output.linen_rent,
                'vacancies': output.vacancies,
                'contacts': output.contacts,
                'button_request_call': output.button_request_call,
            } for output in Menu.objects.all()
        ]
        return Response(output)

    def post(self, request):
        serializer = MenuSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)
