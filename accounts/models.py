# accounts/models.py
import random as rd
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

def Get_Random_Nickname():
    Adjective_list = [
        '행복한',
        '푸른',
        '빠른',
        '조용한',
        '빛나는',
        '따뜻한',
        '신비한',
        '귀여운',
        '용감한',
        '달콤한',
    ]

    Animal_List = [
        '판다',
        '여우',
        '고래',
        '토끼',
        '고양이',
        '강아지',
        '호랑이',
        '사자',
        '펭귄',
        '수달',
    ]

    Adjective = rd.choice(Adjective_list)

    Animal = rd.choice(Animal_List)

    RandomNumber = str(rd.randint(0,9999)).zfill(4)

    return (
        f'{Adjective}'
        f'{Animal}'
        f'{RandomNumber}'
    )


class UserProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='사용자'
    )

    nickname = models.CharField(
        max_length=30,
        default=Get_Random_Nickname,
        verbose_name='닉네임'
    )

    nickname_tag = models.CharField(
        max_length=5,
        unique=True,
        editable=False,
        verbose_name='닉네임 태그'
    )

    bio = models.CharField(
        max_length=100,
        blank=True,
        default='',
        verbose_name='한 줄 소개'
    )

    profile_image_path = models.CharField(
        max_length=500,
        blank=True,
        default='',
        verbose_name='프로필 이미지 경로'
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

    def clean(self):
        super().clean()

        self.nickname = (
            self.nickname
            .strip()
        )

        if not self.nickname:
            raise ValidationError(
                {
                    'nickname': (
                        '닉네임을 입력해주세요.'
                    )
                }
            )

        if '#' in self.nickname:
            raise ValidationError(
                {
                    'nickname': (
                        '닉네임에는 #을 사용할 수 없습니다.'
                    )
                }
            )

    def save(self, *args, **kwargs):
        self.full_clean()

        if not self.nickname_tag:
            while True:
                NicknameTag = str(
                    rd.randint(
                        0,
                        99999
                    )
                ).zfill(5)

                if not UserProfile.objects.filter(
                    nickname_tag=NicknameTag
                ).exists():
                    self.nickname_tag = NicknameTag
                    break

        super().save(
            *args,
            **kwargs
        )

    def __str__(self):
        return (
            f'{self.nickname}#'
            f'{self.nickname_tag}'
        )


class SocialAccount(models.Model):
    # 소셜 로그인 계정 연동 정보

    PROVIDER_CHOICES = [
        ('google', 'Google'),
        ('naver', 'Naver'),
        ('apple', 'Apple'),
        ('supabase', 'Supabase'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='social_accounts',
        verbose_name='사용자'
    )

    provider = models.CharField(
        max_length=20,
        choices=PROVIDER_CHOICES,
        verbose_name='소셜 제공자'
    )

    provider_user_id = models.CharField(
        max_length=255,
        verbose_name='소셜 사용자 ID'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'provider',
                    'provider_user_id'
                ],
                name='unique_social_account'
            ),

            models.UniqueConstraint(
                fields=[
                    'user',
                    'provider'
                ],
                name='unique_user_social_provider'
            )
        ]

        ordering = [
            'created_at'
        ]

    def __str__(self):
        return (
            f'{self.provider}'
            f'{self.provider_user_id}'
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
