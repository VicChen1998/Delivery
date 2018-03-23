"""delivery URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin

from project import auth, order, upload, getdata, stat, views

urlpatterns = [
    # 管理
    url(r'^admin', admin.site.urls),

    # 登录
    url(r'^signin', auth.signin),

    # 订单
    url(r'^order', order.order),
    url(r'^modify', order.modify),
    url(r'^cancel', order.cancel),
    url(r'^deliverer_cancel', order.deliverer_cancel),
    url(r'^receive', order.receive),
    url(r'^pay', order.pay),
    url(r'^raise_price', order.raise_price),
    url(r'^confirm_pay', order.confirm_pay),

    # 配送
    url(r'^pickup', order.pickup),
    url(r'^delivery', order.delivery),
    url(r'^not_delivery', order.not_delivery),

    # 上传数据
    url(r'^upload_userinfo', upload.upload_userinfo),
    url(r'^upload_address$', upload.upload_address),

    # 获取公共数据
    url(r'^resource', getdata.resource),
    url(r'^get_university', getdata.get_university),
    url(r'^get_campus', getdata.get_campus),
    url(r'^get_community', getdata.get_community),
    url(r'^get_building', getdata.get_building),
    url(r'^get_pkgPosition', getdata.get_pkg_position),

    # 获取个人数据
    url(r'^get_order', getdata.get_order),

    # 配送员获取数据
    url(r'^deliverer_get_pkg_position', getdata.deliverer_get_pkg_position),
    url(r'^deliverer_get_community', getdata.deliverer_get_community),
    url(r'^deliverer_get_building', getdata.deliverer_get_building),
    url(r'^get_pickup_list', getdata.get_pickup_list),
    url(r'^get_delivery_list', getdata.get_delivery_list),

    # 管理员获取统计数据
    url(r'^stat/mobile', stat.mobile),
    url(r'^stat/growth$', stat.growth),
    url(r'^stat/get_growth_data$', stat.get_growth_data),
    url(r'^stat/day', stat.day),
    url(r'^stat', stat.day),

    # 消息接口
    url(r'^message', auth.message),

    # 测试接口
    url(r'^test$', views.test),
    url(r'^test0$', views.test0)
]
