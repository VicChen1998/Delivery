import json
import requests

from django.http import HttpResponse

from delivery.settings import AppID, AppSecret
from project.models import User, UserProfile


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


def signin(request):
    if 'js_code' not in request.GET:
        response = {'signin_status': 'fail', 'errMsg': 'expect js_code'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = get_openid(request.GET['js_code'])
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

    university, campus, community, building = '', '', '', ''

    if profile.university:
        university = profile.university.name
    if profile.campus:
        campus = profile.campus.name
    if profile.community:
        community = profile.community.name
    if profile.building:
        building = profile.building.name

    response = {'signin_status': 'success',
                'openid': openid,
                'first_signin': first_signin,
                'name': profile.name,
                'phone': profile.phone,
                'university': university,
                'campus': campus,
                'community': community,
                'building': building}
    return HttpResponse(json.dumps(response), content_type='application/json')


def signup(openid):
    user = User.objects.create(username=openid)
    UserProfile.objects.create(user=user, username=openid)
    return user