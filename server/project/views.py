from django.shortcuts import render
from django.http import HttpResponse

from project.getdata import *


# Create your views here.


def test(request):
    return render(request, 'test.html')


def test0(request):
    return HttpResponse('fuck')
