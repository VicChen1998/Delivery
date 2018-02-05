import json
import time

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
        item = {'id': university.id, 'name': university.name}
        response['university_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_campus(request):
    campus_list = Campus.objects.filter(university_id=request.GET['university_id'])

    response = {'campus_list': []}
    for campus in campus_list:
        item = {'id':campus.id, 'name': campus.name}
        response['campus_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_community(request):
    community_list = Community.objects.filter(campus_id=request.GET['campus_id'])

    response = {'community_list': []}
    for community in community_list:
        item = {'id':community.id, 'name': community.name}
        response['community_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_building(request):
    building_list = Building.objects.filter(community_id=request.GET['community_id'])

    response = {'building_list': []}
    for building in building_list:
        item = {'id':building.id,'name':building.name}
        response['building_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_pkg_position(request):
    pkg_position_list = PkgPosition.objects.filter(campus_id=request.GET['campus_id'])

    response = {'pkg_position_list': []}
    for pkg_position in pkg_position_list:
        item = {'id':pkg_position.id, 'name':pkg_position.name}
        response['pkg_position_list'].append(item)
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


# 私密端口 获取配送清单

def get_pickup_list(request):
    if 'openid' not in request.GET:
        response = {'get_pickup_list_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'get_pickup_list_status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    current_time = time.localtime(time.time())
    date = time.strftime('%Y-%m-%d', current_time)

    pkg_position = PkgPosition.objects.get(id=request.GET['pkg_position_id'])

    pickup_list = Order.objects.filter(date=date, pkg_position=pkg_position)

    response = {'get_pickup_list_status': 'success',
                'pkg_position_name':pkg_position.name,
                'pickup_list_count': pickup_list.count(),
                'pickup_list': []}

    for order in pickup_list:
        response['pickup_list'].append(order.dict())
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_delivery_list(request):
    if 'openid' not in request.GET:
        response = {'get_delivery_list_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'get_delivery_list_status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    current_time = time.localtime(time.time())
    date = time.strftime('%Y-%m-%d', current_time)

    community = Community.objects.get(id=request.GET['community_id'])

    delivery_list = Order.objects.filter(community=community).order_by('building_id')

    response = {'get_delivery_list_status': 'success',
                'community_name':community.name,
                'delivery_list_count': delivery_list.count(),
                'delivery_list': []}

    for order in delivery_list:
        response['delivery_list'].append(order.dict())
    return HttpResponse(json.dumps(response), content_type='application/json')