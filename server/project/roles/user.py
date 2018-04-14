import json

from django.http import HttpResponse

from project.models import User, UserProfile, Order


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