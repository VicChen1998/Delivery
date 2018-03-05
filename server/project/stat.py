import json
import time

from django.http import HttpResponse

from project.models import *

def stat(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])
    if not user.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')
    if not user.is_superuser:
        response = {'status': 'fail', 'errMsg': 'you are not superuser'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    date = time.strftime('%Y-%m-%d', time.localtime(time.time()))

    response = {
        'status': 'success',
        'stat_data': {
            'today_order_count': Order.objects.filter(date=date).count(),
        }
    }
    return HttpResponse(json.dumps(response), content_type='application/json')