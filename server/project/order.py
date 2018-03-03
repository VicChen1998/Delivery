import json
import time
from decimal import getcontext, Decimal

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

    price = request.POST['price']
    if Decimal(price) < 2:
        response = {'order_status': 'fail', 'errMsg': 'price error'}
        return HttpResponse(json.dumps(response), content_type='application/json')


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
        pickup_time=request.POST['pickup_time'][:5],
        pkg_info=request.POST['pkg_info'],
        price=Decimal(price),
        comment=request.POST['comment'],
    )

    response = {'order_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def modify(request):
    if 'openid' not in request.POST:
        response = {'modify_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'order_id' not in request.POST:
        response = {'modify_status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])    

    order = Order.objects.get(id=request.POST['order_id'])

    if user.id != order.user.id:
        response = {'modify_status': 'fail', 'errMsg': 'not your order'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if order.status not in [0,2]:
        response = {'modify_status': 'fail', 'errMsg': 'can not modify'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    building = Building.objects.get(id=request.POST['building_id'])

    pkg_position = PkgPosition.objects.get(id=request.POST['pkg_position_id'])

    order.name = request.POST['name']
    order.phone = request.POST['phone']
    order.community = building.community
    order.building = building
    order.pkg_position = pkg_position
    order.pickup_time=request.POST['pickup_time'][:5]
    order.pkg_info = request.POST['pkg_info']
    order.comment = request.POST['comment']
    order.status = 0
    order.save()

    response = {'modify_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


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
        order.status = 2
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
    order.status = 7
    order.save()

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def not_delivery(request):
    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])

    errMsg = request.POST['errMsg']

    if errMsg == '次日再送':
        order.status = 8
    elif errMsg == '联系不上':
        order.status = 9
    else:
        order.status = -1
        order.errMsg = errMsg

    order.save()

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def cancel(request):
    if 'order_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])

    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])

    if order.user.username != user.username:
        response = {'status': 'fail', 'errMsg': 'not your order'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if order.status != 0:
        response = {'status': 'fail', 'errMsg': 'can not cancel'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    
    order.status = 14
    order.save()
    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def receive(request):
    if 'order_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    
    order = Order.objects.get(id=request.POST['order_id'])

    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])

    if order.user.username != user.username:
        response = {'status': 'fail', 'errMsg': 'not your order'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if order.status == 7:
        order.status = 13
        order.save()
        response = {'status': 'success'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    else:
        response = {'status': 'fail', 'errMsg': 'can not receive'}
        return HttpResponse(json.dumps(response), content_type='application/json')


def deliver_next_day():

    date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
    print('\n\n# # # # # ' + date + ' # # # # #\n')

    order_list = Order.objects.filter(status__in=[8,9])

    for order in order_list:
        order.status = 1
        order.save()
        print(order.dict())
        print('\n')