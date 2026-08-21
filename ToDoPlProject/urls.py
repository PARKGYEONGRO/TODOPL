"""
URL configuration for ToDoPlProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from django.contrib import admin
from django.contrib.auth import views as auth_views
from todos import views

urlpatterns = [

    #관리자
    path(
        'admin/',
        admin.site.urls
    ),


    #로그인
    path(
        'login/',
        views.login_view,
        name='login'
    ),

    path(
        'login/auth/',
        views.supabase_login,
        name='supabase_login'
    ),


    #로그아웃
    path(
        'logout/',
        auth_views.LogoutView.as_view(),
        name='logout'
    ),


    # 회원탈퇴
    path(
        'account/delete/',
        views.account_delete,
        name='account_delete'
    ),


    # 태그 관리
    path(
        'tag/create/',
        views.tag_create,
        name='tag_create'
    ),

    path(
        'tag/update/<int:tag_id>/',
        views.tag_update,
        name='tag_update'
    ),

    path(
        'tag/delete/<int:tag_id>/',
        views.tag_delete,
        name='tag_delete'
    ),

    #Todo 목록
    path(
        '',
        views.todo_list,
        name='todo_list'
    ),

    path(
        'todo_list/',
        views.todo_list,
        name='todo_list'
    ),


    #Todo 생성
    path(
        'create/',
        views.todo_create,
        name='todo_create'
    ),


    #Todo 완료 / 미완료
    path(
        'toggle/<int:todo_id>/',
        views.todo_toggle,
        name='todo_toggle'
    ),


    #Todo 삭제
    path(
        'delete/<int:todo_id>/',
        views.todo_delete,
        name='todo_delete'
    ),


    #Todo 수정
    path(
        'edit/<int:todo_id>/',
        views.todo_edit,
        name='todo_edit'
    ),


    #모바일 Home
    path(
        'home/',
        views.home,
        name='home'
    ),


    #통계
    path(
        'mobile_stats/',
        views.mobile_stats,
        name='mobile_stats'
    ),


    #언젠가 할 일
    #============================================================
    #언젠가 할 일 목록
    path(
        'someday/',
        views.todo_someday_list,
        name='todo_someday_list'
    ),


    #언젠가 할 일 생성
    path(
        'someday/create/',
        views.todo_someday_create,
        name='todo_someday_create'
    ),


    #언젠가 할 일 완료 / 미완료
    path(
        'someday/toggle/<int:someday_id>/',
        views.todo_someday_toggle,
        name='todo_someday_toggle'
    ),


    #언젠가 할 일 삭제
    path(
        'someday/delete/<int:someday_id>/',
        views.todo_someday_delete,
        name='todo_someday_delete'
    ),


    #언젠가 할 일 수정
    path(
        'someday/edit/<int:someday_id>/',
        views.todo_someday_edit,
        name='todo_someday_edit'
    ),

]
