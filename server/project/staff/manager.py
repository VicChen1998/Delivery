import json

from django.http import HttpResponse

from project.models import User, UserProfile


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

    user = User.objects.filter(username=request.POST['user_openid'])
    profile = UserProfile.objects.get(user=user)

    profile.voucher += 1
    profile.save()

    response = {'status': 'success', 'current_voucher': profile.voucher}
    return HttpResponse(json.dumps(response), content_type='application/json')
