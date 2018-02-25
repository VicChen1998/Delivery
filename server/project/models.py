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
    is_baimi = models.BooleanField(default=True)

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

    class Meta:
        db_table = 'UserProfile'

    


# 订单
class Order(models.Model):
    # 订单id 时间和用户id组成
    id = models.CharField(max_length=64, primary_key=True, unique=True)
    # 日期
    date = models.DateField()
    # 状态 (0123 下单/取件/送达/完成) (-1 未取到 / -2取消 / -3关闭)
    status = models.IntegerField(4, default=0)
    # 用户
    user = models.ForeignKey(User)
    # 快递信息
    # 姓名
    name = models.CharField(max_length=32)
    # 手机
    phone = models.CharField(max_length=11)
    # 快递位置
    pkg_position = models.ForeignKey(PkgPosition)
    # 快递短信
    pkg_info = models.CharField(max_length=256)
    # 送货地址
    university = models.ForeignKey(University)
    campus = models.ForeignKey(Campus)
    community = models.ForeignKey(Community)
    building = models.ForeignKey(Building)
    # 价格
    price = models.DecimalField(max_digits=4, decimal_places=2)
    # 备注
    comment = models.CharField(max_length=128, null=True)

    class Meta:
        db_table = 'Order'

    def dict(self):
        status_describe = ''
        if self.status == 0:
            status_describe = '等待取件'
        elif self.status == 1:
            status_describe = '已取件，等待配送'
        elif self.status == 2:
            status_describe = '已送达，请下楼取件'
        elif self.status == 3:
            status_describe = '已完成'

        elif self.status == -1:
            status_describe = '未取到'
        elif self.status == -2:
            status_describe = '已取消'
        elif self.status == -3:
            status_describe = '已关闭'

        order_dict = {'id': self.id,
                      'date': str(self.date),
                      'status': self.status,
                      'status_describe': status_describe,
                      'user': self.user.username,
                      'name': self.name,
                      'phone': self.phone,
                      'pkg_position': self.pkg_position.name,
                      'pkg_info': self.pkg_info,
                      'university': self.building.university.name,
                      'campus': self.building.campus.name,
                      'community': self.building.community.name,
                      'building': self.building.name,
                      'price': '%.2f' % self.price,
                      'comment': self.comment}
        return order_dict
