import time
from datetime import date, datetime, timezone, timedelta
from django.utils.timezone import now

from project.models import Order, StatDay, AccessToken, User
from project.auth import get_access_token


def pickup_next_day():
    date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
    print('\n\n# # # # # ' + date + 'pickup_next_day # # # # #\n')

    order_list = Order.objects.filter(status=3)

    for order in order_list:
        print(order.dict())
        print('\n')
        order.status = 0
        order.save()


def deliver_next_day():
    date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
    print('\n\n# # # # # ' + date + 'deliver_next_day # # # # #\n')

    order_list = Order.objects.filter(status__in=[8, 9])

    for order in order_list:
        print(order.dict())
        print('\n')
        order.status = 1
        order.save()


def set_finish():
    date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time()))
    print('\n\n# # # # # ' + date + 'set_finish # # # # #\n')

    order_list = Order.objects.filter(status=7)

    for order in order_list:
        print(order.dict())
        print('\n')
        order.status = 13
        order.save()


def stat_day():
    today = date.today()

    order_list = Order.objects.filter(date=today, status__in=[0, 1, 2, 3, 7, 8, 9, 13])

    order_amount = 0
    for order in order_list:
        order_amount += order.price

    new_user = User.objects.filter(date_joined__gte=now() + timedelta(days=-1)).count()
    totoal_user = User.objects.all().count()

    StatDay.objects.create(date=today,
                           order_count=order_list.count(),
                           order_amount=order_amount,
                           new_user=new_user,
                           total_user=totoal_user)


def check_access_token():
    token = AccessToken.objects.get(id=1)

    now = datetime.utcnow().replace(tzinfo=timezone(timedelta(0)))

    if (now - token.receive_time).seconds > token.expires_in - 300:
        get_access_token()
