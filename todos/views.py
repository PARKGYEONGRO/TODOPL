import json
import os
import calendar

from datetime import date, datetime, timedelta

from django.contrib.auth import (
    get_user_model,
    login,
    logout
)

from django.contrib.auth.decorators import (
    login_required
)

from django.http import (
    JsonResponse
)

from django.shortcuts import (
    render,
    get_object_or_404
)

from django.db.models import (
    Case,
    When,
    Value,
    IntegerField,
    Q,
    Prefetch,
    Count
)

from django.views.decorators.http import (
    require_POST
)

from .models import (
    Tag,
    Todo,
    TodoCompletion,
    TodoSomeday
)

from supabase import create_client


def Get_User_Default_Tag(user): #사용자 기본 태그 가져오기

    DefaultTag, Created = Tag.objects.get_or_create(

        user=user,

        is_default=True,

        defaults={

            'name':
                '기본',

            'color':
                'gray'

        }

    )


    return DefaultTag

def Get_User_Tags(user): #사용자 태그 목록

    return (

        Tag.objects

        .filter(

            user=user

        )

        .order_by(

            '-is_default',

            'created_at'

        )

    )

def login_view(request): #로그인 화면

    if request.method == 'GET':

        return render(

            request,

            'todos/login.html'

        )


    return JsonResponse(

        {

            'success':
                False,

            'message':
                '잘못된 요청입니다.'

        },

        status=400

    )


@require_POST
def supabase_login(request): #Supabase 로그인

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

                'success':
                    False,

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


    if (

        not supabase_url

        or

        not supabase_anon_key

    ):

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    'Supabase 설정을 확인해주세요.'

            },

            status=500

        )


    try:

        Supabase = create_client(

            supabase_url,

            supabase_anon_key

        )


        Response = (

            Supabase

            .auth

            .sign_in_with_password(

                {

                    'email':
                        email,

                    'password':
                        password,

                }

            )

        )


        if not Response.user:

            return JsonResponse(

                {

                    'success':
                        False,

                    'message':
                        '로그인에 실패했습니다.'

                },

                status=401

            )


        SupabaseUser = Response.user


        User = get_user_model()


        DjangoUser, Created = (

            User.objects.get_or_create(

                username=email,

                defaults={

                    'email':
                        email,

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


        # Django 로그인 세션

        login(

            request,

            DjangoUser

        )


        # Supabase User ID 세션

        request.session[

            'supabase_user_id'

        ] = SupabaseUser.id


        print(

            '로그인 성공:',

            DjangoUser

        )


        Get_User_Default_Tag(

            DjangoUser

        )


        return JsonResponse(

            {

                'success':
                    True,

                'message':
                    '로그인되었습니다.',

                'user': {

                    'email':
                        email,

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

                'success':
                    False,

                'message':
                    '이메일 또는 비밀번호를 확인해주세요.'

            },

            status=401

        )


@require_POST
def account_delete(request): #회원 탈퇴

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


    # 로그인 확인

    if not request.user.is_authenticated:

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    '로그인이 필요합니다.'

            },

            status=401

        )


    # 필수값 확인

    if not withdrawal_reason:

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    '탈퇴 사유를 선택해주세요.'

            },

            status=400

        )


    if len(withdrawal_detail) < 10:

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    '상세 사유를 10자 이상 입력해주세요.'

            },

            status=400

        )


    if len(withdrawal_detail) > 500:

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    '상세 사유는 500자 이하로 입력해주세요.'

            },

            status=400

        )


    if withdrawal_confirm != 'on':

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    '계정 및 데이터 복구 불가에 동의해주세요.'

            },

            status=400

        )


    # 이메일 / 아이디 확인

    UserEmail = (

        request.user.email

        or

        request.user.username

    )


    if withdrawal_identity != UserEmail:

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    '확인 문구가 일치하지 않습니다.'

            },

            status=400

        )


    # Supabase 설정

    supabase_url = os.getenv(

        'SUPABASE_URL'

    )


    supabase_service_role_key = os.getenv(

        'SUPABASE_SERVICE_ROLE_KEY'

    )


    if (

        not supabase_url

        or

        not supabase_service_role_key

    ):

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    'Supabase 설정을 확인해주세요.'

            },

            status=500

        )


    # Supabase User ID

    SupabaseUserId = request.session.get(

        'supabase_user_id'

    )


    print(

        '탈퇴 SupabaseUserID:',

        SupabaseUserId

    )


    if not SupabaseUserId:

        return JsonResponse(

            {

                'success':
                    False,

                'message':
                    '사용자 인증 정보를 찾을 수 없습니다.'

            },

            status=400

        )


    try:

        # Supabase 관리자 클라이언트

        Supabase = create_client(

            supabase_url,

            supabase_service_role_key

        )


        # 1. 탈퇴 사유 저장

        ReasonResponse = (

            Supabase

            .table(

                'account_deletion_reasons'

            )

            .insert(

                {

                    'reason':
                        withdrawal_reason,

                    'detail':
                        withdrawal_detail,

                }

            )

            .execute()

        )


        print(

            '탈퇴사유 저장 결과:',

            ReasonResponse

        )


        # 2. Supabase Auth 사용자 삭제

        DeleteResponse = (

            Supabase

            .auth

            .admin

            .delete_user(

                SupabaseUserId

            )

        )


        print(

            'Supabase 사용자 삭제 결과:',

            DeleteResponse

        )


        # 3. Django 세션 로그아웃

        logout(request)
        request.session.flush()

        return JsonResponse(

            {

                'success':
                    True,

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

                'success':
                    False,

                'message':
                    '회원탈퇴 처리 중 오류가 발생했습니다.'

            },

            status=500

        )

TAG_COLORS = [

    'gray',
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'pink',

]

TAG_COLOR_CHOICES = [

    ('gray', '회색'),
    ('red', '빨강'),
    ('orange', '주황'),
    ('yellow', '노랑'),
    ('green', '초록'),
    ('blue', '파랑'),
    ('purple', '보라'),
    ('pink', '분홍'),

]


def Get_Tag_Data(TagObject):

    return {
        'id': TagObject.id,
        'name': TagObject.name,
        'color': TagObject.color,
    }


def Get_Todo_Data(todo):

    DueDate = todo.due_date
    EndDate = todo.end_date


    # 혹시 문자열로 들어온 경우
    if isinstance(DueDate, str):

        DueDate = datetime.strptime(
            DueDate,
            '%Y-%m-%d'
        ).date()


    if isinstance(EndDate, str):

        EndDate = datetime.strptime(
            EndDate,
            '%Y-%m-%d'
        ).date()


    return {

        'id':
            todo.id,

        'title':
            todo.title,

        'due_date':
            DueDate.strftime(
                '%Y-%m-%d'
            ),

        'end_date':
            (
                EndDate.strftime(
                    '%Y-%m-%d'
                )
                if EndDate
                else None
            ),

        'priority':
            todo.priority,

        'is_completed':
            todo.is_completed,

        'tag':
            Get_Tag_Data(
                todo.tag
            ),

    }


def Get_Todo_Someday_Data(todo_someday):

    return {
        'id': todo_someday.id,
        'title': todo_someday.title,
        'priority': todo_someday.priority,
        'is_completed': todo_someday.is_completed,
        'created_at': todo_someday.created_at.timestamp(),
        'tag': Get_Tag_Data(todo_someday.tag),
    }


def Get_Todo_Someday_Counts(user):

    someday_total_count = TodoSomeday.objects.filter(
        user=user
    ).count()

    someday_completed_count = TodoSomeday.objects.filter(
        user=user,
        is_completed=True
    ).count()

    return {
        'someday_total_count': someday_total_count,
        'someday_completed_count': someday_completed_count,
    }


@login_required(login_url='/login/')
@require_POST
def tag_create(request): #태그 생성

    name = request.POST.get(
        'name',
        ''
    ).strip()

    color = request.POST.get(
        'color',
        'gray'
    ).strip()


    if not name:

        return JsonResponse({

            'success': False,

            'status': 'error',

            'message': '태그 이름을 입력해주세요.'

        }, status=400)


    if color not in TAG_COLORS:

        color = 'gray'


    if Tag.objects.filter(
        user=request.user,
        name=name
    ).exists():

        return JsonResponse({

            'success': False,

            'status': 'error',

            'message': '이미 존재하는 태그입니다.'

        }, status=400)


    tag = Tag.objects.create(

        user=request.user,

        name=name,

        color=color

    )


    return JsonResponse({

        'success': True,

        'status': 'success',

        'message': '태그가 생성되었습니다.',

        'tag': Get_Tag_Data(tag)

    })


@login_required(login_url='/login/')
@require_POST
def tag_update(request, tag_id):  #태그 수정
    TagObject = get_object_or_404(Tag, id=tag_id, user=request.user)
    Name = request.POST.get('name', '').strip()
    Color = request.POST.get('color', 'gray').strip()

    if not Name:
        return JsonResponse({
            'success': False,
            'status': 'error',
            'message': '태그 이름을 입력해주세요.',
        }, status=400)

    if Color not in TAG_COLORS:
        Color = 'gray'

    if Tag.objects.filter(
        user=request.user,
        name=Name
    ).exclude(id=TagObject.id).exists():
        return JsonResponse({
            'success': False,
            'status': 'error',
            'message': '이미 존재하는 태그입니다.',
        }, status=400)

    TagObject.name = Name
    TagObject.color = Color
    TagObject.save(update_fields=['name', 'color'])

    return JsonResponse({
        'success': True,
        'status': 'success',
        'message': '태그가 수정되었습니다.',
        'tag': Get_Tag_Data(TagObject),
    })


@login_required(login_url='/login/')
@require_POST
def tag_delete(request, tag_id): #태그 삭제


    TagObject = get_object_or_404(

        Tag,

        id=tag_id,

        user=request.user

    )


    if TagObject.is_default:

        return JsonResponse({

            'success':
                False,

            'status':
                'error',

            'message':
                '기본 태그는 삭제할 수 없습니다.'

        }, status=400)



    DefaultTag = Get_User_Default_Tag(

        request.user

    )


    # 연결된 Todo 이동

    Todo.objects.filter(

        tag=TagObject

    ).update(

        tag=DefaultTag

    )


    # 연결된 Someday Todo 이동

    TodoSomeday.objects.filter(

        tag=TagObject

    ).update(

        tag=DefaultTag

    )


    TagObject.delete()


    return JsonResponse({

        'success':
            True,

        'status':
            'success',

        'message':
            '태그가 삭제되었습니다.',

        'tag_id':
            tag_id

    })


@login_required(login_url='/login/')
def todo_list(request):  # Todo 목록

    today = date.today()

    # ==========================
    # 기본 요청값
    # ==========================

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

    # ==========================
    # 선택 날짜
    # ==========================

    try:

        selected_date_obj = datetime.strptime(
            selected_date_str,
            '%Y-%m-%d'
        ).date()

    except ValueError:

        selected_date_obj = today

        selected_date_str = today.strftime(
            '%Y-%m-%d'
        )

    # ==========================
    # 사용자 태그
    # ==========================

    user_tags = Get_User_Tags(
        request.user
    )

    default_tag = Get_User_Default_Tag(
        request.user
    )

    selected_tag_object = None

    if selected_tag:

        try:

            selected_tag_object = user_tags.get(
                id=int(selected_tag)
            )

        except (
            Tag.DoesNotExist,
            ValueError
        ):

            selected_tag = ''

    # ==========================
    # 선택 날짜 기간 Todo 완료 기록
    # ==========================

    selected_completed_todo_ids = set(

        TodoCompletion.objects

        .filter(
            user=request.user,
            completed_date=selected_date_obj
        )

        .values_list(
            'todo_id',
            flat=True
        )

    )

    # ==========================
    # 월간 통계
    # ==========================

    monthly_stats = Get_Monthly_Stats(
        request.user,
        year,
        month
    )

    # ==========================
    # 통계 제목
    # ==========================

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

    # ==========================
    # 선택 날짜 Todo 조회
    # ==========================

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

    # 태그 필터

    if selected_tag_object:

        todo_query &= Q(
            tag=selected_tag_object
        )

    # Todo 조회

    todos = (

        Todo.objects

        .filter(
            user=request.user
        )

        .filter(
            todo_query
        )

        .select_related(
            'tag'
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

                output_field=IntegerField()

            )

        )

        .order_by(
            'priority_order',
            'created_at'
        )

    )

    # ==========================
    # 선택 날짜 기준 완료 상태
    # ==========================

    for todo in todos:

        if todo.end_date is None:

            todo.display_completed = (
                todo.is_completed
            )

        else:

            todo.display_completed = (
                todo.id
                in
                selected_completed_todo_ids
            )

    # ==========================
    # 선택 날짜 기본 통계
    # ==========================

    total_todos = todos.count()

    completed_todos = sum(

        1

        for todo in todos

        if todo.display_completed

    )

    # ==========================
    # 언젠가 할 일
    # ==========================

    someday_todos = (

        TodoSomeday.objects

        .filter(
            user=request.user
        )

        .select_related(
            'tag'
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

                output_field=IntegerField()

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

    # ==========================
    # 월 시작 / 종료
    # ==========================

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

    # ==========================
    # 현재 달과 겹치는 Todo
    # ==========================

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

        .select_related(
            'tag'
        )

        .order_by(
            'due_date',
            'created_at'
        )

    )

    # ==========================
    # 일반 Todo / 기간 Todo 분리
    # ==========================

    calendar_todos_by_date = {}

    period_todos = []

    for todo in calendar_todos:

        if todo.end_date:

            period_todos.append(
                todo
            )

            continue

        todo_date = todo.due_date

        if (
            month_start
            <= todo_date
            <= month_end
        ):

            date_key = todo_date.strftime(
                '%Y-%m-%d'
            )

            calendar_todos_by_date.setdefault(
                date_key,
                []
            )

            if len(
                calendar_todos_by_date[date_key]
            ) < 5:

                calendar_todos_by_date[
                    date_key
                ].append(
                    todo
                )

    # ==========================
    # 기간 Todo 날짜별 캐싱
    # ==========================

    period_todos_by_date = {}

    priority_order = {
        'H': 1,
        'M': 2,
        'L': 3
    }

    for todo in period_todos:

        current = max(
            todo.due_date,
            month_start
        )

        end = min(
            todo.end_date,
            month_end
        )

        while current <= end:

            date_key = current.strftime(
                '%Y-%m-%d'
            )

            period_todos_by_date.setdefault(
                date_key,
                []
            )

            period_todos_by_date[
                date_key
            ].append(
                todo
            )

            current += timedelta(
                days=1
            )

    # ==========================
    # 기간 Todo 우선순위 정렬
    # ==========================

    for todo_list in period_todos_by_date.values():

        todo_list.sort(

            key=lambda todo:

                priority_order.get(
                    todo.priority,
                    4
                )

        )

    # ==========================
    # 캘린더 생성
    # ==========================

    cal = calendar.Calendar(
        firstweekday=6
    )

    month_days = cal.monthdayscalendar(
        year,
        month
    )

    calendar_data = []

    for week in month_days:

        week_data = []

        for day in week:

            if day == 0:

                week_data.append({

                    'day': 0,

                    'date': None,

                    'todos': [],

                    'period_todos': []

                })

                continue

            current_date = date(
                year,
                month,
                day
            )

            date_key = current_date.strftime(
                '%Y-%m-%d'
            )

            week_data.append({

                'day':
                    day,

                'date':
                    date_key,

                'todos':
                    calendar_todos_by_date.get(
                        date_key,
                        []
                    ),

                'period_todos':
                    period_todos_by_date.get(
                        date_key,
                        []
                    )

            })

        calendar_data.append(
            week_data
        )

    # ==========================
    # 이전 달
    # ==========================

    if month == 1:

        prev_year = year - 1
        prev_month = 12

    else:

        prev_year = year
        prev_month = month - 1

    # ==========================
    # 다음 달
    # ==========================

    if month == 12:

        next_year = year + 1
        next_month = 1

    else:

        next_year = year
        next_month = month + 1

    # ==========================
    # Context
    # ==========================

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

        'user_tags':
            user_tags,

        'default_tag':
            default_tag,

        'tag_colors':
            TAG_COLOR_CHOICES,

        'tag_color_codes':
            TAG_COLORS,

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

        **monthly_stats

    }

    return render(
        request,
        'todos/todo_list.html',
        context
    )


@login_required(login_url='/login/')
@require_POST
def todo_create(request):  # Todo 생성

    title = request.POST.get(
        'title',
        ''
    ).strip()

    due_date_str = request.POST.get(
        'due_date'
    )

    end_date_str = request.POST.get(
        'end_date'
    )

    tag_id = request.POST.get(
        'tag'
    )

    priority = request.POST.get(
        'priority',
        'M'
    )


    # ==========================
    # 제목 확인
    # ==========================

    if not title:

        return JsonResponse({
            'success': False,
            'status': 'error',
            'message': '할 일을 입력해주세요.'
        }, status=400)


    # ==========================
    # 시작일 확인
    # ==========================

    if not due_date_str:

        return JsonResponse({
            'success': False,
            'status': 'error',
            'message': '시작 날짜를 입력해주세요.'
        }, status=400)


    try:

        due_date = datetime.strptime(
            due_date_str,
            '%Y-%m-%d'
        ).date()

    except (TypeError, ValueError):

        return JsonResponse({
            'success': False,
            'status': 'error',
            'message': '시작 날짜가 올바르지 않습니다.'
        }, status=400)


    # ==========================
    # 종료일 변환
    # ==========================

    if end_date_str:

        try:

            end_date = datetime.strptime(
                end_date_str,
                '%Y-%m-%d'
            ).date()

        except (TypeError, ValueError):

            return JsonResponse({
                'success': False,
                'status': 'error',
                'message': '종료 날짜가 올바르지 않습니다.'
            }, status=400)

    else:

        end_date = None


    # ==========================
    # 시작일 / 종료일 관계 확인
    # ==========================

    if end_date is not None:

        if end_date < due_date:

            return JsonResponse({
                'success': False,
                'status': 'error',
                'message': '종료 날짜는 시작 날짜보다 빠를 수 없습니다.'
            }, status=400)


    # ==========================
    # 사용자 본인의 태그만 허용
    # ==========================

    tag = get_object_or_404(
        Tag,
        id=tag_id,
        user=request.user
    )


    # ==========================
    # Todo 생성
    # ==========================

    todo = Todo.objects.create(

        user=request.user,

        title=title,

        due_date=due_date,

        end_date=end_date,

        tag=tag,

        priority=priority

    )


    # ==========================
    # 응답
    # ==========================

    return JsonResponse({

        'success':
            True,

        'status':
            'success',

        'message':
            '할 일이 생성되었습니다.',

        'todo':
            Get_Todo_Data(
                todo
            ),

    })


@login_required(login_url='/login/')
@require_POST
def todo_toggle(request, todo_id): #Toggle 완료 / 미완료


    todo = get_object_or_404(

        Todo,

        pk=todo_id,

        user=request.user

    )


    # 요청 데이터

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



    if selected_date_str:


        try:

            selected_date = datetime.strptime(

                selected_date_str,

                '%Y-%m-%d'

            ).date()


        except ValueError:


            return JsonResponse({

                'success':
                    False,

                'status':
                    'error',

                'message':
                    '날짜 형식이 올바르지 않습니다.'

            }, status=400)



    else:


        selected_date = todo.due_date



    # ==========================
    # 기간 Todo
    # ==========================
    if todo.end_date:

        if not (
            todo.due_date
            <=
            selected_date
            <=
            todo.end_date
        ):

            return JsonResponse({

                'success':
                    False,

                'status':
                    'error',

                'message':
                    '기간에 포함되지 않은 날짜입니다.'

            }, status=400)


        completion, created = TodoCompletion.objects.get_or_create(

            todo=todo,

            user=request.user,

            completed_date=selected_date

        )


        if created:

            is_completed = True

        else:

            completion.delete()

            is_completed = False


    # ==========================
    # 하루 Todo
    # ==========================


    else:


        if selected_date != todo.due_date:


            return JsonResponse({

                'success':
                    False,

                'status':
                    'error',

                'message':
                    '잘못된 날짜입니다.'

            }, status=400)



        todo.is_completed = not todo.is_completed


        todo.save(

            update_fields=[

                'is_completed'

            ]

        )


        is_completed = todo.is_completed



    # ==========================
    # 선택 날짜 통계
    # ==========================


    selected_query = (

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



    selected_todos = list(

        Todo.objects

        .filter(

            user=request.user

        )

        .filter(

            selected_query

        )

        .prefetch_related(

            Prefetch(

                'completions',

                queryset=(

                    TodoCompletion.objects

                    .filter(

                        completed_date=selected_date

                    )

                )

            )

        )

    )



    selected_total_count = len(

        selected_todos

    )


    selected_completed_count = 0



    for current_todo in selected_todos:


        if current_todo.end_date:


            if current_todo.completions.exists():

                selected_completed_count += 1


        else:


            if current_todo.is_completed:

                selected_completed_count += 1



    selected_incomplete_count = (

        selected_total_count

        -

        selected_completed_count

    )



    selected_completion_rate = (

        round(

            selected_completed_count

            /

            selected_total_count

            *

            100

        )

        if selected_total_count

        else 0

    )



    # ==========================
    # 월 통계
    # ==========================


    monthly_stats = Get_Monthly_Stats(

        request.user,

        selected_date.year,

        selected_date.month

    )



    return JsonResponse({

        'success':
            True,

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
            monthly_stats[

                'total_count'

            ],


        'monthly_completed_count':
            monthly_stats[

                'completed_count'

            ],


        'monthly_incomplete_count':
            monthly_stats[

                'incomplete_count'

            ],


        'monthly_completion_rate':
            monthly_stats[

                'completion_rate'

            ],


        'monthly_tag_stats':
            monthly_stats[

                'tag_stats'

            ],


        'monthly_priority_stats':
            monthly_stats[

                'priority_stats'

            ]

    })


@login_required(login_url='/login/')
@require_POST
def todo_delete(request, todo_id): #Todo 삭제

    todo = get_object_or_404(

        Todo,

        pk=todo_id,

        user=request.user

    )


    todo.delete()

    return JsonResponse({
        'success': True,
        'status': 'success',
        'message': '할 일이 삭제되었습니다.',
        'todo_id': todo_id,
    })


@login_required(login_url='/login/')
@require_POST
def todo_edit(request, todo_id): # Todo 수정

    todo = get_object_or_404(
        Todo,
        pk=todo_id,
        user=request.user
    )

    title = request.POST.get(
        'title',
        ''
    ).strip()

    tag_id = request.POST.get(
        'tag'
    )

    priority = request.POST.get(
        'priority',
        'M'
    )

    schedule_type = request.POST.get(
        'schedule_type',
        'single'
    )

    due_date_string = request.POST.get(
        'due_date'
    )

    end_date_string = request.POST.get(
        'end_date'
    )


    # ============================================================
    # 기본 검증
    # ============================================================

    if not title:

        return JsonResponse(
            {
                'success': False,
                'status': 'error',
                'message': '할 일을 입력해주세요.'
            },
            status=400
        )


    # ============================================================
    # 우선순위 검증
    # ============================================================

    if priority not in [
        'H',
        'M',
        'L'
    ]:

        priority = 'M'


    # ============================================================
    # 태그 처리
    # ============================================================

    if tag_id:

        tag = get_object_or_404(
            Tag,
            id=tag_id,
            user=request.user
        )

    else:

        tag = Get_User_Default_Tag(
            request.user
        )


    # ============================================================
    # 시작일 검증
    # ============================================================

    if not due_date_string:

        return JsonResponse(
            {
                'success': False,
                'status': 'error',
                'message': '시작 날짜가 필요합니다.'
            },
            status=400
        )


    # ============================================================
    # 날짜 변환
    # 문자열 상태로 비교하지 않고 Date 객체로 처리
    # ============================================================

    try:

        new_due_date = datetime.strptime(
            due_date_string,
            '%Y-%m-%d'
        ).date()

    except ValueError:

        return JsonResponse(
            {
                'success': False,
                'status': 'error',
                'message': '시작 날짜 형식이 올바르지 않습니다.'
            },
            status=400
        )


    new_end_date = None


    if schedule_type == 'range':

        if not end_date_string:

            return JsonResponse(
                {
                    'success': False,
                    'status': 'error',
                    'message': '종료 날짜를 입력해주세요.'
                },
                status=400
            )


        try:

            new_end_date = datetime.strptime(
                end_date_string,
                '%Y-%m-%d'
            ).date()

        except ValueError:

            return JsonResponse(
                {
                    'success': False,
                    'status': 'error',
                    'message': '종료 날짜 형식이 올바르지 않습니다.'
                },
                status=400
            )


        if new_end_date < new_due_date:

            return JsonResponse(
                {
                    'success': False,
                    'status': 'error',
                    'message': '종료 날짜는 시작 날짜 이후여야 합니다.'
                },
                status=400
            )


    # ============================================================
    # 기존 일정 형태
    # ============================================================

    before_period = (
        todo.end_date is not None
    )


    after_period = (
        new_end_date is not None
    )


    # ============================================================
    # 기간 → 일반 Todo
    #
    # 기존 기간 완료 기록은 더 이상 의미가 없으므로 삭제
    # ============================================================

    if (
        before_period
        and
        not after_period
    ):

        TodoCompletion.objects.filter(
            todo=todo,
            user=request.user
        ).delete()


    # ============================================================
    # 일반 Todo → 기간 Todo
    #
    # 기존 Todo.is_completed 값은 기간 완료 기록으로
    # 자동 변환하지 않음.
    #
    # 기간 Todo의 완료 상태는 TodoCompletion으로 관리.
    # ============================================================

    if (
        not before_period
        and
        after_period
    ):

        todo.is_completed = False


    # ============================================================
    # 기간 Todo → 기간 Todo
    #
    # 핵심:
    #
    # 기존 완료 기록을 전부 삭제하지 않는다.
    #
    # 새 기간에 포함되는 기록:
    #     유지
    #
    # 새 기간 밖으로 밀려난 기록:
    #     삭제
    #
    # 예:
    #
    # 기존 26~28
    # 26 ✓
    # 27 ✓
    #
    # 수정 26~29
    #
    # 26 ✓
    # 27 ✓
    # 28 -
    # 29 -
    #
    # 기존 완료 기록이 그대로 유지된다.
    # ============================================================

    if (
        before_period
        and
        after_period
    ):

        TodoCompletion.objects.filter(
            todo=todo,
            user=request.user
        ).exclude(
            completed_date__range=[
                new_due_date,
                new_end_date
            ]
        ).delete()


    # ============================================================
    # Todo 기본 정보 저장
    # ============================================================

    todo.title = title

    todo.tag = tag

    todo.priority = priority

    todo.due_date = new_due_date

    todo.end_date = new_end_date


    todo.save()


    # ============================================================
    # 수정 결과 반환
    # ============================================================

    return JsonResponse(
        {
            'success': True,
            'status': 'success',
            'message': '할 일이 수정되었습니다.',
            'todo': Get_Todo_Data(todo)
        }
    )


@login_required(login_url='/login/')
def mobile_stats(request): #통계

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

        'user_tags':
            Get_User_Tags(
                request.user
            ),

        **monthly_stats,

    }


    return render(

        request,

        'todos/mobile_stats.html',

        context

    )


def Is_Todo_Completed_For_Period(todo, period_start, period_end): #통계 처리
    # 일반 Todo
    if todo.end_date is None:
        return todo.is_completed

    # 해당 통계 기간과 실제 Todo 기간의 교집합
    todo_start = max(
        todo.due_date,
        period_start
    )

    todo_end = min(
        todo.end_date,
        period_end
    )

    # 겹치는 기간이 없으면 미완료
    if todo_start > todo_end:
        return False

    required_days = (
        todo_end - todo_start
    ).days + 1

    completed_days = sum(
        1
        for completion in todo.completions.all()
        if (
            todo_start
            <= completion.completed_date
            <= todo_end
        )
    )

    return completed_days >= required_days

def Get_Monthly_Stats(user, year, month): #월간 통계
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

    # ==========================
    # 월간 Todo 조회
    # ==========================

    monthly_todos = list(
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
        .select_related(
            'tag'
        )
        .prefetch_related(
            'completions'
        )
        .order_by(
            'created_at'
        )
    )

    # ==========================
    # Todo 완료 상태 계산
    # ==========================

    for todo in monthly_todos:

        todo.period_completed = (
            Is_Todo_Completed_For_Period(
                todo,
                month_start,
                month_end
            )
        )

    # ==========================
    # 기본 통계
    # ==========================

    total_count = len(
        monthly_todos
    )

    completed_count = sum(
        1
        for todo in monthly_todos
        if todo.period_completed
    )

    incomplete_count = (
        total_count
        - completed_count
    )

    completion_rate = (
        round(
            completed_count
            / total_count
            * 100
        )
        if total_count
        else 0
    )

    # ==========================
    # 태그 통계
    # ==========================

    tag_result = {}

    for todo in monthly_todos:

        tag = todo.tag

        if tag.id not in tag_result:

            tag_result[tag.id] = {
                'id':
                    tag.id,

                'name':
                    tag.name,

                'color':
                    tag.color,

                'total':
                    0,

                'completed':
                    0
            }

        tag_result[tag.id]['total'] += 1

        if todo.period_completed:

            tag_result[tag.id]['completed'] += 1

    tag_stats = []

    for item in tag_result.values():

        item['rate'] = (
            round(
                item['completed']
                / item['total']
                * 100
            )
            if item['total']
            else 0
        )

        tag_stats.append(
            item
        )

    # ==========================
    # 우선순위 통계
    # ==========================

    priority_map = {
        'H': '높음',
        'M': '보통',
        'L': '낮음'
    }

    priority_stats = []

    for code, name in priority_map.items():

        priority_todos = [
            todo
            for todo in monthly_todos
            if todo.priority == code
        ]

        priority_total = len(
            priority_todos
        )

        priority_completed = sum(
            1
            for todo in priority_todos
            if todo.period_completed
        )

        priority_stats.append({
            'code':
                code,

            'name':
                name,

            'total':
                priority_total,

            'completed':
                priority_completed,

            'rate':
                (
                    round(
                        priority_completed
                        / priority_total
                        * 100
                    )
                    if priority_total
                    else 0
                )
        })

    # ==========================
    # 결과
    # ==========================

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
            priority_stats
    }


@login_required(login_url='/login/')
def home(request): #Mobile Home

    today = date.today()


    # 오늘 Todo

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

        .select_related(

            'tag'

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


    # 기간 Todo 완료 ID

    completed_period_ids = set(

        TodoCompletion.objects

        .filter(

            todo__user=request.user,

            completed_date=today

        )

        .values_list(

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


    # 언젠가 할 일

    someday_todos = (

        TodoSomeday.objects

        .filter(

            user=request.user

        )

        .select_related(

            'tag'

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


    # Context

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


        'user_tags':
            Get_User_Tags(
                request.user
            ),


        'selected_tag':
            '',

        'selected_date':
            today.strftime(
                '%Y-%m-%d'
            ),

        'selected_date_obj':
            datetime.combine(

                today,

                datetime.min.time()

            ),

        'today_str':
            today.strftime(

                '%Y-%m-%d'

            ),

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


@login_required(login_url='/login/')
def todo_someday_list(request): #언젠가 할 일 목록

    someday_todos = (

        TodoSomeday.objects

        .filter(

            user=request.user

        )

        .select_related(

            'tag'

        )

        .order_by(

            'is_completed',

            'priority',

            'created_at'

        )

    )


    context = {

        'someday_todos':
            someday_todos,

        'user_tags':
            Get_User_Tags(
                request.user
            ),

    }


    return render(

        request,

        'todos/someday.html',

        context

    )


@login_required(login_url='/login/')
@require_POST
def todo_someday_create(request): #언젠가 할 일 생성


    title = request.POST.get(

        'title',

        ''

    ).strip()


    tag_id = request.POST.get(

        'tag'

    )


    priority = request.POST.get(

        'priority',

        'M'

    )



    if not title:


        return JsonResponse({

            'success':
                False,

            'status':
                'error',

            'message':
                '할 일을 입력해주세요.'

        }, status=400)



    if priority not in [

        'H',

        'M',

        'L'

    ]:

        priority = 'M'



    # 태그 처리

    if tag_id:


        tag = get_object_or_404(

            Tag,

            id=tag_id,

            user=request.user

        )


    else:


        tag = Get_User_Default_Tag(

            request.user

        )



    todo_someday = TodoSomeday.objects.create(

        user=request.user,

        title=title,

        tag=tag,

        priority=priority

    )



    return JsonResponse({

        'success':
            True,

        'status':
            'success',

        'message':
            '언젠가 할 일이 생성되었습니다.',

        'todo_someday':
            Get_Todo_Someday_Data(

                todo_someday

            ),

        **Get_Todo_Someday_Counts(

            request.user

        )

    })


@login_required(login_url='/login/')
@require_POST
def todo_someday_toggle(request, someday_id): #언젠가 할 일 완료 / 미완료


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



    counts = Get_Todo_Someday_Counts(

        request.user

    )



    return JsonResponse({

        'success':
            True,

        'status':
            'success',

        'is_completed':
            todo_someday.is_completed,

        **counts

    })


@login_required(login_url='/login/')
@require_POST
def todo_someday_delete(request, someday_id): #언젠가 할 일 삭제


    someday_todo = get_object_or_404(

        TodoSomeday,

        pk=someday_id,

        user=request.user

    )


    someday_todo.delete()



    return JsonResponse({

        'success':
            True,

        'status':
            'success',

        'message':
            '언젠가 할 일이 삭제되었습니다.',

        'someday_id':
            someday_id,

        **Get_Todo_Someday_Counts(

            request.user

        )

    })


@login_required(login_url='/login/')
@require_POST
def todo_someday_edit(request, someday_id): #언젠가 할 일 수정


    someday_todo = get_object_or_404(

        TodoSomeday,

        pk=someday_id,

        user=request.user

    )



    title = request.POST.get(

        'title',

        ''

    ).strip()


    tag_id = request.POST.get(

        'tag'

    )


    priority = request.POST.get(

        'priority',

        'M'

    )



    if not title:


        return JsonResponse({

            'success':
                False,

            'status':
                'error',

            'message':
                '할 일을 입력해주세요.'

        }, status=400)



    if priority not in [

        'H',

        'M',

        'L'

    ]:

        priority = 'M'



    if tag_id:


        tag = get_object_or_404(

            Tag,

            id=tag_id,

            user=request.user

        )


    else:


        tag = Get_User_Default_Tag(

            request.user

        )



    someday_todo.title = title

    someday_todo.tag = tag

    someday_todo.priority = priority


    someday_todo.save(

        update_fields=[

            'title',

            'tag',

            'priority'

        ]

    )



    return JsonResponse({

        'success':
            True,

        'status':
            'success',

        'message':
            '언젠가 할 일이 수정되었습니다.',

        'todo_someday':
            Get_Todo_Someday_Data(

                someday_todo

            ),

        **Get_Todo_Someday_Counts(

            request.user

        )

    })

