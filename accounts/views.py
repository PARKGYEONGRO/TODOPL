# accounts/views.py
import os
import json
import uuid
import mimetypes

from PIL import Image

from google_auth_oauthlib.flow import Flow

from google.auth.transport import requests as GoogleRequests

from google.oauth2 import id_token

from django.contrib.auth.decorators import login_required

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
    require_GET,
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


        if (
            Profile.profile_image_path
            and
            Supabase
        ):

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