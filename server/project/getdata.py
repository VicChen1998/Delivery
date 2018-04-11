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


def get_pay_qrcode(request):
    campus_id = request.GET['campus_id']
    method = request.GET['method']

    qrcode = open(BASE_DIR + '/static/pay_qrcodes/' + campus_id + '_' + method + '.jpg', 'rb')
    return HttpResponse(qrcode.read(), content_type='image/png')


def get_status(request):
    if 'key' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect status key'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    key = request.GET['key']

    if key == 'isShareQrcodeInTest':
        response = {'status': 'success', 'value': True}
        return HttpResponse(json.dumps(response), content_type='application/json')

    else:
        response = {'status': 'fail', 'errMsg': 'no such key'}
        return HttpResponse(json.dumps(response), content_type='application/json')


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
        item = {'id': campus.id, 'name': campus.name}
        response['campus_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_community(request):
    community_list = Community.objects.filter(campus_id=request.GET['campus_id'])

    response = {'community_list': []}
    for community in community_list:
        item = {'id': community.id, 'name': community.name}
        response['community_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_building(request):
    building_list = Building.objects.filter(community_id=request.GET['community_id'])

    response = {'building_list': []}
    for building in building_list:
        item = {'id': building.id, 'name': building.name}
        response['building_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_pkg_position(request):
    pkg_position_list = PkgPosition.objects.filter(campus_id=request.GET['campus_id'])

    response = {'pkg_position_list': []}
    for pkg_position in pkg_position_list:
        item = {'id': pkg_position.id, 'name': pkg_position.name, 'pickup_time': pkg_position.pickup_time.split(',')}
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


def get_voucher(request):
    if 'openid' not in request.GET:
        response = {'get_voucher_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    profile = UserProfile.objects.get(user=user)

    response = {'get_voucher_status': 'success',
                'voucher': profile.voucher}
    return HttpResponse(json.dumps(response), content_type='application/json')


# 私密端口 获取配送清单


def deliverer_get_pkg_position(request):
    if 'openid' not in request.GET:
        response = {'get_pkg_position_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'get_pkg_position_status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    pkg_position_list = PkgPosition.objects.filter(campus_id=request.GET['campus_id'])

    pickup_time_list = []
    pkg_position_by_time_list = []

    for position in pkg_position_list:
        pickup_time_option = position.pickup_time.split(',')
        for pickup_time in pickup_time_option:
            if pickup_time not in pickup_time_list:
                pickup_time_list.append(pickup_time)
                pkg_position_by_time_list.append({'pickup_time': pickup_time})

            for item in pkg_position_by_time_list:
                if item['pickup_time'] == pickup_time:
                    if 'pkg_position_list' not in item:
                        item['pkg_position_list'] = []
                    pickup_list = Order.objects.filter(pkg_position=position, status__in=[0, 1, 2],
                                                       pickup_time=item['pickup_time'])
                    item['pkg_position_list'].append({'id': position.id,
                                                      'name': position.name,
                                                      'order_count': pickup_list.count(),
                                                      'pending_count': pickup_list.filter(status=0).count()})
                    break

    pkg_position_by_time_list = sorted(pkg_position_by_time_list, key=lambda x: x['pickup_time'])

    not_pickup_count = Order.objects.filter(status=2, campus_id=request.GET['campus_id']).count()

    response = {'pkg_position_by_time_list': pkg_position_by_time_list,
                'not_pickup_count': not_pickup_count}
    return HttpResponse(json.dumps(response), content_type='application/json')


def deliverer_get_community(request):
    if 'openid' not in request.GET:
        response = {'get_pkg_position_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'get_pkg_position_status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    community_list = Community.objects.filter(campus_id=request.GET['campus_id'])

    response = {'community_list': []}
    for community in community_list:
        delivery_list = Order.objects.filter(community=community, status__in=[1, 7, 8, 9])
        item = {'id': community.id,
                'name': community.name,
                'order_count': delivery_list.count(),
                'pending_count': delivery_list.filter(status=1).count()}
        response['community_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def deliverer_get_building(request):
    if 'openid' not in request.GET:
        response = {'get_pkg_position_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'get_pkg_position_status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    building_list = Building.objects.filter(community_id=request.GET['community_id'])

    response = {'building_list': []}
    for building in building_list:
        delivery_list = Order.objects.filter(building=building, status__in=[1, 7, 8, 9])
        if delivery_list.count() != 0:
            item = {'id': building.id,
                    'name': building.name,
                    'order_count': delivery_list.count(),
                    'pending_count': delivery_list.filter(status=1).count()}
            response['building_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_pickup_fail_list(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order_list = Order.objects.filter(status=2, campus_id=request.GET['campus_id'])

    response = {'pickup_fail_list': []}
    for order in order_list:
        response['pickup_fail_list'].append(order.dict())
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_pickup_list(request):
    if 'openid' not in request.GET:
        response = {'get_pickup_list_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'get_pickup_list_status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    pkg_position = PkgPosition.objects.get(id=request.GET['pkg_position_id'])
    pickup_time = request.GET['pickup_time']

    pickup_list = Order.objects.filter(pkg_position=pkg_position,
                                       pickup_time=pickup_time,
                                       status__in=[0, 1, 2]).order_by('status')

    response = {'get_pickup_list_status': 'success',
                'pkg_position_name': pkg_position.name,
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

    building = Building.objects.get(id=request.GET['building_id'])

    delivery_list = Order.objects.filter(building=building, status__in=[1, 7, 8, 9]).order_by('status')

    response = {'get_delivery_list_status': 'success', 'delivery_list': []}

    for order in delivery_list:
        response['delivery_list'].append(order.dict())
    return HttpResponse(json.dumps(response), content_type='application/json')


def deliverer_search(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    keyword = request.GET['keyword']

    if keyword.isdigit():
        results = Order.objects.filter(phone__contains=keyword).order_by('-date')
    else:
        results = Order.objects.filter(name__contains=keyword).order_by('-date')

    response = {'status': 'success',
                'count': results.count(),
                'results': []
                }
    for order in results:
        response['results'].append(order.dict())

    return HttpResponse(json.dumps(response), content_type='application/json')
