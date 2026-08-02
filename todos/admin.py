from django.contrib import admin
from .models import Todo, TodoCompletion


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):

    # 어드민 목록 화면 컬럼
    list_display = (
        'title',
        'due_date',
        'end_date',
        'priority',
        'tag',
        'completion_status',
        'created_at',
    )


    # 필터 옵션
    list_filter = (
        'is_completed',
        'priority',
        'tag',
        'due_date',
    )


    # 검색 기능
    search_fields = (
        'title',
    )


    # =========================
    # 완료 여부
    # =========================

    @admin.display(
        boolean=True,
        description='완료 여부'
    )
    def completion_status(self, obj):

        # =========================
        # 하루 Todo
        # =========================

        if obj.end_date is None:

            return obj.is_completed


        # =========================
        # 기간 Todo
        # =========================

        total_days = (

            obj.end_date
            -
            obj.due_date

        ).days + 1


        completed_days = TodoCompletion.objects.filter(

            todo=obj,

            completed_date__gte=obj.due_date,

            completed_date__lte=obj.end_date

        ).count()


        # 모든 기간을 완료해야
        # 최종 완료로 판단
        return completed_days == total_days