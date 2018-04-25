import json
import time
from django.utils import timezone

from django.http import HttpResponse

from project.models import User, UserProfile, Building, Feedback, FeedbackImage


def submit(request):
    user = None
    if 'openid' in request.POST and request.POST['openid']:
        try:
            user = User.objects.get(username=request.POST['openid'])
        except User.DoesNotExist:
            pass
        except User.MultipleObjectsReturned:
            pass

    if 'entrance' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect entrance'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'content' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect content'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    feedback = Feedback.objects.create(
        time=time.time(),
        user=user,
        entrance=request.POST['entrance'],
        content=request.POST['content']
    )

    if request.POST['entrance'] == 'order_detail':
        feedback.order_id = request.POST['order_id']
        feedback.save()

    response = {'status': 'success', 'feedback_id': feedback.id}
    return HttpResponse(json.dumps(response), content_type='application/json')


def upload_img(request):
    if 'feedback_id' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect feedback id'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    if 'imgIndex' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect image index'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    FeedbackImage.objects.create(feedback_id=request.POST['feedback_id'],
                                 index=request.POST['imgIndex'],
                                 image=request.FILES.get('img'))

    response = {'status': 'success'}
    return HttpResponse(json.dumps(response), content_type='application/json')


def get_feedback_count(request):
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

    feedback_list = Feedback.objects.filter(status__lt=2)

    response = {'status': 'success',
                'untreated': feedback_list.filter(status=0).count(),
                'treating': feedback_list.filter(status=1).count(),
                }

    return HttpResponse(json.dumps(response), content_type='application/json')


def get_feedback(request):
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

    feedback_list = Feedback.objects.filter(status__lt=2).order_by('-time')

    response = {'status': 'success',
                'feedback_list': []}

    for feedback in feedback_list:
        user = None
        if feedback.user:
            profile = UserProfile.objects.get(user=feedback.user)
            user = {'name': profile.name,
                    'phone': profile.phone,
                    'building': Building.objects.get(id=profile.building.id).halfname()}

        order = None
        if feedback.order:
            order = feedback.order.dict()

        imgs = []
        img_list = FeedbackImage.objects.filter(feedback=feedback).order_by('index')
        for img in img_list:
            imgs.append(img.image.name)

        response['feedback_list'].append({
            'time': timezone.localtime(feedback.time).strftime('%m-%d %H:%M'),
            'entrance': feedback.entrance,
            'user': user,
            'order': order,
            'content': feedback.content,
            'images': imgs,
            'status': feedback.status,
        })

    return HttpResponse(json.dumps(response), content_type='application/json')
