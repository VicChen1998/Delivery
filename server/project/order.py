import json
import time

from django.http import HttpResponse

from project.models import *


def order(request):
    if 'openid' not in request.POST:
        response = {'order_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    current_time = time.localtime(time.time())
    timestamp = time.strftime('%Y%m%d%H%M%S', current_time)
    date = time.strftime('%Y-%m-%d', current_time)

    user = User.objects.get(username=request.POST['openid'])

    order_id = timestamp + '$u=' + user.username

    building = Building.objects.get(id=request.POST['building_id'])

    pkg_position = PkgPosition.objects.get(id=request.POST['pkg_position_id'])

    # TODO: 价格
    Order.objects.create(
        id=order_id,
        date=date,
        status=0,
        user=user,
        name=request.POST['name'],
        phone=request.POST['phone'],
        university=building.university,
        campus=building.campus,
        community=building.community,
        building=building,
        pkg_position=pkg_position,
        pkg_info=request.POST['pkg_info'],
        price=10,
        comment=request.POST['comment'],
    )

    response = {'order_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def modify(request):
    pass


def pickup(request):
    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])

    pickup_status = request.POST['pickup_status']
    response = {'status': 'success'}

    if pickup_status == 'success':
        order.status = 1
    elif pickup_status == 'fail':
        order.status = -1
    else:
        response = {'status':'fail'}

    order.save()

    return HttpResponse(json.dumps(response), content_type='application/json')


def delivery(request):
    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])
    order.status = 2
    order.save()

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def cancel(request):
    if 'order_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])

    if order.status == 0:
        order.status = -2
        order.save()
        response = {'status': 'success'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        response = {'status': 'fail', 'errMsg': 'can not cancel'}
        return HttpResponse(json.dumps(response), content_type='application/json')


def receive(request):
    if 'order_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    
    order = Order.objects.get(id=request.POST['order_id'])

    if order.status == 2:
        order.status = 3
        order.save()
        response = {'status': 'success'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        response = {'status': 'fail', 'errMsg': 'can not receive'}
        return HttpResponse(json.dumps(response), content_type='application/json')