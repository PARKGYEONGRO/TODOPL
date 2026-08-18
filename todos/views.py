# todos/views.py

import json
import os
import calendar

from datetime import date, datetime, timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse

from django.shortcuts import (
    render,
    redirect,
    get_object_or_404
)

from django.db.models import (
    Case,
    When,
    Value,
    IntegerField,
    Q
)

from django.views.decorators.http import require_POST

from .models import (
    Todo,
    TodoCompletion,
    TodoSomeday
)

from supabase import create_client


# ============================================================
# 로그인 화면
# ============================================================
def login_view(request):

    if request.method == 'GET':

        return render(
            request,
            'todos/login.html'
        )

    return JsonResponse(
        {
            'success': False,
            'message': '잘못된 요청입니다.'
        },
        status=400
    )


# ============================================================
# Supabase 로그인
# ============================================================
@require_POST
def supabase_login(request):

    email = request.POST.get(
        'email',
        ''
    ).strip().lower()

    password = request.POST.get(
        'password',
        ''
    )


    if not email or not password:

        return JsonResponse(
            {
                'success': False,
                'message':
                    '이메일과 비밀번호를 입력해주세요.'
            },
            status=400
        )


    supabase_url = os.getenv(
        'SUPABASE_URL'
    )

    supabase_anon_key = os.getenv(
        'SUPABASE_ANON_KEY'
    )


    if not supabase_url or not supabase_anon_key:

        return JsonResponse(
            {
                'success': False,
                'message':
                    'Supabase 설정을 확인해주세요.'
            },
            status=500
        )


    try:

        supabase = create_client(
            supabase_url,
            supabase_anon_key
        )


        response = (
            supabase
            .auth
            .sign_in_with_password(
                {
                    'email': email,
                    'password': password,
                }
            )
        )


        if not response.user:

            return JsonResponse(
                {
                    'success': False,
                    'message':
                        '로그인에 실패했습니다.'
                },
                status=401
            )


        SupabaseUser = response.user


        User = get_user_model()


        DjangoUser, Created = (
            User.objects.get_or_create(
                username=email,
                defaults={
                    'email': email,
                }
            )
        )


        if not DjangoUser.email:

            DjangoUser.email = email

            DjangoUser.save(
                update_fields=[
                    'email'
                ]
            )


        # Django 로그인 세션 생성
        login(
            request,
            DjangoUser
        )

        # Supabase User ID 세션 저장
        request.session['supabase_user_id'] = (
            SupabaseUser.id
        )

        print(
            '로그인 성공:',
            DjangoUser
        )


        return JsonResponse(
            {
                'success': True,
                'message':
                    '로그인되었습니다.',
                'user': {
                    'email': email,
                }
            }
        )


    except Exception as Error:

        print(
            'Supabase 로그인 오류:',
            Error
        )


        return JsonResponse(
            {
                'success': False,
                'message':
                    '이메일 또는 비밀번호를 확인해주세요.'
            },
            status=401
        )


# ============================================================
# 회원탈퇴
# ============================================================
@require_POST
def account_delete(request):

    withdrawal_reason = request.POST.get(
        'withdrawal_reason',
        ''
    ).strip()

    withdrawal_detail = request.POST.get(
        'withdrawal_detail',
        ''
    ).strip()

    withdrawal_confirm = request.POST.get(
        'withdrawal_confirm'
    )

    withdrawal_identity = request.POST.get(
        'withdrawal_identity',
        ''
    ).strip()


    # ========================================================
    # 로그인 확인
    # ========================================================

    if not request.user.is_authenticated:

        return JsonResponse(
            {
                'success': False,
                'message':
                    '로그인이 필요합니다.'
            },
            status=401
        )


    # ========================================================
    # 필수값 확인
    # ========================================================

    if not withdrawal_reason:

        return JsonResponse(
            {
                'success': False,
                'message':
                    '탈퇴 사유를 선택해주세요.'
            },
            status=400
        )


    if len(withdrawal_detail) < 10:

        return JsonResponse(
            {
                'success': False,
                'message':
                    '상세 사유를 10자 이상 입력해주세요.'
            },
            status=400
        )


    if len(withdrawal_detail) > 500:

        return JsonResponse(
            {
                'success': False,
                'message':
                    '상세 사유는 500자 이하로 입력해주세요.'
            },
            status=400
        )


    if withdrawal_confirm != 'on':

        return JsonResponse(
            {
                'success': False,
                'message':
                    '계정 및 데이터 복구 불가에 동의해주세요.'
            },
            status=400
        )


    # ========================================================
    # 이메일 / 아이디 확인
    # ========================================================

    UserEmail = (
        request.user.email or
        request.user.username
    )


    if withdrawal_identity != UserEmail:

        return JsonResponse(
            {
                'success': False,
                'message':
                    '확인 문구가 일치하지 않습니다.'
            },
            status=400
        )


    # ========================================================
    # Supabase 설정
    # ========================================================

    supabase_url = os.getenv(
        'SUPABASE_URL'
    )

    supabase_service_role_key = os.getenv(
        'SUPABASE_SERVICE_ROLE_KEY'
    )


    if (
        not supabase_url or
        not supabase_service_role_key
    ):

        return JsonResponse(
            {
                'success': False,
                'message':
                    'Supabase 설정을 확인해주세요.'
            },
            status=500
        )


    # ========================================================
    # Supabase User ID
    # ========================================================

    SupabaseUserId = request.session.get(
        'supabase_user_id'
    )

    print('탈퇴 SupabaseUserID:', SupabaseUserId)

    if not SupabaseUserId:

        return JsonResponse(
            {
                'success': False,
                'message':
                    '사용자 인증 정보를 찾을 수 없습니다.'
            },
            status=400
        )


    try:

        # ====================================================
        # Supabase 관리자 클라이언트
        # ====================================================

        Supabase = create_client(
            supabase_url,
            supabase_service_role_key
        )


        # ====================================================
        # 1. 탈퇴 사유 저장
        # ====================================================

        ReasonResponse = Supabase.table(
            'account_deletion_reasons'
        ).insert(
            {
                'reason': withdrawal_reason,
                'detail': withdrawal_detail,
            }
        ).execute()

        print('탈퇴사유 저장 결과: ',ReasonResponse)

        # ====================================================
        # 2. Supabase Auth 사용자 삭제
        # ====================================================

        DeleteResponse = Supabase.auth.admin.delete_user(
            SupabaseUserId
        )

        print('Supabase 사용자 삭제 결과:', DeleteResponse)

        # ====================================================
        # 3. Django 세션 로그아웃
        # ====================================================

        logout(
            request
        )


        return JsonResponse(
            {
                'success': True,
                'message':
                    '회원탈퇴가 완료되었습니다.',
                'redirect_url':
                    '/login/'
            }
        )


    except Exception as Error:

        print(
            '회원탈퇴 오류:',
            Error
        )


        return JsonResponse(
            {
                'success': False,
                'message':
                    '회원탈퇴 처리 중 오류가 발생했습니다.'
            },
            status=500
        )


# ============================================================
# Todo 목록
# ============================================================
@login_required(login_url='/login/')
def todo_list(request):

    today = date.today()


    # =========================
    # 기본 요청값
    # =========================

    year = int(
        request.GET.get(
            'year',
            today.year
        )
    )

    month = int(
        request.GET.get(
            'month',
            today.month
        )
    )

    selected_date_str = request.GET.get(
        'date',
        today.strftime('%Y-%m-%d')
    )

    selected_tag = request.GET.get(
        'tag',
        ''
    ).strip()


    # =========================
    # 선택 날짜 객체
    # =========================

    selected_date_obj = datetime.strptime(
        selected_date_str,
        '%Y-%m-%d'
    ).date()


    # =========================
    # 현재 로그인 사용자
    # =========================

    print(
        '현재 사용자:',
        request.user
    )

    print(
        '로그인 여부:',
        request.user.is_authenticated
    )


    # =========================
    # 선택 날짜에 완료된
    # 기간 Todo ID 조회
    # =========================

    selected_completed_todo_ids = set(

        TodoCompletion.objects.filter(

            todo__user=request.user,

            completed_date=selected_date_obj

        ).values_list(

            'todo_id',
            flat=True

        )

    )


    # =========================
    # 월간 통계
    # =========================

    monthly_stats = Get_Monthly_Stats(
        request.user,
        year,
        month
    )


    # =========================
    # 통계 제목
    # =========================

    is_current_month = (

        year == today.year

        and

        month == today.month

    )


    if is_current_month:

        stats_title = '이번달 통계'

    else:

        stats_title = (
            f'{year}년 {month}월 통계'
        )


    # =========================
    # 선택 날짜 Todo 조회
    # =========================

    todo_query = (

        Q(

            due_date=selected_date_obj,

            end_date__isnull=True

        )

        |

        Q(

            due_date__lte=selected_date_obj,

            end_date__gte=selected_date_obj

        )

    )


    # =========================
    # 태그 필터
    # =========================

    if selected_tag:

        todo_query &= Q(
            tag=selected_tag
        )


    # =========================
    # Todo 조회
    # =========================

    todos = (

        Todo.objects

        .filter(
            user=request.user
        )

        .filter(
            todo_query
        )

        .annotate(

            priority_order=Case(

                When(
                    priority='H',
                    then=Value(1)
                ),

                When(
                    priority='M',
                    then=Value(2)
                ),

                When(
                    priority='L',
                    then=Value(3)
                ),

                default=Value(4),

                output_field=IntegerField(),

            )

        )

        .order_by(
            'priority_order',
            'created_at'
        )

    )


    # =========================
    # 선택 날짜 기준 완료 상태
    # =========================

    for todo in todos:

        if todo.end_date is None:

            todo.display_completed = (
                todo.is_completed
            )

        else:

            todo.display_completed = (
                todo.id
                in selected_completed_todo_ids
            )


    # =========================
    # 기본 통계
    # =========================

    total_todos = todos.count()


    completed_todos = sum(

        1

        for todo in todos

        if todo.display_completed

    )


    # ============================================================
    # 언젠가 할 일
    # ============================================================

    someday_todos = (

        TodoSomeday.objects

        .filter(
            user=request.user
        )

        .annotate(

            priority_order=Case(

                When(
                    priority='H',
                    then=Value(1)
                ),

                When(
                    priority='M',
                    then=Value(2)
                ),

                When(
                    priority='L',
                    then=Value(3)
                ),

                default=Value(4),

                output_field=IntegerField(),

            )

        )

        .order_by(

            'is_completed',

            'priority_order',

            'created_at'

        )

    )


    someday_total_count = (
        someday_todos.count()
    )


    someday_completed_count = (

        someday_todos

        .filter(
            is_completed=True
        )

        .count()

    )


    # =========================
    # 현재 달 시작 / 종료
    # =========================

    month_start = date(
        year,
        month,
        1
    )


    month_end = date(

        year,

        month,

        calendar.monthrange(
            year,
            month
        )[1]

    )


    # =========================
    # 현재 달과 겹치는 Todo
    # =========================

    calendar_todos = (

        Todo.objects

        .filter(
            user=request.user
        )

        .filter(
            due_date__lte=month_end
        )

        .filter(

            Q(
                end_date__isnull=True
            )

            |

            Q(
                end_date__gte=month_start
            )

        )

        .order_by(

            'due_date',

            'created_at'

        )

    )


    # =========================
    # 날짜별 일반 Todo
    # =========================

    calendar_todos_by_date = {}


    # =========================
    # 기간 Todo
    # =========================

    period_todos = []


    for todo in calendar_todos:

        todo_start = todo.due_date

        todo_end = (

            todo.end_date

            or

            todo.due_date

        )


        if todo.end_date:

            period_todos.append(
                todo
            )

            continue


        if (

            month_start

            <=

            todo_start

            <=

            month_end

        ):

            date_key = (
                todo_start.strftime(
                    '%Y-%m-%d'
                )
            )


            if date_key not in calendar_todos_by_date:

                calendar_todos_by_date[
                    date_key
                ] = []


            if len(

                calendar_todos_by_date[
                    date_key
                ]

            ) < 5:

                calendar_todos_by_date[
                    date_key
                ].append(todo)


    # =========================
    # 캘린더 생성
    # =========================

    cal = calendar.Calendar(
        firstweekday=6
    )


    month_days = cal.monthdayscalendar(
        year,
        month
    )


    # =========================
    # 캘린더 데이터
    # =========================

    calendar_data = []


    for week in month_days:

        week_data = []


        for day in week:

            if day == 0:

                week_data.append({

                    'day': 0,

                    'date': None,

                    'todos': [],

                    'period_todos': [],

                })

                continue


            current_date = date(
                year,
                month,
                day
            )


            date_key = (
                current_date.strftime(
                    '%Y-%m-%d'
                )
            )


            current_period_todos = []


            for todo in period_todos:

                if (

                    todo.due_date

                    <=

                    current_date

                    <=

                    todo.end_date

                ):

                    current_period_todos.append(
                        todo
                    )


            # =========================
            # 기간 Todo 우선순위
            # =========================

            current_period_todos.sort(

                key=lambda todo:
                    {
                        'H': 1,
                        'M': 2,
                        'L': 3,
                    }.get(
                        todo.priority,
                        4
                    )

            )


            current_todos = (

                calendar_todos_by_date.get(

                    date_key,

                    []

                )

            )


            week_data.append({

                'day':
                    day,

                'date':
                    date_key,

                'todos':
                    current_todos,

                'period_todos':
                    current_period_todos,

            })


        calendar_data.append(
            week_data
        )


    # =========================
    # 이전 달
    # =========================

    if month == 1:

        prev_year = year - 1

        prev_month = 12

    else:

        prev_year = year

        prev_month = month - 1


    # =========================
    # 다음 달
    # =========================

    if month == 12:

        next_year = year + 1

        next_month = 1

    else:

        next_year = year

        next_month = month + 1


    # =========================================================
    # Context
    # =========================================================

    context = {

        'todos':
            todos,

        'total_todos':
            total_todos,

        'completed_todos':
            completed_todos,

        'selected_completed_todo_ids':
            selected_completed_todo_ids,


        'someday_todos':
            someday_todos,

        'someday_total_count':
            someday_total_count,

        'someday_completed_count':
            someday_completed_count,


        'calendar_data':
            calendar_data,

        'calendar_todos_by_date':
            calendar_todos_by_date,

        'year':
            year,

        'month':
            f'{month:02d}',

        'month_days':
            month_days,


        'selected_date':
            selected_date_str,

        'selected_date_obj':
            datetime.combine(

                selected_date_obj,

                datetime.min.time()

            ),


        'selected_tag':
            selected_tag,


        'today_str':
            today.strftime(
                '%Y-%m-%d'
            ),


        'prev_year':
            prev_year,

        'prev_month':
            prev_month,

        'next_year':
            next_year,

        'next_month':
            next_month,


        'stats_title':
            stats_title,

        **monthly_stats,

    }


    return render(

        request,

        'todos/todo_list.html',

        context

    )


# ============================================================
# Todo 생성
# ============================================================
@login_required(login_url='/login/')
def todo_create(request):

    if request.method == 'POST':

        title = request.POST.get(
            'title'
        )

        due_date = request.POST.get(
            'due_date'
        )

        end_date = request.POST.get(
            'end_date'
        )

        tag = request.POST.get(
            'tag'
        )

        priority = request.POST.get(
            'priority'
        )


        if not end_date:

            end_date = None


        Todo.objects.create(

            user=request.user,

            title=title,

            due_date=due_date,

            end_date=end_date,

            tag=tag,

            priority=priority

        )


        current_tag = request.POST.get(
            'current_tag',
            ''
        )


        redirect_url = request.POST.get(
            'return_url',
            '/'
        )


        if current_tag:

            separator = (
                '&'
                if '?' in redirect_url
                else '?'
            )

            redirect_url += (
                f'{separator}tag={current_tag}'
            )


        return redirect(
            redirect_url
        )


    return redirect(
        '/'
    )


# ============================================================
# Todo 완료 / 미완료
# ============================================================

@login_required(login_url='/login/')
def todo_toggle(request, todo_id):

    if request.method != 'POST':

        return JsonResponse({

            'status': 'error',

            'message':
                '잘못된 요청입니다.'

        }, status=400)


    todo = get_object_or_404(

        Todo,

        pk=todo_id,

        user=request.user

    )


    # =========================
    # 요청 데이터
    # =========================

    try:

        data = json.loads(
            request.body
        )

        selected_date_str = data.get(
            'date'
        )

    except (
        json.JSONDecodeError,
        AttributeError
    ):

        selected_date_str = None


    # =========================
    # 선택 날짜
    # =========================

    if selected_date_str:

        try:

            selected_date = datetime.strptime(

                selected_date_str,

                '%Y-%m-%d'

            ).date()

        except ValueError:

            return JsonResponse({

                'status': 'error',

                'message':
                    '날짜 형식이 올바르지 않습니다.'

            }, status=400)

    else:

        selected_date = todo.due_date


    # =========================
    # 기간 Todo인지 확인
    # =========================

    is_period_todo = (
        todo.end_date is not None
    )


    # =========================
    # 기간 Todo
    # =========================

    if is_period_todo:

        if not (

            todo.due_date
            <=
            selected_date
            <=
            todo.end_date

        ):

            return JsonResponse({

                'status': 'error',

                'message':
                    '기간에 포함되지 않은 날짜입니다.'

            }, status=400)


        completion = (
            TodoCompletion.objects.filter(

                todo=todo,

                completed_date=selected_date

            ).first()
        )


        if completion:

            completion.delete()

            is_completed = False

        else:

            TodoCompletion.objects.create(

                todo=todo,

                completed_date=selected_date

            )

            is_completed = True


    # =========================
    # 하루 Todo
    # =========================

    else:

        if selected_date != todo.due_date:

            return JsonResponse({

                'status': 'error',

                'message':
                    '잘못된 날짜입니다.'

            }, status=400)


        todo.is_completed = (
            not todo.is_completed
        )


        todo.save(

            update_fields=[
                'is_completed'
            ]

        )


        is_completed = (
            todo.is_completed
        )


    # ==================================================
    # 선택 날짜 기준 중앙 통계
    # ==================================================

    selected_date_query = (

        Q(

            due_date=selected_date,

            end_date__isnull=True

        )

        |

        Q(

            due_date__lte=selected_date,

            end_date__gte=selected_date

        )

    )


    selected_todos = (

        Todo.objects

        .filter(
            user=request.user
        )

        .filter(
            selected_date_query
        )

    )


    selected_total_count = (
        selected_todos.count()
    )


    selected_completed_count = 0


    for current_todo in selected_todos:

        if current_todo.end_date:

            if TodoCompletion.objects.filter(

                todo=current_todo,

                completed_date=selected_date

            ).exists():

                selected_completed_count += 1

        elif current_todo.is_completed:

            selected_completed_count += 1


    selected_incomplete_count = (

        selected_total_count
        -
        selected_completed_count

    )


    if selected_total_count > 0:

        selected_completion_rate = round(

            selected_completed_count
            /
            selected_total_count
            *
            100

        )

    else:

        selected_completion_rate = 0


    # ==================================================
    # 이번달 통계
    # ==================================================

    monthly_stats = Get_Monthly_Stats(
        request.user,
        selected_date.year,
        selected_date.month
    )


    # =========================
    # 응답
    # =========================

    return JsonResponse({

        'status':
            'success',

        'is_completed':
            is_completed,

        'selected_total_count':
            selected_total_count,

        'selected_completed_count':
            selected_completed_count,

        'selected_incomplete_count':
            selected_incomplete_count,

        'selected_completion_rate':
            selected_completion_rate,

        'monthly_total_count':
            monthly_stats['total_count'],

        'monthly_completed_count':
            monthly_stats['completed_count'],

        'monthly_incomplete_count':
            monthly_stats['incomplete_count'],

        'monthly_completion_rate':
            monthly_stats['completion_rate'],

        'monthly_tag_stats':
            monthly_stats['tag_stats'],

        'monthly_priority_stats':
            monthly_stats['priority_stats'],

    })


# ============================================================
# Todo 삭제
# ============================================================

@login_required(login_url='/login/')
def todo_delete(request, todo_id):

    todo = get_object_or_404(

        Todo,

        pk=todo_id,

        user=request.user

    )


    if request.method == 'POST':

        todo.delete()


        return_url = request.POST.get(
            'return_url'
        )


        if return_url:

            return redirect(
                return_url
            )


        return redirect(

            request.META.get(

                'HTTP_REFERER',

                '/'

            )

        )


    return redirect(

        request.META.get(

            'HTTP_REFERER',

            '/'

        )

    )


# ============================================================
# Todo 수정
# ============================================================

@login_required(login_url='/login/')
def todo_edit(request, todo_id):

    todo = get_object_or_404(

        Todo,

        pk=todo_id,

        user=request.user

    )


    if request.method == 'POST':

        todo.title = request.POST.get(
            'title'
        )

        todo.tag = request.POST.get(
            'tag'
        )

        todo.priority = request.POST.get(
            'priority'
        )


        schedule_type = request.POST.get(
            'schedule_type',
            'single'
        )


        due_date = request.POST.get(
            'due_date'
        )


        todo.due_date = due_date


        if schedule_type == 'range':

            todo.end_date = request.POST.get(
                'end_date'
            )

        else:

            todo.end_date = None


        todo.save()


        return_url = request.POST.get(
            'return_url'
        )


        if return_url:

            return redirect(
                return_url
            )


        return redirect(

            request.META.get(

                'HTTP_REFERER',

                '/'

            )

        )


    return redirect(

        request.META.get(

            'HTTP_REFERER',

            '/'

        )

    )


# ============================================================
# 통계
# ============================================================

@login_required(login_url='/login/')
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


    monthly_stats = Get_Monthly_Stats(
        request.user,
        year,
        month
    )


    is_current_month = (

        year == today.year

        and

        month == today.month

    )


    if is_current_month:

        stats_title = '이번달 통계'

    else:

        stats_title = (
            f'{year}년 {month}월 통계'
        )


    context = {

        'selected_date':
            selected_date_str,

        'selected_date_obj':
            selected_date_obj,

        'year':
            year,

        'month':
            month,

        'stats_title':
            stats_title,

        **monthly_stats,

    }


    return render(

        request,

        'todos/stats.html',

        context

    )


# ============================================================
# 월간 통계
# ============================================================

def Get_Monthly_Stats(user, year, month):

    month_start = date(

        year,

        month,

        1

    )


    month_end = date(

        year,

        month,

        calendar.monthrange(

            year,

            month

        )[1]

    )


    # =========================
    # 해당 사용자 + 해당 월 Todo
    # =========================

    monthly_todos = (

        Todo.objects

        .filter(
            user=user
        )

        .filter(

            due_date__lte=month_end

        )

        .filter(

            Q(
                end_date__isnull=True
            )

            |

            Q(
                end_date__gte=month_start
            )

        )

    )


    # ==================================================
    # 기본 통계
    # ==================================================

    total_count = (
        monthly_todos.count()
    )


    completed_count = 0


    for todo in monthly_todos:

        if todo.end_date:

            period_start = max(

                todo.due_date,

                month_start

            )


            period_end = min(

                todo.end_date,

                month_end

            )


            total_days = (

                period_end
                -
                period_start

            ).days + 1


            completed_days = (

                TodoCompletion.objects.filter(

                    todo=todo,

                    completed_date__gte=period_start,

                    completed_date__lte=period_end

                ).count()

            )


            if (

                total_days > 0

                and

                completed_days >= total_days

            ):

                completed_count += 1


        elif todo.is_completed:

            completed_count += 1


    incomplete_count = max(

        total_count
        -
        completed_count,

        0

    )


    if total_count > 0:

        completion_rate = round(

            completed_count
            /
            total_count
            *
            100

        )

    else:

        completion_rate = 0


    # ==================================================
    # 태그별 통계
    # ==================================================

    tag_stats = []


    tag_list = [

        ('WORK', '업무'),

        ('PERSONAL', '개인'),

        ('HEALTH', '건강'),

        ('STUDY', '공부'),

        ('ETC', '기타'),

    ]


    for tag_code, tag_name in tag_list:

        tag_todos = monthly_todos.filter(

            tag=tag_code

        )


        tag_total = (
            tag_todos.count()
        )


        tag_completed = 0


        for todo in tag_todos:

            if todo.end_date:

                period_start = max(

                    todo.due_date,

                    month_start

                )


                period_end = min(

                    todo.end_date,

                    month_end

                )


                total_days = (

                    period_end
                    -
                    period_start

                ).days + 1


                completed_days = (

                    TodoCompletion.objects.filter(

                        todo=todo,

                        completed_date__gte=period_start,

                        completed_date__lte=period_end

                    ).count()

                )


                if (

                    total_days > 0

                    and

                    completed_days >= total_days

                ):

                    tag_completed += 1


            elif todo.is_completed:

                tag_completed += 1


        if tag_total > 0:

            tag_completion_rate = round(

                tag_completed
                /
                tag_total
                *
                100

            )

        else:

            tag_completion_rate = 0


        tag_stats.append({

            'code':
                tag_code,

            'name':
                tag_name,

            'total':
                tag_total,

            'completed':
                tag_completed,

            'rate':
                tag_completion_rate,

        })


    # ==================================================
    # 우선순위별 통계
    # ==================================================

    priority_stats = []


    priority_list = [

        ('H', '높음'),

        ('M', '보통'),

        ('L', '낮음'),

    ]


    for priority_code, priority_name in priority_list:

        priority_todos = monthly_todos.filter(

            priority=priority_code

        )


        priority_total = (
            priority_todos.count()
        )


        priority_completed = 0


        for todo in priority_todos:

            if todo.end_date:

                period_start = max(

                    todo.due_date,

                    month_start

                )


                period_end = min(

                    todo.end_date,

                    month_end

                )


                total_days = (

                    period_end
                    -
                    period_start

                ).days + 1


                completed_days = (

                    TodoCompletion.objects.filter(

                        todo=todo,

                        completed_date__gte=period_start,

                        completed_date__lte=period_end

                    ).count()

                )


                if (

                    total_days > 0

                    and

                    completed_days >= total_days

                ):

                    priority_completed += 1


            elif todo.is_completed:

                priority_completed += 1


        priority_stats.append({

            'code':
                priority_code,

            'name':
                priority_name,

            'total':
                priority_total,

            'completed':
                priority_completed,

        })


    return {

        'total_count':
            total_count,

        'completed_count':
            completed_count,

        'incomplete_count':
            incomplete_count,

        'completion_rate':
            completion_rate,

        'tag_stats':
            tag_stats,

        'priority_stats':
            priority_stats,

    }


# ============================================================
# 홈
# ============================================================

@login_required(login_url='/login/')
def home(request):

    today = date.today()


    today_query = (

        Q(

            due_date=today,

            end_date__isnull=True

        )

        |

        Q(

            due_date__lte=today,

            end_date__gte=today

        )

    )


    today_todos = (

        Todo.objects

        .filter(
            user=request.user
        )

        .filter(
            today_query
        )

        .annotate(

            priority_order=Case(

                When(
                    priority='H',
                    then=Value(1)
                ),

                When(
                    priority='M',
                    then=Value(2)
                ),

                When(
                    priority='L',
                    then=Value(3)
                ),

                default=Value(4),

                output_field=IntegerField(),

            )

        )

        .order_by(

            'is_completed',

            'priority_order',

            'created_at'

        )

    )


    completed_period_ids = set(

        TodoCompletion.objects.filter(

            todo__user=request.user,

            completed_date=today

        ).values_list(

            'todo_id',

            flat=True

        )

    )


    for todo in today_todos:

        if todo.end_date:

            todo.display_completed = (

                todo.id
                in
                completed_period_ids

            )

        else:

            todo.display_completed = (
                todo.is_completed
            )


    today_total_count = (
        today_todos.count()
    )


    today_completed_count = sum(

        1

        for todo in today_todos

        if todo.display_completed

    )


    # ============================================================
    # 언젠가 할 일
    # ============================================================

    someday_todos = (

        TodoSomeday.objects

        .filter(
            user=request.user
        )

        .annotate(

            priority_order=Case(

                When(
                    priority='H',
                    then=Value(1)
                ),

                When(
                    priority='M',
                    then=Value(2)
                ),

                When(
                    priority='L',
                    then=Value(3)
                ),

                default=Value(4),

                output_field=IntegerField(),

            )

        )

        .order_by(

            'is_completed',

            'priority_order',

            'created_at'

        )

    )


    someday_total_count = (
        someday_todos.count()
    )


    someday_completed_count = (

        someday_todos

        .filter(
            is_completed=True
        )

        .count()

    )


    context = {

        'today_todos':
            today_todos,

        'today_total_count':
            today_total_count,

        'today_completed_count':
            today_completed_count,


        'someday_todos':
            someday_todos,

        'someday_total_count':
            someday_total_count,

        'someday_completed_count':
            someday_completed_count,


        'selected_tag':
            '',

        'selected_date':
            today.strftime('%Y-%m-%d'),

        'selected_date_obj':
            datetime.combine(

                today,

                datetime.min.time()

            ),

        'today_str':
            today.strftime('%Y-%m-%d'),

        'year':
            today.year,

        'month':
            f'{today.month:02d}',

        'selected_completed_todo_ids':
            completed_period_ids,

    }


    return render(

        request,

        'todos/home.html',

        context

    )


# ============================================================
# 언젠가 할 일 목록
# ============================================================
@login_required(login_url='/login/')
def todo_someday_list(request):

    someday_todos = (
        TodoSomeday.objects
        .filter(
            user=request.user
        )
        .order_by(
            'is_completed',
            'priority',
            'created_at'
        )
    )

    context = {
        'someday_todos': someday_todos,
    }

    return render(
        request,
        'todos/someday.html',
        context
    )


# ============================================================
# 언젠가 할 일 생성
# ============================================================
@login_required(login_url='/login/')
def todo_someday_create(request):

    if request.method != 'POST':

        return redirect('/')

    title = request.POST.get(
        'title',
        ''
    ).strip()

    tag = request.POST.get(
        'tag',
        'WORK'
    )

    priority = request.POST.get(
        'priority',
        'M'
    )

    if not title:

        return redirect(
            request.POST.get(
                'return_url',
                '/'
            )
        )

    TodoSomeday.objects.create(
        user=request.user,
        title=title,
        tag=tag,
        priority=priority
    )

    return redirect(
        request.POST.get(
            'return_url',
            '/'
        )
    )


# ============================================================
# 언젠가 할 일 완료 / 미완료
# ============================================================

@login_required(login_url='/login/')
@require_POST
def todo_someday_toggle(
    request,
    someday_id
):

    todo_someday = get_object_or_404(

        TodoSomeday,

        pk=someday_id,

        user=request.user

    )


    todo_someday.is_completed = (
        not todo_someday.is_completed
    )


    todo_someday.save(

        update_fields=[
            'is_completed'
        ]

    )


    someday_total_count = (
        TodoSomeday.objects

        .filter(
            user=request.user
        )

        .count()
    )


    someday_completed_count = (

        TodoSomeday.objects

        .filter(

            user=request.user,

            is_completed=True

        )

        .count()

    )


    return JsonResponse({

        'status':
            'success',

        'is_completed':
            todo_someday.is_completed,

        'someday_total_count':
            someday_total_count,

        'someday_completed_count':
            someday_completed_count,

    })

# ============================================================
# 언젠가 할 일 삭제
# ============================================================

@login_required(login_url='/login/')
def todo_someday_delete(
    request,
    someday_id
):

    someday_todo = get_object_or_404(
        TodoSomeday,
        pk=someday_id,
        user=request.user
    )

    if request.method == 'POST':

        someday_todo.delete()

    return redirect(
        request.POST.get(
            'return_url',
            '/'
        )
    )


# ============================================================
# 언젠가 할 일 수정
# ============================================================

@login_required(login_url='/login/')
def todo_someday_edit(
    request,
    someday_id
):

    someday_todo = get_object_or_404(
        TodoSomeday,
        pk=someday_id,
        user=request.user
    )

    if request.method == 'POST':

        title = request.POST.get(
            'title',
            ''
        ).strip()

        tag = request.POST.get(
            'tag',
            'WORK'
        )

        priority = request.POST.get(
            'priority',
            'M'
        )

        if title:

            someday_todo.title = title
            someday_todo.tag = tag
            someday_todo.priority = priority

            someday_todo.save()

    return redirect(
        request.POST.get(
            'return_url',
            '/'
        )
    )
