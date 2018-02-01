import json
from django.http import HttpResponse

from project.models import User, UserProfile, University, Campus, Community, Building


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
    if 'openid' not in request.POST:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = request.POST['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    university, campus, community, building = None, None, None, None

    if request.POST['university']:
        university = University.objects.get(name=request.POST['university'])
    if university and request.POST['campus']:
        campus = Campus.objects.get(name=request.POST['campus'], university=university)
    if university and campus and request.POST['community']:
        community = Community.objects.get(name=request.POST['community'], university=university, campus=campus)
    if university and campus and community and request.POST['building']:
        building = Building.objects.get(name=request.POST['building'],
                                        university=university,
                                        campus=campus,
                                        community=community)

    profile.name = request.POST['name']
    profile.phone = request.POST['phone']
    profile.university = university
    profile.campus = campus
    profile.community = community
    profile.building = building
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')
