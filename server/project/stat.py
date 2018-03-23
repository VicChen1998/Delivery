import json
import time
import datetime

from django.shortcuts import render
from django.http import HttpResponse

from project.models import *


def mobile(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    profile = UserProfile.objects.get(user=user)

    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    if not user.is_superuser:
        response = {'status': 'fail', 'errMsg': 'you are not superuser'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    date = time.strftime('%Y-%m-%d', time.localtime(time.time()))

    order_list = Order.objects.filter(date=date, campus=profile.campus)

    cancel_order_list = order_list.filter(status__in=[14, 15])
    today_order_count = order_list.count() - cancel_order_list.count()

    building_stat = {}
    building_list = Building.objects.filter(campus=profile.campus)
    for building in building_list:
        building_stat[building.id] = {
            'id': building.id,
            'name': building.halfname(),
            'order_num': 0,
        }

    for order in order_list:
        building_stat[order.building.id]['order_num'] += 1

    building_stat = list(building_stat.values())
    building_stat = sorted(building_stat, key=lambda b: b['id'])

    response = {
        'status': 'success',
        'stat_data': {
            'today_order_count': today_order_count,
            'building_stat': building_stat
        }
    }
    return HttpResponse(json.dumps(response), content_type='application/json')


def num2str(num):
    if num == 2:
        return 'two'
    elif num == 3:
        return 'three'
    elif num == 4:
        return 'four'
    elif num == 5:
        return 'five'
    elif num == 6:
        return 'six'
    elif num == 7:
        return 'seven'
    elif num == 8:
        return 'eight'
    elif num == 9:
        return 'nine'
    elif num == 10:
        return 'ten'


def day(request):
    if 'date' in request.GET:
        date = request.GET['date']
        date = datetime.datetime.strptime(date, "%Y-%m-%d")
    else:
        date = datetime.date.today()

    order_list = Order.objects.filter(date=date, status__in=[0, 1, 2, 3, 7, 8, 9, 13])

    total_stat = {
        'order_num': 0,
        'amount': 0,
        'two': 0, 'three': 0, 'four': 0, 'five': 0, 'six': 0, 'seven': 0, 'eight': 0, 'nine': 0, 'ten': 0,
    }

    building_stat = {}
    building_list = Building.objects.all()
    for building in building_list:
        building_stat[building.id] = {
            'id': building.id,
            'name': building.halfname(),
            'order_num': 0,
            'amount': 0,
            'two': 0, 'three': 0, 'four': 0, 'five': 0, 'six': 0, 'seven': 0, 'eight': 0, 'nine': 0, 'ten': 0,
        }

    for order in order_list:
        building_stat[order.building.id]['order_num'] += 1

        price = num2str(order.price)

        building_stat[order.building.id][price] += 1
        building_stat[order.building.id]['amount'] += order.price

    building_stat = list(building_stat.values())
    building_stat = sorted(building_stat, key=lambda b: b['id'])

    price_options = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']

    for building in building_stat:
        total_stat['order_num'] += building['order_num']
        total_stat['amount'] += building['amount']

        for p in price_options:
            if building[p] != 0:
                total_stat[p] += building[p]
            else:
                building[p] = ''

    return render(request, 'stat/day.html', locals())


def growth(request):
    return render(request, 'stat/growth.html', locals())


def get_growth_data(request):
    stat_list = StatDay.objects.all()

    data_list = []
    for stat in stat_list:
        data = {
            '日期': str(stat.date)[5:],
            '订单数量': stat.count,
            '总金额': float(stat.amount),
        }
        data_list.append(data)

    return HttpResponse(json.dumps(data_list), content_type='application/json')
