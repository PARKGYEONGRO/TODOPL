# accounts/urls.py
from django.urls import path
from accounts import views as AccountViews


urlpatterns = [
    # 로그인
    path(
        'login/auth/',
        AccountViews.supabase_login,
        name='supabase_login'
    ),

    path(
        'login/google/',
        AccountViews.google_login,
        name='google_login'
    ),

    path(
        'login/google/callback/',
        AccountViews.google_login_callback,
        name='google_login_callback'
    ),

    # 비밀번호 재설정 이메일 발송
    path(
        'password-reset/send/',
        AccountViews.password_reset_send,
        name='password_reset'
    ),

    path(
        'password-reset/confirm/',
        AccountViews.password_reset_confirm,
        name='password_reset_confirm'
    ),

    # 회원 탈퇴
    path(
        'account/delete/',
        AccountViews.account_delete,
        name='account_delete'
    ),


    # 프로필 설정
    path(
        'profile/update/',
        AccountViews.profile_update,
        name='profile_update'
    ),

    path(
        'profile/image-url/',
        AccountViews.profile_image_url,
        name='profile_image_url'
    ),


    # 친구
    path(
        'friend-requests/',
        AccountViews.friend_requests,
        name='friend_requests'
    ),

    path(
        'friend-request/send/',
        AccountViews.friend_request_send,
        name='friend_request_send'
    ),

    path(
        'friend-request/accept/',
        AccountViews.friend_request_accept,
        name='friend_request_accept'
    ),

    path(
        'friend-request/reject/',
        AccountViews.friend_request_reject,
        name='friend_request_reject'
    ),

    path(
        'friend-list/',
        AccountViews.friend_list,
        name='friend_list'
    ),

    path(
        'friend-remove/',
        AccountViews.friend_remove,
        name='friend_remove'
    ),

]

