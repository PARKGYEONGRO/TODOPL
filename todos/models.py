from django.db import models
from django.contrib.auth.models import User

class Todo(models.Model):
    PRIORITY_CHOICES = [
        ('H', '높음'),
        ('M', '보통'),
        ('L', '낮음')
    ]

    TAG_CHOICES = [
        ('WORK', '업무'),
        ('PERSONAL', '개인'),
        ('HEALTH', '건강'),
        ('STUDY', '공부'),
        ('ETC', '기타'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    title = models.CharField(max_length=200, verbose_name='할 일 제목')
    is_completed = models.BooleanField(default=False, verbose_name='완료 여부')
    due_date = models.DateField(db_index=True, verbose_name='마감일') #명세서상 db_index
    priority = models.CharField(max_length=1, choices=PRIORITY_CHOICES, default='M', verbose_name='우선순위')
    tag = models.CharField(max_length=20, choices=TAG_CHOICES, default='WORK', verbose_name='태그')
    created_at = models.DateTimeField(auto_now_add=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def __str__(self):
        return self.title