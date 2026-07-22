from django.contrib import admin
from .models import Todo

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    #어드민 목록  화면 컬럼
    list_display = ('title', 'due_date', 'priority', 'tag', 'is_completed', 'created_at')
    #필터 옵션
    list_filter = ('is_completed', 'priority', 'tag', 'due_date')
    #검색 기능
    search_fields = ('title',)