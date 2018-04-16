import os
import json
import requests

from django.http import HttpResponse

from project.models import User, UserProfile, AccessToken, Invitation
from delivery.settings import BASE_DIR


def get_share_qrcode(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.get(username=request.GET['openid'])

    path = BASE_DIR + '/static/share_qrcodes/' + user.username + '.jpg'

    if not os.path.exists(path):
        generate_qrcode(user.username)

    image = open(path, 'rb').read()
    return HttpResponse(image, content_type='image/jpeg')


def generate_qrcode(openid):
    token = AccessToken.objects.get(id=1).access_token

    url = 'https://api.weixin.qq.com/wxa/getwxacode?access_token=' + token

    data = {'path': 'pages/order/order?inviter=' + openid}

    response = requests.post(url=url, data=json.dumps(data))

    file = open(BASE_DIR + '/static/share_qrcodes/' + openid + '.jpg', 'wb')
    file.write(response.content)
    file.close()


def upload_invite_info(request):
    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'inviter_openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect inviter openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    inviter = User.objects.get(username=request.POST['inviter_openid'])
    invitee = User.objects.get(username=request.POST['openid'])

    if Invitation.objects.filter(invitee=invitee).exists():
        response = {'status': 'fail', 'errMsg': 'already exist'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    Invitation.objects.create(inviter=inviter, invitee=invitee)

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_share_voucher(request):
    if 'openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'inviter_openid' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect inviter openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    inviter = User.objects.get(username=request.POST['inviter_openid'])
    invitee = User.objects.get(username=request.POST['openid'])

    record = Invitation.objects.get(invitee=invitee, inviter=inviter)

    if record.valid:
        response = {'status': 'fail', 'errMsg': 'already give once'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    inviter_profile = UserProfile.objects.get(user=inviter)
    invitee_profile = UserProfile.objects.get(user=invitee)

    if invitee_profile.building.id == '0000000000':
        response = {'status': 'fail', 'errMsg': 'invalid userAddress'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if Invitation.objects.filter(inviter=inviter).count() < 5:
        inviter_profile.voucher += 1

    invitee_profile.voucher += 1

    inviter_profile.save()
    invitee_profile.save()

    record.valid = True
    record.save()

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_invite_history(request):
    if 'openid' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect openid'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    user = User.objects.filter(username=request.GET['openid'])

    history = Invitation.objects.filter(inviter=user)

    response = {'status': 'success',
                'count': history.count(),
                'history': []}

    for record in history:
        invitee = UserProfile.objects.get(user=record.invitee)
        response['history'].append({'nickname': invitee.nickname,
                                    'avatarUrl': invitee.avatarUrl,
                                    'valid': record.valid})

    return HttpResponse(json.dumps(response), content_type='application/json')
