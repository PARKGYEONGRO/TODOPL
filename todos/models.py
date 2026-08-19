from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    # 사용자 프로필

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='사용자'
    )

    nickname = models.CharField(
        max_length=30,
        verbose_name='닉네임'
    )

    nickname_tag = models.CharField(
        max_length=5,
        unique=True,
        editable=False,
        verbose_name='닉네임 태그'
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
                    'nickname'
                ]
            ),

            models.Index(
                fields=[
                    'nickname_tag'
                ]
            )
        ]

    def __str__(self):
        return (
            f'{self.nickname}#'
            f'{self.nickname_tag}'
        )


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


class FriendRequest(models.Model):
    # 친구 요청

    STATUS_CHOICES = [
        ('PENDING', '대기'),
        ('ACCEPTED', '수락'),
        ('REJECTED', '거절'),
        ('CANCELED', '취소'),
    ]

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_friend_requests',
        verbose_name='요청자'
    )

    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_friend_requests',
        verbose_name='수신자'
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='PENDING',
        verbose_name='상태'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    responded_at = models.DateTimeField(
        null=True,
        blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'sender',
                    'receiver'
                ],
                condition=models.Q(
                    status='PENDING'
                ),
                name='unique_pending_friend_request'
            ),

            models.CheckConstraint(
                condition=~models.Q(
                    sender=models.F('receiver')
                ),
                name='prevent_self_friend_request'
            )
        ]

        ordering = [
            '-created_at'
        ]

        indexes = [
            models.Index(
                fields=[
                    'receiver',
                    'status'
                ]
            ),

            models.Index(
                fields=[
                    'sender',
                    'status'
                ]
            )
        ]

    def __str__(self):
        return (
            f'{self.sender} -> '
            f'{self.receiver}'
        )


class Friendship(models.Model):
    # 실제 친구 관계

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friendships',
        verbose_name='사용자'
    )

    friend = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='friend_of',
        verbose_name='친구'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'user',
                    'friend'
                ],
                name='unique_friendship'
            ),

            models.CheckConstraint(
                condition=~models.Q(
                    user=models.F('friend')
                ),
                name='prevent_self_friendship'
            )
        ]

        indexes = [
            models.Index(
                fields=[
                    'user',
                    'created_at'
                ]
            ),

            models.Index(
                fields=[
                    'friend',
                    'created_at'
                ]
            )
        ]

    def __str__(self):
        return (
            f'{self.user} <-> '
            f'{self.friend}'
        )