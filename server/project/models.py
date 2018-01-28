from django.db import models
from django.contrib.auth.models import User


# Create your models here.

# 大学表
class University(models.Model):
    name = models.CharField(max_length=64, unique=True)
    province = models.CharField(max_length=16)

    class Meta:
        db_table = 'University'


class Campus(models.Model):
    name =models.CharField(max_length=32)
    university = models.ForeignKey(University)

    class Meta:
        db_table = 'Campus'

    def fullname(self):
        return self.university.name + ' ' + self.name


class Community(models.Model):
    name = models.CharField(max_length=16)
    campus = models.ForeignKey(Campus)
    university = models.ForeignKey(University)

    class Meta:
        db_table = 'Community'

    def fullname(self):
        return self.campus.fullname() + ' ' + self.name


class Building(models.Model):
    name = models.CharField(max_length=16)
    community = models.ForeignKey(Community)
    campus = models.ForeignKey(Campus)
    university = models.ForeignKey(University)

    class Meta:
        db_table = 'Building'

    def fullname(self):
        return self.community.fullname() + ' ' + self.name


# 用户信息表
class UserProfile(models.Model):
    # 从微信拿到的数据
    # 用户
    user = models.OneToOneField(User, primary_key=True)
    username = models.CharField(max_length=32)
    # 昵称
    nickname = models.CharField(max_length=32, null=True)
    # 性别
    gender = models.IntegerField(3, null=True, blank=True)
    # 语言
    language = models.CharField(max_length=16, null=True)
    # 城市
    city = models.CharField(max_length=32, null=True)
    # 省份
    province = models.CharField(max_length=32, null=True)
    # 国家
    country = models.CharField(max_length=32, null=True)
    # 头像url
    avatarUrl = models.CharField(max_length=256, null=True)

    # 本应用数据
    # 名字
    name = models.CharField(max_length=32, null=True, default='')
    # 手机号
    phone = models.CharField(max_length=11, null=True, default='')
    # 大学
    university = models.ForeignKey(University, null=True, default=None)
    # 校区
    campus = models.ForeignKey(Campus, null=True, default=None)
    # 宿舍区
    community = models.ForeignKey(Community, null=True, default=None)
    # 楼号
    building = models.ForeignKey(Building, null=True, default=None)

    class Meta:
        db_table = 'UserProfile'


# 订单
class Order(models.Model):
    # 订单id 时间和用户id组成
    id = models.CharField(max_length=64, primary_key=True, unique=True)
    # 日期
    date = models.DateField()
    # 状态 (下单/取货/送达/完成)
    status = models.IntegerField(4)
    # 用户
    user = models.ForeignKey(User)
    # 快递信息
    # 快递位置
    pkg_position = models.CharField(max_length=64)
    # 快递短信
    pkg_info = models.CharField(max_length=256)
    # 送货地址
    # 楼号 包括 大学/校区/宿舍区
    building = models.CharField(max_length=8)
    # 价格
    price = models.DecimalField(max_digits=4, decimal_places=2)
    # 备注
    comment = models.CharField(max_length=128)

    class Meta:
        db_table = 'Order'
