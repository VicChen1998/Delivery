import json

from django.http import HttpResponse

from project.models import User, Order, PkgPosition


def get_pkg_position(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not user.has_perm('project.view_pickup_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
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


def get_pickup_list(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not user.has_perm('project.view_pickup_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
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


def get_pickup_fail_list(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not user.has_perm('project.view_pickup_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order_list = Order.objects.filter(status=2, campus_id=request.GET['campus_id'])

    response = {'pickup_fail_list': []}
    for order in order_list:
        response['pickup_fail_list'].append(order.dict())
    return HttpResponse(json.dumps(response), content_type='application/json')
