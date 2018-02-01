import json

from django.http import HttpResponse

from delivery.settings import BASE_DIR
from project.models import *


# 开放端口 获取公共数据

def resource(request):
    name = request.GET['name']
    file = open(BASE_DIR + '/static/resource/' + name, 'rb')
    response = HttpResponse(file.read(), content_type='image/png')
    return response


def get_university(request):
    university_list = University.objects.all()

    response = {'university_list': []}
    for university in university_list:
        response['university_list'].append(university.name)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_campus(request):
    university = University.objects.get(name=request.GET['university'])
    campus_list = Campus.objects.filter(university=university)

    response = {'campus_list': []}
    for campus in campus_list:
        response['campus_list'].append(campus.name)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_community(request):
    university = University.objects.get(name=request.GET['university'])
    campus = Campus.objects.get(name=request.GET['campus'], university=university)
    community_list = Community.objects.filter(university=university, campus=campus)

    response = {'community_list': []}
    for community in community_list:
        response['community_list'].append(community.name)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_building(request):
    university = University.objects.get(name=request.GET['university'])
    campus = Campus.objects.get(name=request.GET['campus'], university=university)
    community = Community.objects.get(name=request.GET['community'],
                                      university=university,
                                      campus=campus)
    building_list = Building.objects.filter(university=university,
                                            campus=campus,
                                            community=community)

    response = {'building_list': []}
    for building in building_list:
        response['building_list'].append(building.name)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_pkg_position(request):
    university = University.objects.get(name=request.GET['university'])
    campus = Campus.objects.get(name=request.GET['campus'], university=university)
    pkg_position_list = PkgPosition.objects.filter(university=university, campus=campus)

    response = {'pkg_position_list': []}
    for pkg_position in pkg_position_list:
        response['pkg_position_list'].append(pkg_position.name)
    return HttpResponse(json.dumps(response), content_type='application/json')


# 私密端口 获取个人数据

def get_order(request):
    if 'openid' not in request.GET:
        response = {'get_order_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    order_list = Order.objects.filter(user=user).order_by('-id')

    response = {'get_order_status': 'success',
                'order_count': order_list.count(),
                'order_list': []}

    for order in order_list:
        response['order_list'].append(order.dict())
    return HttpResponse(json.dumps(response), content_type='application/json')

