import json

from django.http import HttpResponse

from delivery.settings import BASE_DIR
from project.models import University, Campus, Community, Building, PkgPosition


# 开放端口 获取公共数据

def resource(request):
    name = request.GET['name']
    file = open(BASE_DIR + '/static/resource/' + name, 'rb')
    response = HttpResponse(file.read(), content_type='image/png')
    return response


def media(request):
    name = request.GET['name']
    file = open(BASE_DIR + '/media/' + name, 'rb')
    response = HttpResponse(file.read(), content_type='image/jpeg')
    return response


def get_pay_qrcode(request):
    campus_id = request.GET['campus_id']
    method = request.GET['method']

    qrcode = open(BASE_DIR + '/static/pay_qrcodes/' + campus_id + '_' + method + '.jpg', 'rb')
    return HttpResponse(qrcode.read(), content_type='image/png')


def get_status(request):
    if 'key' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect status key'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    key = request.GET['key']

    if key == 'isShareQrcodeInTest':
        response = {'status': 'success', 'value': True}
        return HttpResponse(json.dumps(response), content_type='application/json')

    else:
        response = {'status': 'fail', 'errMsg': 'no such key'}
        return HttpResponse(json.dumps(response), content_type='application/json')


def get_notice(request):
    if 'page' not in request.GET:
        response = {'status': 'fail', 'errMsg': 'expect status key'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    page = request.GET['page']

    if page == '/pages/order/order':
        response = {
            'has_notice': False,
            'type': 'topbar',
            'title': '服务器维护中',
            'content': '免单券功能停用两天'
        }
        return HttpResponse(json.dumps(response), content_type='application/json')

    else:
        response = {'has_notice': False}
        return HttpResponse(json.dumps(response), content_type='application/json')


def get_university(request):
    university_list = University.objects.all()

    response = {'university_list': []}
    for university in university_list:
        item = {'id': university.id, 'name': university.name}
        response['university_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_campus(request):
    campus_list = Campus.objects.filter(university_id=request.GET['university_id'])

    response = {'campus_list': []}
    for campus in campus_list:
        item = {'id': campus.id, 'name': campus.name}
        response['campus_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_community(request):
    community_list = Community.objects.filter(campus_id=request.GET['campus_id'])

    response = {'community_list': []}
    for community in community_list:
        item = {'id': community.id, 'name': community.name}
        response['community_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_building(request):
    building_list = Building.objects.filter(community_id=request.GET['community_id'])

    response = {'building_list': []}
    for building in building_list:
        item = {'id': building.id, 'name': building.name}
        response['building_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_pkg_position(request):
    pkg_position_list = PkgPosition.objects.filter(campus_id=request.GET['campus_id'])

    response = {'pkg_position_list': []}
    for pkg_position in pkg_position_list:
        item = {'id': pkg_position.id, 'name': pkg_position.name, 'pickup_time': pkg_position.pickup_time.split(',')}
        response['pkg_position_list'].append(item)
    return HttpResponse(json.dumps(response), content_type='application/json')
