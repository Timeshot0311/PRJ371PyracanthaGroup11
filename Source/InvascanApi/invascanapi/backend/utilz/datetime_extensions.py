import datetime

import pytz


def utcnow_aware(self):
    return datetime.datetime.now(pytz.utc)

def gmt2_now(self):
    tz = pytz.timezone("Africa/Johannesburg")  # GMT+2
    return datetime.datetime.now(tz).replace(tzinfo=None)