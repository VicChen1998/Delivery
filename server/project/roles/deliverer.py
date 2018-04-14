import json

from django.http import HttpResponse

from project.models import User, Order, Community, Building


def get_community(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not user.has_perm('project.view_deliver_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
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


def get_building(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not user.has_perm('project.view_deliver_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
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


def get_delivery_list(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not user.has_perm('project.view_deliver_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    building = Building.objects.get(id=request.GET['building_id'])

    delivery_list = Order.objects.filter(building=building, status__in=[1, 7, 8, 9]).order_by('status')

    response = {'status': 'success', 'delivery_list': []}

    for order in delivery_list:
        response['delivery_list'].append(order.dict())
    return HttpResponse(json.dumps(response), content_type='application/json')
