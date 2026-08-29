# todos/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

def Get_Current_Time():
    return timezone.localtime().time()


class Tag(models.Model):
    # 사용자 태그

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tags',
        verbose_name='사용자'
    )

    name = models.CharField(
        max_length=50,
        verbose_name='태그 이름'
    )

    color = models.CharField(
        max_length=20,
        default='gray',
        verbose_name='태그 색상'
    )

    is_default = models.BooleanField(
        default=False,
        verbose_name='기본 태그 여부'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user',
                    'name'
                ],
                name='unique_user_tag_name'
            ),

            models.UniqueConstraint(
                fields=[
                    'user'
                ],
                condition=models.Q(
                    is_default=True
                ),
                name='unique_default_tag_per_user'
            )
        ]

        ordering = [
            'created_at'
        ]

        indexes = [
            models.Index(
                fields=[
                    'user',
                    'created_at'
                ]
            )
        ]

    def __str__(self):
        return self.name


class Todo(models.Model):
    # Todo

    PRIORITY_CHOICES = [
        ('H', '높음'),
        ('M', '보통'),
        ('L', '낮음'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='todos',
        verbose_name='사용자'
    )

    title = models.CharField(
        max_length=200,
        verbose_name='할 일 제목'
    )

    is_completed = models.BooleanField(
        default=False,
        verbose_name='완료 여부'
    )

    due_date = models.DateField(
        db_index=True,
        verbose_name='시작일'
    )

    end_date = models.DateField(
        null=True,
        blank=True,
        verbose_name='종료일'
    )

    todo_time = models.TimeField( # nullable로 하지 않음 -> 사용자가 시간 직접 입력 안 해도 현재 시간으로 대체하여 DB에 저장
        default=Get_Current_Time,
        verbose_name='할 일 시간'
    )

    is_time_manual = models.BooleanField(
        default=False,
        verbose_name='시간 직접 입력 여부'
    )

    priority = models.CharField(
        max_length=1,
        choices=PRIORITY_CHOICES,
        default='M',
        verbose_name='우선순위'
    )

    tag = models.ForeignKey(
        Tag,
        on_delete=models.PROTECT,
        related_name='todos',
        verbose_name='태그'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'created_at'
        ]

        indexes = [
            models.Index(
                fields=[
                    'user',
                    'due_date'
                ]
            ),

            models.Index(
                fields=[
                    'user',
                    'end_date'
                ]
            ),

            models.Index(
                fields=[
                    'user',
                    'priority'
                ]
            )
        ]

    def __str__(self):
        return self.title


class TodoSomeday(models.Model):
    # 언젠가 할 일

    PRIORITY_CHOICES = [
        ('H', '높음'),
        ('M', '보통'),
        ('L', '낮음'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='someday_todos',
        verbose_name='사용자'
    )

    title = models.CharField(
        max_length=200,
        verbose_name='할 일 제목'
    )

    is_completed = models.BooleanField(
        default=False,
        verbose_name='완료 여부'
    )

    priority = models.CharField(
        max_length=1,
        choices=PRIORITY_CHOICES,
        default='M',
        verbose_name='우선순위'
    )

    tag = models.ForeignKey(
        Tag,
        on_delete=models.PROTECT,
        related_name='someday_todos',
        verbose_name='태그'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            'is_completed',
            'created_at'
        ]

        indexes = [
            models.Index(
                fields=[
                    'user',
                    'created_at'
                ]
            )
        ]

    def __str__(self):
        return self.title


class TodoCompletion(models.Model):
    # 기간 Todo 완료 기록

    todo = models.ForeignKey(
        Todo,
        on_delete=models.CASCADE,
        related_name='completions',
        verbose_name='Todo'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='todo_completions',
        verbose_name='사용자'
    )

    completed_date = models.DateField(
        db_index=True,
        verbose_name='완료 날짜'
    )

    completed_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='완료 시간'
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'todo',
                    'completed_date'
                ],
                name='unique_todo_completion_date'
            )
        ]

        ordering = [
            'completed_date'
        ]

        indexes = [
            models.Index(
                fields=[
                    'user',
                    'completed_date'
                ]
            ),

            models.Index(
                fields=[
                    'todo',
                    'completed_date'
                ]
            )
        ]

    def __str__(self):
        return (
            f'{self.todo.title} - '
            f'{self.completed_date}'
        )
