from django.shortcuts import render
from django.http import HttpResponse


# Create your views here.

from project.models import *
from project import voucher

def test(request):
    user = User.objects.get(id=627)
    voucher.give(user, 2)
    return render(request, 'test.html')


def test0(request):
    return HttpResponse('fuck')
