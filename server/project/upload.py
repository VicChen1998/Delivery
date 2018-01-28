import json
from django.http import HttpResponse

from project.models import *


def upload_userinfo(request):
    if 'openid' not in request.POST:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = request.POST['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    profile.nickname = request.POST['nickName']
    profile.gender = request.POST['gender']
    profile.language = request.POST['language']
    profile.city = request.POST['city']
    profile.province = request.POST['province']
    profile.country = request.POST['country']
    profile.avatarUrl = request.POST['avatarUrl']
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def upload_delivery_info(request):
    request.POST = request.POST.dict()

    if 'openid' not in request.POST:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = request.POST['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    university, campus, community, building = None, None, None, None

    if request.POST['university']:
        university = University.objects.get(name=request.POST['university'])
    if request.POST['campus']:
        university = Campus.objects.get(name=request.POST['campus'])
    if request.POST['community']:
        university = Community.objects.get(name=request.POST['community'])
    if request.POST['building']:
        university = Building.objects.get(name=request.POST['building'])

    profile.name = request.POST['name']
    profile.phone = request.POST['phone']
    profile.university = university
    profile.campus = campus
    profile.community = community
    profile.building = building
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')
