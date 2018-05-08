import json
from decimal import Decimal

from django.http import HttpResponse

from project.models import User, UserProfile, Invitation, Order, Voucher
from project import voucher


def search_user(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    manager = User.objects.get(username=request.GET['openid'])
    if not manager.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not manager.has_perm('project.view_manage_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    manager_profile = UserProfile.objects.get(user=manager)

    keyword = request.GET['keyword']

    if keyword.isdigit():
        results = UserProfile.objects.filter(campus=manager_profile.campus, phone__contains=keyword)
    else:
        results = UserProfile.objects.filter(campus=manager_profile.campus, name__contains=keyword)

    response = {'status': 'success',
                'count': results.count(),
                'results': []
                }
    for profile in results:
        orders = Order.objects.filter(user=profile.user)
        invitations = Invitation.objects.filter(inviter=profile.user)

        response['results'].append({
            'openid': profile.user.username,
            'name': profile.name,
            'phone': profile.phone,
            'gender': profile.gender,
            'join_date': profile.user.date_joined.strftime('%Y-%m-%d'),
            'building_name': profile.building.halfname(),
            'voucher': Voucher.objects.filter(user_id=profile.user_id, valid=True).count(),
            'order_count': orders.count(),
            'finished_order_count': orders.filter(status=13).count(),
            'free_order_count': orders.filter(status=13).exclude(voucher=None).count(),
            'invite_count': invitations.count(),
            'valid_invite_count': invitations.filter(valid=True).count()
        })

    return HttpResponse(json.dumps(response), content_type='application/json')


def give_voucher(request):
    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    manager = User.objects.get(username=request.POST['openid'])
    if not manager.is_staff:
        response = {'status': 'fail', 'errMsg': 'you are not staff'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if not manager.has_perm('project.view_manage_page'):
        response = {'status': 'fail', 'errMsg': 'permission denied'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'user_openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect user openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.POST['user_openid'])

    value = Decimal(request.POST['value'])
    period = int(request.POST['period'])
    
    voucher.give(user, value=value, period=period)

    response = {'status': 'success', 'current_voucher': Voucher.objects.filter(user=user, valid=True).count()}
    return HttpResponse(json.dumps(response), content_type='application/json')
