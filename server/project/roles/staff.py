import json

from django.http import HttpResponse

from project.models import User, UserProfile, Order


def search(request):
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