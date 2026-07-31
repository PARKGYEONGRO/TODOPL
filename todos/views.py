# todos/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.db.models import Case, When, Value, IntegerField
from .models import Todo
import calendar
from datetime import date, datetime

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

    # #터미널 확인용 디버깅 출력
    # print(f"====================================")
    # print(f"선택 날짜: {selected_date_str}")
    # print(f"선택 태그: '{selected_tag}'")
    # print(f"실제 실행된 SQL 조건: {todos.query}")
    # print(f"최종 조회된 데이터 개수: {todos.count()}")
    # print(f"====================================")

    cal = calendar.Calendar(firstweekday=6)
    month_days = cal.monthdayscalendar(year, month)

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
        'year': year,
        'month': f"{month:02d}",
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
        todo.is_completed = not todo.is_completed
        todo.save()

        return JsonResponse({
            'status' : 'success',
            'is_completed' : todo.is_completed
        })
    return JsonResponse({'status' : 'error'}, status=400)

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

        return redirect(f"/?year={request.POST.get('year')}&month={request.POST.get('month')}&date={todo.due_date}&tag={request.POST.get('current_tag', '')}")

    return redirect('todo_list')