from datetime import timedelta
from django.utils.timezone import now
from hashlib import md5

from project.models import Voucher


def give(user, value=1, title=None, source=0, period=90):
    current_time = now()

    src = str(current_time) + '$u=' + user.username
    generator = md5(src.encode('utf8'))
    voucher_id = generator.hexdigest()

    if not title:
        title = str(value) + '元优惠券'

    Voucher.objects.create(id=voucher_id,
                           user=user,
                           title=title,
                           source=source,
                           value=value,
                           invalid_time=current_time + timedelta(days=period))
