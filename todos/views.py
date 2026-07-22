from django.shortcuts import render, redirect
from .models import Todo

def todo_list(request):
    return render(request, 'todos/todo_list.html')

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