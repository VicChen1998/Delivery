import json
import time
from decimal import Decimal

from django.utils.timezone import now
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
    profile = UserProfile.objects.get(user=user)

    order_id = timestamp + '$u=' + user.username

    building = Building.objects.get(id=request.POST['building_id'])

    pkg_position = PkgPosition.objects.get(id=request.POST['pkg_position_id'])

    status = 0
    if request.POST['pickup_next_day'] == 'True':
        status = 3

    price = request.POST['price']
    if Decimal(price) < 2:
        response = {'order_status': 'fail', 'errMsg': 'price error'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    pickup_time_unfit = False
    if 'pickup_time_unfit' in request.POST:
        if request.POST['pickup_time_unfit'] == 'true':
            pickup_time_unfit = True

    putDownstairs = False
    if 'putDownstairs' in request.POST:
        if request.POST['putDownstairs'] == 'true':
            putDownstairs = True

    voucher = None
    if 'voucher_id' in request.POST:
        try:
            voucher = Voucher.objects.get(id=request.POST['voucher_id'])
        except Voucher.DoesNotExist:
            response = {'order_status': 'fail', 'errMsg': 'voucher not exist'}
            return HttpResponse(json.dumps(response), content_type='application/json')

        if voucher.user != user:
            response = {'order_status': 'fail', 'errMsg': 'not your voucher'}
            return HttpResponse(json.dumps(response), content_type='application/json')

        if not voucher.valid:
            voucher = None
            response = {'order_status': 'fail', 'errMsg': 'voucher invalid'}
            return HttpResponse(json.dumps(response), content_type='application/json')

        voucher.use_time = now()
        voucher.valid = False
        voucher.save()

    Order.objects.create(
        id=order_id,
        date=date,
        status=status,
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
        voucher=voucher,
        comment=request.POST['comment'],
        putDownstairs=putDownstairs,
        pickup_time_unfit=pickup_time_unfit
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

    if order.status not in [0, 2, 3]:
        response = {'modify_status': 'fail', 'errMsg': 'can not modify'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    building = Building.objects.get(id=request.POST['building_id'])

    pkg_position = PkgPosition.objects.get(id=request.POST['pkg_position_id'])

    status = 0
    if request.POST['pickup_next_day'] == 'True':
        status = 3

    pickup_time_unfit = False
    if 'pickup_time_unfit' in request.POST:
        if request.POST['pickup_time_unfit'] == 'true':
            pickup_time_unfit = True

    putDownstairs = False
    if 'putDownstairs' in request.POST:
        if request.POST['putDownstairs'] == 'true':
            putDownstairs = True

    order.name = request.POST['name']
    order.phone = request.POST['phone']
    order.community = building.community
    order.building = building
    order.pkg_position = pkg_position
    order.pickup_time = request.POST['pickup_time'][:5]
    order.pkg_info = request.POST['pkg_info']
    order.comment = request.POST['comment']
    order.pickup_time_unfit = pickup_time_unfit
    order.putDownstairs = putDownstairs
    order.status = status
    order.save()

    response = {'modify_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def pay(request):
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

    if order.has_pay != 0:
        response = {'modify_status': 'fail', 'errMsg': 'has pay'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order.has_pay = 1
    order.save()

    response = {'pay_status': 'success'}
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
        order.pickup_by = user
        order.save()
    elif pickup_status == 'fail':
        order.status = 2
        order.pickup_by = user
        order.save()
    else:
        response = {'status': 'fail'}

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
    order.deliver_by = user
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

    order.deliver_by = user
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

    if order.status not in [0, 2, 3]:
        response = {'status': 'fail', 'errMsg': 'can not cancel'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order.status = 14
    order.save()

    if order.voucher:
        order.voucher.valid = True
        order.voucher.use_time = None
        order.voucher.save()

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def deliverer_cancel(request):
    if 'order_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])

    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])
    profile = UserProfile.objects.get(user=user)

    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if order.status not in [0, 2]:
        response = {'status': 'fail', 'errMsg': 'can not cancel'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order.status = 14
    order.errMsg = 'cancel by ' + user.username + ' ' + profile.name + ' ' + profile.phone
    order.save()

    if order.voucher:
        order.voucher.valid = True
        order.voucher.use_time = None
        order.voucher.save()

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def raise_price(request):
    if 'order_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])

    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])
    profile = UserProfile.objects.get(user=user)

    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if order.status not in [0, 2]:
        response = {'status': 'fail', 'errMsg': 'can not raise price'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'raise_num' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect raise num'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    raise_num = request.POST['raise_num']
    if Decimal(raise_num) < 1:
        response = {'order_status': 'fail', 'errMsg': 'price error'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order.price = Decimal(order.price) + Decimal(raise_num)
    order.errMsg = 'raise price ￥' + raise_num + ' by ' + user.username + ' ' + profile.name + ' ' + profile.phone
    order.save()
    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def confirm_pay(request):
    if 'order_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect order_id'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order = Order.objects.get(id=request.POST['order_id'])

    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])
    profile = UserProfile.objects.get(user=user)

    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    order.has_pay = 2
    order.errMsg = 'confirm pay by' + user.username + ' ' + profile.name + ' ' + profile.phone
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
