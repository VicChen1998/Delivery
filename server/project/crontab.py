import time
import datetime

from project.models import Order, StatDay


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

    order_list = Order.objects.filter(status__in=[8,9])

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
    today = datetime.date.today()

    order_list = Order.objects.filter(date=date, status__in=[0, 1, 2, 3, 7, 8, 9, 13])

    amount = 0
    for order in order_list:
        amount += order.price

    StatDay.objects.creata(date=today, count=order_list.count(), amount=amount)
    