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
from django.contrib import admin
from django.urls import path
from todos import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.todo_list, name='todo_list'),
    path('creat/', views.todo_create, name='todo_create'),
    path('toggle/<int:todo_id>/', views.todo_toggle, name='todo_toggle'), #토글 추가
    path('delete/<int:todo_id>/', views.todo_delete, name='todo_delete'), #삭제 추가
    path('edit/<int:todo_id>/', views.todo_edit, name='todo_edit'), #수정 추가
]
