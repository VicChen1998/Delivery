from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.

from project.crontab import check_access_token


def test(request):
    check_access_token()
    return render(request, 'test.html')


def test0(request):
    return HttpResponse('fuck')
