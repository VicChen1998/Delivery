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

from project.auth import *
from project.upload import *
from project.getdata import *
from project.views import *

urlpatterns = [
    # 管理
    url(r'^admin', admin.site.urls),

    # 登录
    url(r'^signin', signin),

    # 上传数据
    url(r'^upload_userinfo', upload_userinfo),
    url(r'^upload_delivery_info$', upload_delivery_info),

    # 获取数据
    url(r'^resource', resource),
    url(r'^get_university', get_university),
    url(r'^get_campus', get_campus),
    url(r'^get_community', get_community),
    url(r'^get_building', get_building),

    # 测试接口
    url(r'^test$', test),
    url(r'^test0$', test0)
]
