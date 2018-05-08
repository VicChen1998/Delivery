import json

from django.http import HttpResponse

from project.models import User, UserProfile, Voucher, Order, Building


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
    voucher = []
    for v in Voucher.objects.filter(user=user, valid=True).order_by('invalid_time'):
        voucher.append({
            'id': v.id,
            'title': v.title,
            'describe': v.title + ' 有效期至' + str(v.invalid_time.date())
        })

    response = {'get_voucher_status': 'success',
                'voucher': voucher}
    return HttpResponse(json.dumps(response), content_type='application/json')


# 上传用户信息

def upload_userinfo(request):
    if 'openid' not in request.POST:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = request.POST['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    profile.nickname = request.POST['nickName']
    profile.gender = request.POST['gender']
    profile.language = request.POST['language']
    profile.city = request.POST['city']
    profile.province = request.POST['province']
    profile.country = request.POST['country']
    profile.avatarUrl = request.POST['avatarUrl']
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def upload_address(request):
    if 'openid' not in request.POST:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    openid = request.POST['openid']
    user = User.objects.get(username=openid)
    profile = UserProfile.objects.get(user=user)

    building = Building.objects.get(id='0000000000')

    if request.POST['building_id']:
        building = Building.objects.get(id=request.POST['building_id'])

    profile.name = request.POST['name']
    profile.phone = request.POST['phone']
    profile.university_id = building.university.id
    profile.campus_id = building.campus.id
    profile.community_id = building.community.id
    profile.building = building
    profile.save()

    response = {'upload_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def upload_setting(request):
    if 'openid' not in request.POST:
        response = {'upload_status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'key' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect key'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'value' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect value'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['openid'])
    profile = UserProfile.objects.get(user=user)

    key = request.POST['key']
    value = request.POST['value']

    if key == 'putDownstairs':
        if value == 'true':
            profile.putDownstairs = True
        elif value == 'false':
            profile.putDownstairs = False
        profile.save()

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')

