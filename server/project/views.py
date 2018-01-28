from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth.models import User

import json
import requests

from delivery.settings import AppID, AppSecret, BASE_DIR
from project.models import *


# Create your views here.


def test(request):
    return render(request, 'test.html')


def test0(request):
    return HttpResponse('fuck')


def signin(request):
    if 'js_code' not in request.GET:
        return HttpResponse('expect js_code.')

    js_code = request.GET['js_code']

    openid = get_openid(js_code)
    if not openid:
        response = {'signin_status': 'fail'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.filter(username=openid)
    if user.count() == 0:
        user = signup(openid)
        first_signin = True
    else:
        user = user.first()
        first_signin = False

    profile = UserProfile.objects.get(user=user)

    response = {'signin_status': 'success',
                'openid': openid,
                'first_signin': first_signin,
                'name': profile.name,
                'phone': profile.phone,
                'university': profile.university,
                'campus': profile.campus,
                'community': profile.community,
                'building': profile.building}
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_openid(js_code):
    data = {'appid': AppID,
            'secret': AppSecret,
            'js_code': js_code,
            'grant_type': 'authorization_code'}
    response = requests.get('https://api.weixin.qq.com/sns/jscode2session', params=data)

    response_json = response.json()
    if 'openid' in response_json:
        return response_json['openid']
    else:
        return False


def signup(openid):
    user = User.objects.create(username=openid)
    UserProfile.objects.create(user=user, username=openid)
    return user


def resource(request):
    name = request.GET['name']
    file = open(BASE_DIR + '/static/resource/' + name, 'rb')
    response = HttpResponse(file.read(), content_type='image/png')
    return response


def upload_userinfo(request):
    data = request.POST.dict()

    if 'openid' not in data:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = data['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    profile.nickname = data['nickName']
    profile.gender = data['gender']
    profile.language = data['language']
    profile.city = data['city']
    profile.province = data['province']
    profile.country = data['country']
    profile.avatarUrl = data['avatarUrl']
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def upload_delivery_info(request):
    data = request.POST.dict()

    if 'openid' not in data:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = data['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    profile.name = data['name']
    profile.phone = data['phone']
    profile.university = data['university']
    profile.campus = data['campus']
    profile.community = data['community']
    profile.building = data['building']
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')
