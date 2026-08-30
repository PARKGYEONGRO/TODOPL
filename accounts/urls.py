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

]

