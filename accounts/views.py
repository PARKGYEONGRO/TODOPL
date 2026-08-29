# accounts/views.py
import os, requests

from google_auth_oauthlib.flow import Flow

from google.auth.transport import requests as GoogleRequests

from google.oauth2 import id_token


from django.http import (
    JsonResponse
)

from django.contrib.auth import (
    get_user_model,
    login,
    logout
)

from django.shortcuts import redirect

from django.views.decorators.http import (
    require_POST
)

from django.conf import settings

from accounts.models import (
    UserProfile,
    SocialAccount
)

from supabase import create_client

from .services import (
    Create_User_Initial_Data,
    Delete_User_Account
)


@require_POST
def supabase_login(request):  # Supabase 로그인

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

        # 최초 사용자 데이터 및 Supabase 계정 연결
        Create_User_Initial_Data(
            User=DjangoUser,

            Provider='supabase',

            Provider_User_Id=SupabaseUser.id
        )

        # Django 로그인 세션
        login(
            request,
            DjangoUser
        )

        # 기존 세션 호환 유지
        request.session[
            'supabase_user_id'
        ] = SupabaseUser.id

        print(
            '로그인 성공:',
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


GOOGLE_SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

def google_login(request):
    FlowObject = Flow.from_client_config(
        {
            'web': {
                'client_id':
                    settings.GOOGLE_CLIENT_ID,

                'client_secret':
                    settings.GOOGLE_CLIENT_SECRET,

                'auth_uri':
                    'https://accounts.google.com/o/oauth2/auth',

                'token_uri':
                    'https://oauth2.googleapis.com/token',

                'redirect_uris': [
                    settings.GOOGLE_REDIRECT_URI
                ]
            }
        },
        scopes=GOOGLE_SCOPES
    )

    FlowObject.redirect_uri = (
        settings.GOOGLE_REDIRECT_URI
    )

    AuthorizationUrl, State = (
        FlowObject.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='select_account'
        )
    )

    request.session[
        'google_oauth_state'
    ] = State

    request.session[
        'google_code_verifier'
    ] = FlowObject.code_verifier

    return redirect(
        AuthorizationUrl
    )


def google_login_callback(request):
    # Google 인증 결과 확인

    Code = request.GET.get(
        'code'
    )

    if not Code:
        return JsonResponse(
            {
                'success':
                    False,
                'message':
                    'Google 인증에 실패하였습니다.'
            },
            status=400
        )

    try:
        CodeVerifier = request.session.get(
            'google_code_verifier'
        )

        if not CodeVerifier:
            return JsonResponse(
                {
                    'success':
                        False,
                    'message':
                        'Google 인증 정보가 만료되었습니다. 다시 로그인해주세요.'
                },
                status=400
            )

        FlowObject = Flow.from_client_config(
            {
                'web': {
                    'client_id':
                        settings.GOOGLE_CLIENT_ID,

                    'client_secret':
                        settings.GOOGLE_CLIENT_SECRET,

                    'auth_uri':
                        'https://accounts.google.com/o/oauth2/auth',

                    'token_uri':
                        'https://oauth2.googleapis.com/token',

                    'redirect_uris': [
                        settings.GOOGLE_REDIRECT_URI
                    ]
                }
            },
            scopes=GOOGLE_SCOPES
        )

        FlowObject.redirect_uri = (
            settings.GOOGLE_REDIRECT_URI
        )

        FlowObject.code_verifier = (
            CodeVerifier
        )

        FlowObject.fetch_token(
            code=Code
        )

        GoogleIdInfo = id_token.verify_oauth2_token(
            FlowObject.credentials.id_token,
            GoogleRequests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        GoogleUserId = GoogleIdInfo.get(
            'sub'
        )

        GoogleEmail = (
            GoogleIdInfo.get(
                'email'
            )
            or
            ''
        ).strip().lower()

        GoogleName = (
            GoogleIdInfo.get(
                'name'
            )
            or
            ''
        ).strip()

        if not GoogleUserId:
            return JsonResponse(
                {
                    'success':
                        False,
                    'message':
                        'Google 사용자 정보를 확인할 수 없습니다.'
                },
                status=400
            )

        if not GoogleEmail:
            return JsonResponse(
                {
                    'success':
                        False,
                    'message':
                        'Google 이메일 정보를 확인할 수 없습니다.'
                },
                status=400
            )

        # 사용한 OAuth verifier 삭제
        request.session.pop(
            'google_code_verifier',
            None
        )

        # 기존 Google 소셜 계정 확인
        SocialAccountObject = (
            SocialAccount.objects
            .filter(
                provider='google',
                provider_user_id=GoogleUserId
            )
            .select_related(
                'user'
            )
            .first()
        )

        if SocialAccountObject:

            login(
                request,
                SocialAccountObject.user
            )

            return JsonResponse(
                {
                    'success':
                        True,
                    'message':
                        'Google 로그인되었습니다.'
                }
            )

        # 기존 이메일 계정 확인
        User = get_user_model()

        DjangoUser = (
            User.objects
            .filter(
                email__iexact=GoogleEmail
            )
            .first()
        )

        if DjangoUser:

            return JsonResponse(
                {
                    'success':
                        False,
                    'message':
                        '이미 동일한 이메일로 가입된 계정이 있습니다. 기존 계정에서 Google 계정을 연동해주세요.'
                },
                status=409
            )

        # 신규 Google 사용자 생성
        DjangoUser = User.objects.create_user(
            username=GoogleEmail,
            email=GoogleEmail
        )

        # UserProfile 생성
        Create_User_Initial_Data(
            User=DjangoUser,

            Nickname=GoogleName or '사용자',

            Provider='google',

            Provider_User_Id=GoogleUserId
        )

        # Django 로그인
        login(
            request,
            DjangoUser
        )

        return JsonResponse(
            {
                'success':
                    True,
                'message':
                    'Google 회원가입 및 로그인이 완료되었습니다.'
            }
        )

    except Exception as Error:

        import traceback

        print(
            'Google 로그인 오류:',
            Error
        )

        traceback.print_exc()

        return JsonResponse(
            {
                'success':
                    False,
                'message':
                    str(Error)
            },
            status=500
        )


@require_POST
def account_delete(request):  # 회원 탈퇴

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


    try:

        # 실제 회원 탈퇴 처리

        Delete_User_Account(
            User=request.user,
            Withdrawal_Reason=withdrawal_reason,
            Withdrawal_Detail=withdrawal_detail
        )


        # Django 세션 로그아웃

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

