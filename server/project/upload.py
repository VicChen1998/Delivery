import json
from django.http import HttpResponse

from project.models import User, UserProfile, Building


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


def upload_address(request):
    if 'openid' not in request.POST:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = request.POST['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    university, campus, community, building = None, None, None, None

    if request.POST['building_id']:
        building = Building.objects.get(id=request.POST['building_id'])

    profile.name = request.POST['name']
    profile.phone = request.POST['phone']
    profile.university_id = building.university.id
    profile.campus_id = building.campus.id
    profile.community_id = building.community.id
    profile.building = building
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')
