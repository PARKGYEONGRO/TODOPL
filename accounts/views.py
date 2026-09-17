# accounts/views.py
import os
import json
import uuid
import mimetypes
import requests

from PIL import Image

from google_auth_oauthlib.flow import Flow

from google.auth.transport import requests as GoogleRequests

from google.oauth2 import id_token

from django.contrib.auth.decorators import login_required

from django.db import (
    models,
    transaction  
) 

from django.utils import timezone

from django.http import (
    JsonResponse,
)

from django.contrib.auth import (
    get_user_model,
    login,
    logout
)

from django.shortcuts import (
    redirect,
    render
)

from django.views.decorators.http import (
    require_GET,
    require_POST
)

from django.conf import settings

from accounts.models import (
    UserProfile,
    SocialAccount,
    FriendRequest,
    Friendship
)

from supabase import (
    create_client,
    Client
)


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

NAVER_AUTH_URL = (
    'https://nid.naver.com/oauth2.0/authorize'
)

NAVER_TOKEN_URL = (
    'https://nid.naver.com/oauth2.0/token'
)

NAVER_PROFILE_URL = (
    'https://openapi.naver.com/v1/nid/me'
)

def naver_login(request):

    # =========================
    # 네이버 OAuth 로그인 시작
    # =========================

    State = uuid.uuid4().hex

    request.session[
        'naver_oauth_state'
    ] = State

    AuthorizationUrl = (
        NAVER_AUTH_URL
        +
        '?response_type=code'
        +
        '&client_id='
        +
        settings.NAVER_CLIENT_ID
        +
        '&redirect_uri='
        +
        requests.utils.quote(
            settings.NAVER_REDIRECT_URI
        )
        +
        '&state='
        +
        State
    )

    print(
        '네이버 로그인 시작'
    )

    return redirect(
        AuthorizationUrl
    )

def naver_login_callback(request):

    print('==============================')

    print(
        '네이버 Callback 진입'
    )

    print('==============================')


    # =========================
    # 네이버 인증 결과 확인
    # =========================

    Code = request.GET.get(
        'code'
    )

    State = request.GET.get(
        'state'
    )

    Error = request.GET.get(
        'error'
    )

    ErrorDescription = request.GET.get(
        'error_description'
    )


    print(
        'Code:',
        Code
    )

    print(
        'State:',
        State
    )

    print(
        'Error:',
        Error
    )

    print(
        'Error Description:',
        ErrorDescription
    )


    if Error:

        print(
            '네이버 로그인 취소 또는 오류:',
            Error,
            ErrorDescription
        )

        return JsonResponse(
            {
                'success':
                    False,

                'message':
                    '네이버 로그인이 취소되었습니다.'
            },

            status=400
        )


    if not Code:

        print(
            '네이버 인증 Code 없음'
        )

        return JsonResponse(
            {
                'success':
                    False,

                'message':
                    '네이버 인증에 실패하였습니다.'
            },

            status=400
        )


    try:

        # =========================
        # State 확인
        # =========================

        print(
            '네이버 Callback State 확인 시작'
        )


        SessionState = request.session.get(
            'naver_oauth_state'
        )


        print(
            'Session State:',
            SessionState
        )


        print(
            'Request State:',
            State
        )


        if not SessionState:

            print(
                '네이버 OAuth State 없음'
            )

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '네이버 인증 정보가 만료되었습니다.'
                },

                status=400
            )


        if State != SessionState:

            print(
                '네이버 OAuth State 불일치'
            )

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '네이버 인증 정보가 올바르지 않습니다.'
                },

                status=400
            )


        print(
            '네이버 OAuth State 검증 성공'
        )


        # =========================
        # Access Token 발급
        # =========================

        print(
            '네이버 Access Token 발급 시작'
        )


        TokenResponse = requests.get(

            NAVER_TOKEN_URL,

            params={
                'grant_type':
                    'authorization_code',

                'client_id':
                    settings.NAVER_CLIENT_ID,

                'client_secret':
                    settings.NAVER_CLIENT_SECRET,

                'code':
                    Code,

                'state':
                    State,
            },

            timeout=10
        )


        print(
            '네이버 Token Response:',
            TokenResponse.status_code
        )


        TokenData = TokenResponse.json()


        print(
            '네이버 Token 응답 확인'
        )


        AccessToken = TokenData.get(
            'access_token'
        )


        if not AccessToken:

            print(
                '네이버 Access Token 발급 실패:',
                TokenData
            )

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '네이버 로그인 인증 토큰을 발급받지 못했습니다.'
                },

                status=400
            )


        print(
            '네이버 Access Token 발급 성공'
        )


        # =========================
        # 네이버 사용자 정보 요청
        # =========================

        print(
            '네이버 사용자 정보 요청 시작'
        )


        ProfileResponse = requests.get(

            NAVER_PROFILE_URL,

            headers={
                'Authorization':
                    f'Bearer {AccessToken}'
            },

            timeout=10
        )


        print(
            '네이버 Profile Response:',
            ProfileResponse.status_code
        )


        ProfileData = ProfileResponse.json()


        print(
            '네이버 사용자 정보 응답 확인'
        )


        if ProfileResponse.status_code != 200:

            print(
                '네이버 사용자 정보 조회 실패:',
                ProfileData
            )

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '네이버 사용자 정보를 가져오지 못했습니다.'
                },

                status=400
            )


        # =========================
        # 네이버 사용자 정보 추출
        # =========================

        NaverResponse = ProfileData.get(
            'response'
        )


        if not NaverResponse:

            print(
                '네이버 사용자 response 없음:',
                ProfileData
            )

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '네이버 사용자 정보가 올바르지 않습니다.'
                },

                status=400
            )


        NaverUserId = NaverResponse.get(
            'id'
        )


        NaverEmail = NaverResponse.get(
            'email'
        )


        NaverName = NaverResponse.get(
            'name'
        )


        print(
            '네이버 사용자 정보 확인 성공'
        )


        print(
            '네이버 사용자 ID:',
            NaverUserId
        )


        print(
            '네이버 이메일:',
            NaverEmail
        )


        print(
            '네이버 이름:',
            NaverName
        )


        if not NaverUserId:

            print(
                '네이버 사용자 ID 없음'
            )

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '네이버 사용자 ID를 가져오지 못했습니다.'
                },

                status=400
            )


        if not NaverEmail:

            print(
                '네이버 이메일 없음'
            )

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '네이버 이메일 정보를 가져오지 못했습니다.'
                },

                status=400
            )


        # =========================
        # OAuth State 삭제
        # =========================

        request.session.pop(
            'naver_oauth_state',
            None
        )


        # =========================
        # Django User Model 확인
        # =========================

        User = get_user_model()


        # =========================
        # 기존 네이버 계정 확인
        # =========================

        print(
            '기존 네이버 계정 확인 시작'
        )


        NaverSocialAccount = SocialAccount.objects.filter(

            provider='naver',

            provider_user_id=NaverUserId

        ).select_related(
            'user'
        ).first()


        if NaverSocialAccount:

            print(
                '기존 네이버 계정 확인 성공'
            )


            DjangoUser = NaverSocialAccount.user


            login(
                request,
                DjangoUser
            )


            print(
                '네이버 로그인 성공'
            )


            return redirect(
                '/'
            )


        # =========================
        # 기존 Django 계정 확인
        # =========================

        print(
            '기존 이메일 계정 확인 시작'
        )


        DjangoUser = User.objects.filter(
            email=NaverEmail
        ).first()


        if DjangoUser:

            print(
                '기존 Django 계정 발견'
            )


            # =========================
            # 기존 계정에 네이버 계정 연결
            # =========================

            NaverSocialAccount = SocialAccount.objects.create(

                user=DjangoUser,

                provider='naver',

                provider_user_id=NaverUserId

            )


            print(
                '기존 계정에 네이버 계정 연결 성공'
            )


            login(
                request,
                DjangoUser
            )


            print(
                '네이버 기존 계정 로그인 성공'
            )


            return redirect(
                '/'
            )


        # =========================
        # 신규 Django User 생성
        # =========================

        print(
            '네이버 신규 사용자 생성 시작'
        )


        DjangoUser = User.objects.create_user(

            username=NaverEmail,

            email=NaverEmail

        )


        print(
            '네이버 Django User 생성 성공'
        )


        # =========================
        # 초기 사용자 데이터 생성
        # =========================

        Create_User_Initial_Data(

            User=DjangoUser,

            Nickname=NaverName or '사용자',

            Provider='naver',

            Provider_User_Id=NaverUserId

        )


        print(
            '네이버 초기 사용자 데이터 생성 성공'
        )


        # =========================
        # Django 로그인
        # =========================

        login(
            request,
            DjangoUser
        )


        print(
            '네이버 회원가입 및 로그인 성공'
        )


        # =========================
        # 메인 화면 이동
        # =========================

        return redirect(
            '/'
        )


    except requests.RequestException as Error:

        import traceback


        print(
            '네이버 요청 오류:',
            Error
        )


        traceback.print_exc()


        return JsonResponse(
            {
                'success':
                    False,

                'message':
                    '네이버 서버와 통신하는 중 오류가 발생했습니다.'
            },

            status=500
        )


    except Exception as Error:

        import traceback


        print(
            '네이버 로그인 오류:',
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
            settings.GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
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

            print('구글 로그인 성공')
            
            return redirect(
                '/'
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

        print('구글 로그인 성공')

        return redirect(
            '/'
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


@login_required
@require_POST
def profile_update(request):

    try:

        # ============================================================
        # 기본 정보
        # ============================================================

        Nickname = request.POST.get(
            'nickname',
            ''
        ).strip()

        Bio = request.POST.get(
            'bio',
            ''
        ).strip()

        ImageFile = request.FILES.get(
            'profile_image'
        )


        # ============================================================
        # 닉네임 검사
        # ============================================================

        if not Nickname:

            return JsonResponse(
                {
                    'success': False,
                    'message': '닉네임을 입력해주세요.'
                },
                status=400
            )


        if len(Nickname) > 30:

            return JsonResponse(
                {
                    'success': False,
                    'message': '닉네임은 30자 이하로 입력해주세요.'
                },
                status=400
            )


        # ============================================================
        # 한 줄 소개 검사
        # ============================================================

        if len(Bio) > 100:

            return JsonResponse(
                {
                    'success': False,
                    'message': '한 줄 소개는 100자 이하로 입력해주세요.'
                },
                status=400
            )


        # ============================================================
        # Profile 가져오기
        # ============================================================

        Profile = request.user.profile


        # ============================================================
        # 이미지 변수
        # ============================================================

        Supabase = None

        NewImagePath = None

        OldImagePath = (
            Profile.profile_image_path
            or
            ''
        )


        SupabaseUrl = os.getenv(
            'SUPABASE_URL'
        )

        SupabaseServiceRoleKey = os.getenv(
            'SUPABASE_SERVICE_ROLE_KEY'
        )

        ProfileBucket = os.getenv(
            'SUPABASE_PROFILE_BUCKET'
        )


        # ============================================================
        # 이미지가 선택된 경우
        # ============================================================

        if ImageFile:

            # --------------------------------------------------------
            # 허용 MIME 타입
            # --------------------------------------------------------

            AllowedContentTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ]


            if (
                ImageFile.content_type
                not in AllowedContentTypes
            ):

                return JsonResponse(
                    {
                        'success': False,
                        'message': (
                            'JPG, PNG, WEBP 이미지 파일만 '
                            '업로드할 수 있습니다.'
                        )
                    },
                    status=400
                )


            # --------------------------------------------------------
            # 파일 크기
            # --------------------------------------------------------

            MaxFileSize = (
                5
                * 1024
                * 1024
            )


            if ImageFile.size > MaxFileSize:

                return JsonResponse(
                    {
                        'success': False,
                        'message': (
                            '프로필 이미지는 '
                            '5MB 이하만 업로드할 수 있습니다.'
                        )
                    },
                    status=400
                )


            # --------------------------------------------------------
            # 실제 이미지 파일인지 확인
            # --------------------------------------------------------

            try:

                ImageFile.seek(0)

                ImageObject = Image.open(
                    ImageFile
                )

                ImageObject.verify()

                ImageFile.seek(0)

            except Exception:

                return JsonResponse(
                    {
                        'success': False,
                        'message': (
                            '정상적인 이미지 파일이 아닙니다.'
                        )
                    },
                    status=400
                )


            # --------------------------------------------------------
            # Supabase 설정
            # --------------------------------------------------------

            SupabaseUrl = os.getenv(
                'SUPABASE_URL'
            )

            SupabaseServiceRoleKey = os.getenv(
                'SUPABASE_SERVICE_ROLE_KEY'
            )

            ProfileBucket = os.getenv(
                'SUPABASE_PROFILE_BUCKET'
            )


            if not SupabaseUrl:

                raise Exception(
                    'SUPABASE_URL 설정이 없습니다.'
                )


            if not SupabaseServiceRoleKey:

                raise Exception(
                    'SUPABASE_SERVICE_ROLE_KEY 설정이 없습니다.'
                )


            if not ProfileBucket:

                raise Exception(
                    'SUPABASE_PROFILE_BUCKET 설정이 없습니다.'
                )


            # --------------------------------------------------------
            # Service Role Client
            # --------------------------------------------------------

            Supabase = create_client(
                SupabaseUrl,
                SupabaseServiceRoleKey
            )


            # --------------------------------------------------------
            # 확장자
            # --------------------------------------------------------

            Extension = mimetypes.guess_extension(
                ImageFile.content_type
            )


            if not Extension:

                return JsonResponse(
                    {
                        'success': False,
                        'message': (
                            '이미지 형식을 확인할 수 없습니다.'
                        )
                    },
                    status=400
                )


            # --------------------------------------------------------
            # 새로운 파일 경로
            #
            # profiles/
            #     사용자ID/
            #         UUID.jpg
            # --------------------------------------------------------

            FileName = (
                f'{uuid.uuid4().hex}'
                f'{Extension}'
            )


            NewImagePath = (
                f'profiles/'
                f'{request.user.id}/'
                f'{FileName}'
            )


            # --------------------------------------------------------
            # 이미지 데이터
            # --------------------------------------------------------

            ImageFile.seek(0)

            ImageData = ImageFile.read()


            # --------------------------------------------------------
            # Supabase Private Bucket 업로드
            # --------------------------------------------------------

            Supabase.storage.from_(
                ProfileBucket
            ).upload(
                NewImagePath,
                ImageData,
                {
                    'content-type':
                        ImageFile.content_type
                }
            )


        # ============================================================
        # DB 저장
        # ============================================================

        Profile.nickname = Nickname

        Profile.bio = Bio


        if NewImagePath:

            Profile.profile_image_path = (
                NewImagePath
            )


        Profile.save(
            update_fields=[
                'nickname',
                'bio',
                'profile_image_path'
            ]
        )


        # ============================================================
        # 기존 이미지 삭제
        #
        # DB 저장이 성공한 이후에 삭제한다.
        # ============================================================

        if (
            NewImagePath
            and
            OldImagePath
            and
            Supabase
        ):

            try:

                Supabase.storage.from_(
                    ProfileBucket
                ).remove(
                    [
                        OldImagePath
                    ]
                )

            except Exception as Error:

                print(
                    '기존 프로필 이미지 삭제 오류:',
                    Error
                )


        # ============================================================
        # 현재 사용자용 Signed URL 생성
        #
        # 5분 동안만 유효
        # ============================================================

        ImageUrl = ''


        if Profile.profile_image_path:

            if not SupabaseUrl:

                raise Exception(
                    'SUPABASE_URL 설정이 없습니다.'
                )


            if not SupabaseServiceRoleKey:

                raise Exception(
                    'SUPABASE_SERVICE_ROLE_KEY 설정이 없습니다.'
                )


            if not ProfileBucket:

                raise Exception(
                    'SUPABASE_PROFILE_BUCKET 설정이 없습니다.'
                )


            if not Supabase:

                Supabase = create_client(
                    SupabaseUrl,
                    SupabaseServiceRoleKey
                )


            SignedUrlResponse = (
                Supabase
                .storage
                .from_(
                    ProfileBucket
                )
                .create_signed_url(
                    Profile.profile_image_path,
                    300
                )
            )


            if isinstance(
                SignedUrlResponse,
                dict
            ):

                ImageUrl = (
                    SignedUrlResponse.get(
                        'signedURL'
                    )
                    or
                    SignedUrlResponse.get(
                        'signedUrl'
                    )
                    or
                    ''
                )


            else:

                ImageUrl = getattr(
                    SignedUrlResponse,
                    'signed_url',
                    ''
                )

        # ============================================================
        # 성공 응답
        # ============================================================

        return JsonResponse(
            {
                'success': True,

                'message':
                    '프로필이 저장되었습니다.',

                'nickname':
                    Profile.nickname,

                'nickname_tag':
                    Profile.nickname_tag,

                'bio':
                    Profile.bio or '',

                'image_path':
                    Profile.profile_image_path or '',

                'image_url':
                    ImageUrl
            }
        )


    except Exception as Error:

        print(
            '프로필 저장 오류:',
            Error
        )


        # ============================================================
        # 새 이미지가 업로드됐지만 DB 저장 등이 실패한 경우
        #
        # 새 파일이 Storage에 고아 파일로 남지 않도록 삭제 시도
        # ============================================================

        if (
            NewImagePath
            and
            Supabase
            and
            ProfileBucket
        ):

            try:

                Supabase.storage.from_(
                    ProfileBucket
                ).remove(
                    [
                        NewImagePath
                    ]
                )

            except Exception as CleanupError:

                print(
                    '새 프로필 이미지 정리 오류:',
                    CleanupError
                )


        return JsonResponse(
            {
                'success': False,
                'message':
                    '프로필 저장 중 오류가 발생했습니다.'
            },
            status=500
        )


@login_required
@require_GET
def profile_image_url(request):

    try:

        # ============================================================
        # Profile 가져오기
        # ============================================================

        Profile = request.user.profile


        # ============================================================
        # 프로필 이미지가 없는 경우
        # ============================================================

        if not Profile.profile_image_path:

            return JsonResponse(
                {
                    'success': True,
                    'image_url': ''
                }
            )


        # ============================================================
        # Supabase 설정
        # ============================================================

        SupabaseUrl = os.getenv(
            'SUPABASE_URL'
        )

        SupabaseServiceRoleKey = os.getenv(
            'SUPABASE_SERVICE_ROLE_KEY'
        )

        ProfileBucket = os.getenv(
            'SUPABASE_PROFILE_BUCKET'
        )


        if not SupabaseUrl:

            raise Exception(
                'SUPABASE_URL 설정이 없습니다.'
            )


        if not SupabaseServiceRoleKey:

            raise Exception(
                'SUPABASE_SERVICE_ROLE_KEY 설정이 없습니다.'
            )


        if not ProfileBucket:

            raise Exception(
                'SUPABASE_PROFILE_BUCKET 설정이 없습니다.'
            )


        # ============================================================
        # Service Role Client
        # ============================================================

        Supabase = create_client(
            SupabaseUrl,
            SupabaseServiceRoleKey
        )


        # ============================================================
        # Signed URL 생성
        #
        # 5분 동안 유효
        # ============================================================

        SignedUrlResponse = (
            Supabase
            .storage
            .from_(
                ProfileBucket
            )
            .create_signed_url(
                Profile.profile_image_path,
                300
            )
        )


        ImageUrl = ''


        if isinstance(
            SignedUrlResponse,
            dict
        ):

            ImageUrl = (
                SignedUrlResponse.get(
                    'signedURL'
                )
                or
                SignedUrlResponse.get(
                    'signedUrl'
                )
                or
                ''
            )


        else:

            ImageUrl = getattr(
                SignedUrlResponse,
                'signed_url',
                ''
            )


        # ============================================================
        # 성공 응답
        # ============================================================

        return JsonResponse(
            {
                'success': True,

                'image_url':
                    ImageUrl
            }
        )


    except Exception as Error:

        print(
            '프로필 이미지 URL 생성 오류:',
            Error
        )


        return JsonResponse(
            {
                'success': False,

                'image_url': '',

                'message':
                    '프로필 이미지를 불러오는 중 오류가 발생했습니다.'
            },
            status=500
        )

@require_POST
def password_reset_send(request):

    try:

        Data = json.loads(
            request.body
        )


        Email = (
            Data.get(
                'email',
                ''
            )
            .strip()
            .lower()
        )


        if not Email:

            return JsonResponse(
                {
                    'success':
                        False,

                    'message':
                        '이메일을 입력해주세요.'
                },
                status=400
            )


        SupabaseUrl = os.getenv(
            'SUPABASE_URL'
        )


        SupabaseAnonKey = os.getenv(
            'SUPABASE_ANON_KEY'
        )


        if (
            not SupabaseUrl
            or
            not SupabaseAnonKey
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


        Supabase = create_client(
            SupabaseUrl,
            SupabaseAnonKey
        )


        RedirectUrl = (
            request.scheme
            + '://'
            + request.get_host()
            + '/password-reset/confirm/'
        )


        Supabase.auth.reset_password_for_email(
            Email,
            {
                'redirect_to':
                    RedirectUrl
            }
        )


        return JsonResponse(
            {
                'success':
                    True,

                'message':
                    (
                        '비밀번호 재설정 이메일을 보냈습니다.'
                    )
            }
        )


    except Exception as Error:

        print(
            '비밀번호 재설정 이메일 전송 오류:',
            Error
        )


        return JsonResponse(
            {
                'success':
                    False,

                'message':
                    (
                        '비밀번호 재설정 이메일 전송 중 '
                        '오류가 발생했습니다.'
                    )
            },
            status=500
        )


def password_reset_confirm(request):

    return render(
        request,
        'todos/partials/password_reset_confirm.html'
    )


@login_required
@require_GET
def friend_requests(request):

    SentFriendRequests = (
        FriendRequest.objects
        .filter(
            sender=request.user,
            status='PENDING'
        )
        .select_related(
            'receiver',
            'receiver__profile'
        )
        .order_by(
            '-created_at'
        )
    )


    ReceivedFriendRequests = (
        FriendRequest.objects
        .filter(
            receiver=request.user,
            status='PENDING'
        )
        .select_related(
            'sender',
            'sender__profile'
        )
        .order_by(
            '-created_at'
        )
    )


    SentList = []


    for FriendRequestObject in SentFriendRequests:

        FriendProfile = (
            FriendRequestObject
            .receiver
            .profile
        )


        SentList.append(
            {
                'request_id': (
                    FriendRequestObject.id
                ),

                'nickname': (
                    FriendProfile.nickname
                ),

                'nickname_tag': (
                    FriendProfile.nickname_tag
                ),

                'display_name': (
                    f'{FriendProfile.nickname}'
                    f'#{FriendProfile.nickname_tag}'
                ),

                'profile_image_path': (
                    Get_Profile_Image_Signed_Url(
                        FriendProfile
                    )
                ),

                'created_at': (
                    FriendRequestObject.created_at
                    .isoformat()
                )
            }
        )


    ReceivedList = []


    for FriendRequestObject in ReceivedFriendRequests:

        FriendProfile = (
            FriendRequestObject
            .sender
            .profile
        )


        ReceivedList.append(
            {
                'request_id': (
                    FriendRequestObject.id
                ),

                'nickname': (
                    FriendProfile.nickname
                ),

                'nickname_tag': (
                    FriendProfile.nickname_tag
                ),

                'display_name': (
                    f'{FriendProfile.nickname}'
                    f'#{FriendProfile.nickname_tag}'
                ),

                'profile_image_path': (
                    Get_Profile_Image_Signed_Url(
                        FriendProfile
                    )
                ),

                'created_at': (
                    FriendRequestObject.created_at
                    .isoformat()
                )
            }
        )


    return JsonResponse(
        {
            'success': True,

            'sent_requests': (
                SentList
            ),

            'received_requests': (
                ReceivedList
            )
        }
    )

@login_required
@require_POST
def friend_request_send(request):

    try:

        Data = json.loads(
            request.body
        )


    except json.JSONDecodeError:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '잘못된 요청입니다.'
                )
            },
            status=400
        )


    FriendUsername = (
        Data
        .get(
            'username',
            ''
        )
        .strip()
    )


    if (
        '#' not in FriendUsername
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '닉네임과 닉네임 태그를 '
                    '정확하게 입력해주세요.'
                )
            },
            status=400
        )


    Nickname, NicknameTag = (
        FriendUsername
        .rsplit(
            '#',
            1
        )
    )


    Nickname = (
        Nickname
        .strip()
    )


    NicknameTag = (
        NicknameTag
        .strip()
    )


    if (
        not Nickname
        or not NicknameTag
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '닉네임과 닉네임 태그를 '
                    '정확하게 입력해주세요.'
                )
            },
            status=400
        )


    try:

        ReceiverProfile = (
            UserProfile.objects
            .select_related(
                'user'
            )
            .get(
                nickname=Nickname,
                nickname_tag=NicknameTag
            )
        )


    except UserProfile.DoesNotExist:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '사용자를 찾을 수 없습니다.'
                )
            },
            status=404
        )


    Receiver = (
        ReceiverProfile.user
    )


    if (
        Receiver == request.user
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '자기 자신에게 '
                    '친구 요청을 보낼 수 없습니다.'
                )
            },
            status=400
        )


    AlreadyFriend = (
        Friendship.objects
        .filter(
            user=request.user,
            friend=Receiver
        )
        .exists()
    )


    if (
        AlreadyFriend
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '이미 친구입니다.'
                )
            },
            status=400
        )


    AlreadySent = (
        FriendRequest.objects
        .filter(
            sender=request.user,
            receiver=Receiver,
            status='PENDING'
        )
        .exists()
    )


    if (
        AlreadySent
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '이미 친구 요청을 보냈습니다.'
                )
            },
            status=400
        )


    AlreadyReceived = (
        FriendRequest.objects
        .filter(
            sender=Receiver,
            receiver=request.user,
            status='PENDING'
        )
        .exists()
    )


    if (
        AlreadyReceived
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '상대방이 이미 '
                    '친구 요청을 보냈습니다. '
                    '요청을 수락해주세요.'
                ),

                'already_received': True
            },
            status=400
        )


    FriendRequestObject = (
        FriendRequest.objects
        .create(
            sender=request.user,
            receiver=Receiver,
            status='PENDING'
        )
    )


    return JsonResponse(
        {
            'success': True,

            'message': (
                '친구 요청을 보냈습니다.'
            ),

            'friend_request': {
                'request_id': (
                    FriendRequestObject.id
                ),

                'nickname': (
                    ReceiverProfile.nickname
                ),

                'nickname_tag': (
                    ReceiverProfile.nickname_tag
                ),

                'display_name': (
                    f'{ReceiverProfile.nickname}'
                    f'#{ReceiverProfile.nickname_tag}'
                ),

                'profile_image_url': (
                    Get_Profile_Image_Signed_Url(
                        ReceiverProfile
                    )
                )
            }
        }
    )

@login_required
@require_POST
def friend_request_accept(request):

    try:

        Data = json.loads(
            request.body
        )


    except json.JSONDecodeError:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '잘못된 요청입니다.'
                )
            },
            status=400
        )


    RequestId = (
        Data
        .get(
            'request_id'
        )
    )


    if (
        not RequestId
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '친구 요청 정보가 없습니다.'
                )
            },
            status=400
        )


    try:

        with transaction.atomic():

            FriendRequestObject = (
                FriendRequest.objects
                .select_for_update()
                # .select_related(
                #     'sender',
                #     'sender__profile'
                # ) # 오류 FOR UPDATE cannot be applied to the nullable side of an outer join
                # nullalbe한 조합을 같이 사용할 시 오류 발생
                # 먼저 잠글 레코드만 가져오는 방식이 안전
                .get(
                    id=RequestId,
                    receiver=request.user,
                    status='PENDING'
                )
            )


            Sender = (
                FriendRequestObject.sender
            )


            FriendRequestObject.status = (
                'ACCEPTED'
            )


            FriendRequestObject.responded_at = (
                timezone.now()
            )


            FriendRequestObject.save(
                update_fields=[
                    'status',
                    'responded_at'
                ]
            )


            Friendship.objects.get_or_create(
                user=request.user,
                friend=Sender
            )


            Friendship.objects.get_or_create(
                user=Sender,
                friend=request.user
            )


    except FriendRequest.DoesNotExist:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '대기 중인 친구 요청을 '
                    '찾을 수 없습니다.'
                )
            },
            status=404
        )


    SenderProfile = (
        Sender.profile
    )


    return JsonResponse(
        {
            'success': True,

            'message': (
                '친구 요청을 수락했습니다.'
            ),

            'friend': {
                'nickname': (
                    SenderProfile.nickname
                ),

                'nickname_tag': (
                    SenderProfile.nickname_tag
                ),

                'display_name': (
                    f'{SenderProfile.nickname}'
                    f'#{SenderProfile.nickname_tag}'
                ),

                'profile_image_url': (
                    Get_Profile_Image_Signed_Url(
                        SenderProfile
                    )
                )
            }
        }
    )

@login_required
@require_POST
def friend_request_reject(request):

    try:

        Data = json.loads(
            request.body
        )


    except json.JSONDecodeError:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '잘못된 요청입니다.'
                )
            },
            status=400
        )


    RequestId = (
        Data
        .get(
            'request_id'
        )
    )


    if (
        not RequestId
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '친구 요청 정보가 없습니다.'
                )
            },
            status=400
        )


    try:

        FriendRequestObject = (
            FriendRequest.objects
            .get(
                id=RequestId,
                receiver=request.user,
                status='PENDING'
            )
        )


    except FriendRequest.DoesNotExist:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '대기 중인 친구 요청을 '
                    '찾을 수 없습니다.'
                )
            },
            status=404
        )


    FriendRequestObject.status = (
        'REJECTED'
    )


    FriendRequestObject.responded_at = (
        timezone.now()
    )


    FriendRequestObject.save(
        update_fields=[
            'status',
            'responded_at'
        ]
    )


    return JsonResponse(
        {
            'success': True,

            'message': (
                '친구 요청을 거절했습니다.'
            )
        }
    )


def Get_Profile_Image_Signed_Url(ProfileObject):

    if not ProfileObject.profile_image_path:

        return ''


    try:

        SupabaseUrl = os.getenv(
            'SUPABASE_URL'
        )

        SupabaseServiceRoleKey = os.getenv(
            'SUPABASE_SERVICE_ROLE_KEY'
        )

        ProfileBucket = os.getenv(
            'SUPABASE_PROFILE_BUCKET',
            'profile-images'
        )


        if not SupabaseUrl:

            raise Exception(
                'SUPABASE_URL 설정이 없습니다.'
            )


        if not SupabaseServiceRoleKey:

            raise Exception(
                'SUPABASE_SERVICE_ROLE_KEY 설정이 없습니다.'
            )


        Supabase = create_client(
            SupabaseUrl,
            SupabaseServiceRoleKey
        )


        SignedUrlResponse = (
            Supabase
            .storage
            .from_(
                ProfileBucket
            )
            .create_signed_url(
                ProfileObject.profile_image_path,
                3600
            )
        )


        if isinstance(
            SignedUrlResponse,
            dict
        ):

            return (
                SignedUrlResponse.get(
                    'signedURL'
                )
                or
                SignedUrlResponse.get(
                    'signedUrl'
                )
                or
                ''
            )


        return (
            getattr(
                SignedUrlResponse,
                'signed_url',
                ''
            )
            or
            getattr(
                SignedUrlResponse,
                'signedURL',
                ''
            )
        )


    except Exception as Error:

        print(
            '프로필 이미지 Signed URL 생성 실패:',
            Error
        )

        return ''

@login_required
@require_GET
def friend_list(request):

    Friendships = (
        Friendship.objects
        .filter(
            user=request.user
        )
        .select_related(
            'friend',
            'friend__profile'
        )
        .order_by(
            '-created_at'
        )
    )


    FriendList = []


    for FriendshipObject in Friendships:

        Friend = (
            FriendshipObject.friend
        )


        FriendProfile = (
            Friend.profile
        )


        FriendList.append(
            {
                'friendship_id': (
                    FriendshipObject.id
                ),

                'user_id': (
                    Friend.id
                ),

                'nickname': (
                    FriendProfile.nickname
                ),

                'nickname_tag': (
                    FriendProfile.nickname_tag
                ),

                'display_name': (
                    f'{FriendProfile.nickname}'
                    f'#{FriendProfile.nickname_tag}'
                ),

                'bio': (
                    FriendProfile.bio
                    or ''
                ),

                'profile_image_url': (
                    Get_Profile_Image_Signed_Url(
                        FriendProfile
                    )
                ),

                'created_at': (
                    FriendshipObject.created_at
                    .isoformat()
                )
            }
        )


    return JsonResponse(
        {
            'success': True,

            'friend_count': (
                len(
                    FriendList
                )
            ),

            'friends': (
                FriendList
            )
        }
    )

@login_required
@require_POST
def friend_remove(
    request
):

    try:

        Data = json.loads(
            request.body
        )


    except json.JSONDecodeError:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '잘못된 요청입니다.'
                )
            },
            status=400
        )


    FriendshipId = (
        Data
        .get(
            'friendship_id'
        )
    )


    if (
        not FriendshipId
    ):

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '친구 관계 정보가 없습니다.'
                )
            },
            status=400
        )


    try:

        with transaction.atomic():

            FriendshipObject = (
                Friendship.objects
                .select_for_update()
                .get(
                    id=FriendshipId,
                    user=request.user
                )
            )


            Friend = (
                FriendshipObject.friend
            )


            Friendship.objects.filter(
                user=request.user,
                friend=Friend
            ).delete()


            Friendship.objects.filter(
                user=Friend,
                friend=request.user
            ).delete()


    except Friendship.DoesNotExist:

        return JsonResponse(
            {
                'success': False,

                'message': (
                    '친구 관계를 찾을 수 없습니다.'
                )
            },
            status=404
        )


    FriendProfile = (
        Friend.profile
    )


    return JsonResponse(
        {
            'success': True,

            'message': (
                '친구 관계를 해제했습니다.'
            ),

            'friend': {
                'user_id': (
                    Friend.id
                ),

                'nickname': (
                    FriendProfile.nickname
                ),

                'nickname_tag': (
                    FriendProfile.nickname_tag
                ),

                'display_name': (
                    f'{FriendProfile.nickname}'
                    f'#{FriendProfile.nickname_tag}'
                )
            }
        }
    )
