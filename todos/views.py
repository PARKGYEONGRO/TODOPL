# todos/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.db.models import Case, When, Value, IntegerField
from .models import Todo
import calendar
from datetime import date, datetime
import json


def todo_list(request):
    today = date.today()
    year = int(request.GET.get('year', today.year))
    month = int(request.GET.get('month', today.month))
    selected_date_str = request.GET.get('date', today.strftime('%Y-%m-%d'))
    selected_tag = request.GET.get('tag', '').strip()

    filter_kwargs = {'due_date': selected_date_str}

    if selected_tag:
        filter_kwargs['tag'] = selected_tag

    todos = Todo.objects.filter(**filter_kwargs).annotate(
        priority_order=Case(
            When(priority='H', then=Value(1)),
            When(priority='M', then=Value(2)),
            When(priority='L', then=Value(3)),
            default=Value(4),
            output_field=IntegerField(),
        )
    ).order_by('priority_order', 'created_at')

    total_todos = todos.count()
    completed_todos = todos.filter(is_completed=True).count()

    # 현재 달의 Todo를 캘린더 표시용으로 조회
    calendar_todos = Todo.objects.filter(
        # Django ORM 문법
        due_date__year=year,
        due_date__month=month
    ).order_by('due_date', 'created_at')

    # 날짜별 Todo를 그룹화
    calendar_todos_by_date = {}

    for todo in calendar_todos:
        date_key = todo.due_date.strftime('%Y-%m-%d')

        if date_key not in calendar_todos_by_date:
            calendar_todos_by_date[date_key] = []

        # 한 날짜에 최대 5개의 Todo만 캘린더에 표시
        if len(calendar_todos_by_date[date_key]) < 5:
            calendar_todos_by_date[date_key].append(todo)

    # 터미널 확인용 디버깅 출력
    # print(f"====================================")
    # print(f"선택 날짜: {selected_date_str}")
    # print(f"선택 태그: '{selected_tag}'")
    # print(f"실제 실행된 SQL 조건: {todos.query}")
    # print(f"최종 조회된 데이터 개수: {todos.count()}")
    # print(f"====================================")

    cal = calendar.Calendar(firstweekday=6)
    month_days = cal.monthdayscalendar(year, month)

    # 캘린더에서 바로 사용할 수 있는 데이터 생성
    calendar_data = []

    for week in month_days:
        week_data = []

        for day in week:
            if day == 0:
                week_data.append({
                    'day': 0,
                    'date': None,
                    'todos': [],
                })
            else:
                date_key = f'{year}-{month:02d}-{day:02d}'

                week_data.append({
                    'day': day,
                    'date': date_key,
                    'todos': calendar_todos_by_date.get(date_key, []),
                })

        calendar_data.append(week_data)

    if month == 1:
        prev_year, prev_month = year - 1, 12
    else:
        prev_year, prev_month = year, month - 1

    if month == 12:
        next_year, next_month = year + 1, 1
    else:
        next_year, next_month = year, month + 1

    selected_date_obj = datetime.strptime(selected_date_str, '%Y-%m-%d')

    context = {
        'todos': todos,
        'calendar_data': calendar_data,
        'calendar_todos_by_date': calendar_todos_by_date,

        'total_todos': total_todos,
        'completed_todos': completed_todos,
        'year': year,
        'month': f'{month:02d}',
        'month_days': month_days,
        'selected_date': selected_date_str,
        'selected_date_obj': selected_date_obj,
        'selected_tag': selected_tag,
        'today_str': today.strftime('%Y-%m-%d'),
        'prev_year': prev_year,
        'prev_month': prev_month,
        'next_year': next_year,
        'next_month': next_month,
    }

    return render(request, 'todos/todo_list.html', context)


def todo_create(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        due_date = request.POST.get('due_date')
        tag = request.POST.get('tag')
        priority = request.POST.get('priority')

        Todo.objects.create(
            title=title,
            due_date=due_date,
            tag=tag,
            priority=priority
        )

    return redirect('todo_list')


def todo_toggle(request, todo_id):
    if request.method == 'POST':
        todo = get_object_or_404(Todo, pk=todo_id)

        # 현재 화면의 태그 필터 가져오기
        try:
            data = json.loads(request.body)
            selected_tag = data.get('tag', '').strip()
        except (json.JSONDecodeError, AttributeError):
            selected_tag = ''

        # 완료 상태 변경
        todo.is_completed = not todo.is_completed
        todo.save()

        # 현재 선택된 날짜 + 현재 태그 필터 기준
        filter_kwargs = {
            'due_date': todo.due_date
        }

        if selected_tag:
            filter_kwargs['tag'] = selected_tag

        filtered_todos = Todo.objects.filter(**filter_kwargs)

        total_todos = filtered_todos.count()
        completed_todos = filtered_todos.filter(
            is_completed=True
        ).count()

        return JsonResponse({
            'status': 'success',
            'is_completed': todo.is_completed,
            'total_todos': total_todos,
            'completed_todos': completed_todos,
        })

    return JsonResponse({
        'status': 'error'
    }, status=400)


def todo_delete(request, todo_id):
    todo = get_object_or_404(Todo, pk=todo_id)
    todo.delete()

    return redirect('todo_list')


def todo_edit(request, todo_id):
    todo = get_object_or_404(Todo, pk=todo_id)

    if request.method == 'POST':
        todo.title = request.POST.get('title')
        todo.tag = request.POST.get('tag')
        todo.priority = request.POST.get('priority')
        todo.due_date = request.POST.get('due_date')
        todo.save()

        return redirect(
            f"/?year={request.POST.get('year')}"
            f"&month={request.POST.get('month')}"
            f"&date={todo.due_date}"
            f"&tag={request.POST.get('current_tag', '')}"
        )

    return redirect('todo_list')


def stats(request):
    today = date.today()

    selected_date_str = request.GET.get(
        'date',
        today.strftime('%Y-%m-%d')
    )

    selected_date_obj = datetime.strptime(
        selected_date_str,
        '%Y-%m-%d'
    )

    year = selected_date_obj.year
    month = selected_date_obj.month

    monthly_todos = Todo.objects.filter(
        due_date__year=year,
        due_date__month=month
    )

    total_count = monthly_todos.count()

    completed_count = monthly_todos.filter(
        is_completed=True
    ).count()

    incomplete_count = monthly_todos.filter(
        is_completed=False
    ).count()

    if total_count > 0:
        completion_rate = round(
            completed_count / total_count * 100
        )
    else:
        completion_rate = 0

    tag_stats = []

    for tag_code, tag_name in Todo.TAG_CHOICES:
        tag_todos = monthly_todos.filter(
            tag=tag_code
        )

        tag_total = tag_todos.count()

        tag_completed = tag_todos.filter(
            is_completed=True
        ).count()

        if tag_total > 0:
            tag_rate = round(
                tag_completed / tag_total * 100
            )
        else:
            tag_rate = 0

        tag_stats.append({
            'code': tag_code,
            'name': tag_name,
            'total': tag_total,
            'completed': tag_completed,
            'rate': tag_rate,
        })

    priority_stats = []

    for priority_code, priority_name in Todo.PRIORITY_CHOICES:
        priority_todos = monthly_todos.filter(
            priority=priority_code
        )

        priority_total = priority_todos.count()

        priority_completed = priority_todos.filter(
            is_completed=True
        ).count()

        priority_stats.append({
            'code': priority_code,
            'name': priority_name,
            'total': priority_total,
            'completed': priority_completed,
        })

    context = {
        'selected_date': selected_date_str,
        'selected_date_obj': selected_date_obj,
        'year': year,
        'month': month,

        'total_count': total_count,
        'completed_count': completed_count,
        'incomplete_count': incomplete_count,
        'completion_rate': completion_rate,

        'tag_stats': tag_stats,
        'priority_stats': priority_stats,
    }

    return render(
        request,
        'todos/stats.html',
        context
    )