import json
import time

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

    order_id = timestamp + '$u=' + user.username

    university = University.objects.get(name=request.POST['university'])
    campus = Campus.objects.get(name=request.POST['campus'], university=university)
    community = Community.objects.get(name=request.POST['community'],
                                      university=university,
                                      campus=campus)
    building = Building.objects.get(name=request.POST['building'],
                                    university=university,
                                    campus=campus,
                                    community=community)

    pkg_position = PkgPosition.objects.get(name=request.POST['pkg_position'],
                                           university=university,
                                           campus=campus)

    # TODO: 价格和备注
    Order.objects.create(
        id=order_id,
        date=date,
        status=0,
        user=user,
        name=request.POST['name'],
        phone=request.POST['phone'],
        building=building,
        pkg_position=pkg_position,
        pkg_info=request.POST['pkg_info'],
        price=10,
        comment=request.POST['comment'],
    )

    response = {'order_status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')

