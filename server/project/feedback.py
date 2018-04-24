import json
import time

from django.http import HttpResponse

from project.models import User, Feedback, FeedbackImage


def submit(request):
    user = None
    if 'openid' in request.POST:
        try:
            user = User.objects.get(username=request.POST['openid'])
        except User.DoesNotExist:
            pass
        except User.MultipleObjectsReturned:
            pass

    if 'content' not in request.POST:
        response = {'status': 'fail', 'errMsg': 'expect content'}
        return HttpResponse(json.dumps(response), content_type='application/json')

    feedback = Feedback.objects.create(
        time=time.time(),
        user=user,
        content=request.POST['content']
    )

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
