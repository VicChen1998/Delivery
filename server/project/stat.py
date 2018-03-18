import json
import time

from django.http import HttpResponse

from project.models import *

def stat(request):
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

    order_list = Order.objects.filter(date=date)

    building_stat = {}
    building_list = Building.objects.filter(campus=profile.campus)
    for building in building_list:
        building_stat[building.id] = {
            'id': building.id,
            'name': building.halfname(),
            'order_num': 0,
        }

    for order in order_list:
        building_stat[order_list][order_num] += 1

    building_stat = list(building_stat.values())
    building_stat = sorted(building_stat, key=lambda building: building['id'])

    response = {
        'status': 'success',
        'stat_data': {
            'today_order_count': order_list.count(),
            'building_stat': building_stat
        }
    }
    return HttpResponse(json.dumps(response), content_type='application/json')