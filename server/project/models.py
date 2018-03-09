from django.db import models
from django.contrib.auth.models import User


# Create your models here.

# 大学表
class University(models.Model):
    id = models.CharField(max_length=4, primary_key=True)
    name = models.CharField(max_length=64, unique=True)
    province = models.CharField(max_length=16)

    class Meta:
        db_table = 'University'


# 校区表
class Campus(models.Model):
    id = models.CharField(max_length=6, primary_key=True)
    name = models.CharField(max_length=32)
    university = models.ForeignKey(University)

    class Meta:
        db_table = 'Campus'

    def fullname(self):
        return self.university.name + ' ' + self.name


# 宿舍区表
class Community(models.Model):
    id = models.CharField(max_length=8, primary_key=True)
    name = models.CharField(max_length=16)
    campus = models.ForeignKey(Campus)
    university = models.ForeignKey(University)

    class Meta:
        db_table = 'Community'

    def fullname(self):
        return self.campus.fullname() + ' ' + self.name


# 宿舍楼表
class Building(models.Model):
    id = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=16)
    community = models.ForeignKey(Community)
    campus = models.ForeignKey(Campus)
    university = models.ForeignKey(University)

    class Meta:
        db_table = 'Building'

    def fullname(self):
        return self.community.fullname() + ' ' + self.name


# 快递点表
class PkgPosition(models.Model):
    id = models.CharField(max_length=8, primary_key=True)
    name = models.CharField(max_length=32)
    campus = models.ForeignKey(Campus)
    university = models.ForeignKey(University)
    pickup_time = models.CharField(max_length=32, default='20:00')

    class Meta:
        db_table = 'PkgPosition'


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
    university = models.ForeignKey(University, default='0000')
    # 校区
    campus = models.ForeignKey(Campus, default='000000')
    # 宿舍区
    community = models.ForeignKey(Community, default='00000000')
    # 楼号
    building = models.ForeignKey(Building, default='0000000000')
    # 信用
    credit = models.IntegerField(200, default=100)

    class Meta:
        db_table = 'UserProfile'

    


# 订单
class Order(models.Model):
    # 订单id 时间和用户id组成
    id = models.CharField(max_length=64, primary_key=True, unique=True)
    # 日期
    date = models.DateField()
    # 状态码
    # 0-6   取件
    # 7-12  配送
    # 13-16 订单
    status = models.IntegerField(16, default=0)
    # 用户
    user = models.ForeignKey(User)
    # 快递信息
    # 姓名
    name = models.CharField(max_length=32)
    # 手机
    phone = models.CharField(max_length=11)
    # 快递位置
    pkg_position = models.ForeignKey(PkgPosition)
    # 领取时限
    pickup_time = models.CharField(max_length=8)
    # 快递短信
    pkg_info = models.CharField(max_length=256)
    # 送货地址
    university = models.ForeignKey(University)
    campus = models.ForeignKey(Campus)
    community = models.ForeignKey(Community)
    building = models.ForeignKey(Building)
    # 价格
    price = models.DecimalField(max_digits=4, decimal_places=2)
    # 是否支付 (0 未支付/ 1 待确认 / 2 已支付)
    has_pay = models.IntegerField(2, default=0)
    # 备注
    comment = models.CharField(max_length=256, null=True)
    # 错误信息
    errMsg = models.CharField(max_length=64, null=True)

    class Meta:
        db_table = 'Order'

    def dict(self):
        # 0-6   取件
        status_describe = ''
        if self.status == 0:
            status_describe = '等待取件'
        elif self.status == 1:
            status_describe = '已取件，等待配送'
        elif self.status == 2:
            status_describe = '未取到'
        elif self.status == 3:
            status_describe = '次日取件'
        # 7-12  配送
        elif self.status == 7:
            status_describe = '已送达，请下楼取件'
        elif self.status == 8:
            status_describe = '次日再送'
        elif self.status == 9:
            status_describe = '联系不上，次日再送'
        
        # 13-16 订单
        elif self.status == 13:
            status_describe = '已完成' 
        elif self.status == 14:
            status_describe = '已取消'
        elif self.status == 15:
            status_describe = '已关闭'

        # -1 错误
        elif self.status == -1:
            status_describe = self.errMsg

        order_dict = {'id': self.id,
                      'date': str(self.date),
                      'status': self.status,
                      'status_describe': status_describe,
                      'user': self.user.username,
                      'name': self.name,
                      'phone': self.phone,
                      'pkg_position': {'id': self.pkg_position.id, 'name': self.pkg_position.name},
                      'pickup_time': self.pickup_time,
                      'pkg_info': self.pkg_info,
                      'university': {'id': self.building.university.id, 'name': self.building.university.name},
                      'campus': {'id': self.building.campus.id, 'name': self.building.campus.name},
                      'community': {'id': self.building.community.id, 'name': self.building.community.name},
                      'building': {'id': self.building.id, 'name': self.building.name},
                      'price': '%.2f' % self.price,
                      'has_pay': self.has_pay,
                      'comment': self.comment}
        return order_dict
