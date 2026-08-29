# accounts/services.py
import os

from supabase import create_client

from accounts.models import (
    UserProfile,
    SocialAccount
)

from todos.services import (
    Get_User_Default_Tag
)


from storage.services import (
    Delete_Profile_Image
)


def Create_User_Initial_Data( # 초기 데이터 생성 및 외부 계정 연결
    User,
    Nickname='사용자',
    Provider=None,
    Provider_User_Id=None
):

    UserProfile.objects.get_or_create(
        user=User,

        defaults={
            'nickname':
                Nickname or '사용자'
        }
    )

    Get_User_Default_Tag(
        User
    )

    if (
        Provider
        and
        Provider_User_Id
    ):

        SocialAccount.objects.update_or_create(
            user=User,

            provider=Provider,

            defaults={
                'provider_user_id':
                    Provider_User_Id
            }
        )

    return User


def Parse_Nickname_Tag(
    NicknameAndTag
):

    NicknameAndTag = (
        NicknameAndTag
        .strip()
    )

    if NicknameAndTag.count('#') != 1:
        return None

    Nickname, NicknameTag = (
        NicknameAndTag
        .split(
            '#',
            1
        )
    )

    Nickname = Nickname.strip()
    NicknameTag = NicknameTag.strip()

    if not Nickname:
        return None

    if not NicknameTag:
        return None

    if len(NicknameTag) != 5:
        return None

    if not NicknameTag.isdigit():
        return None

    return (
        Nickname,
        NicknameTag
    )


def Get_Profile_By_Nickname_Tag(
    NicknameAndTag
):

    ParsedValue = Parse_Nickname_Tag(
        NicknameAndTag
    )

    if ParsedValue is None:
        return None

    Nickname, NicknameTag = ParsedValue

    return (
        UserProfile.objects
        .select_related(
            'user'
        )
        .filter(
            nickname=Nickname,
            nickname_tag=NicknameTag
        )
        .first()
    )


def Delete_User_Account(
    User,
    Withdrawal_Reason,
    Withdrawal_Detail
):
    UserProfileObject = (
        UserProfile.objects
        .filter(
            user=User
        )
        .first()
    )

    ProfileImagePath = ''

    if UserProfileObject:
        ProfileImagePath = (
            UserProfileObject
            .profile_image_path
        )


    # Supabase 계정 연결 정보 확인

    SupabaseSocialAccount = (
        SocialAccount.objects
        .filter(
            user=User,
            provider='supabase'
        )
        .first()
    )

    SupabaseUserId = None

    if SupabaseSocialAccount:
        SupabaseUserId = (
            SupabaseSocialAccount
            .provider_user_id
        )


    # Supabase 관리자 설정
    # 탈퇴 사유는 모든 사용자에게 저장하므로
    # Supabase Auth 연결 여부와 관계없이 필요

    SupabaseUrl = os.getenv(
        'SUPABASE_URL'
    )

    SupabaseServiceRoleKey = os.getenv(
        'SUPABASE_SERVICE_ROLE_KEY'
    )

    if (
        not SupabaseUrl
        or
        not SupabaseServiceRoleKey
    ):
        raise RuntimeError(
            'Supabase 설정을 확인해주세요.'
        )


    # Supabase 관리자 클라이언트 생성

    Supabase = create_client(
        SupabaseUrl,
        SupabaseServiceRoleKey
    )


    # 1. 탈퇴 사유 저장
    # 모든 사용자 공통

    ReasonResponse = (
        Supabase
        .table(
            'account_deletion_reasons'
        )
        .insert(
            {
                'reason':
                    Withdrawal_Reason,

                'detail':
                    Withdrawal_Detail,
            }
        )
        .execute()
    )

    print(
        '탈퇴사유 저장 결과:',
        ReasonResponse
    )


    # 2. Supabase Auth 사용자 삭제
    # Supabase 계정이 연결된 사용자만 실행

    if SupabaseUserId:

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


    # 3. 프로필 이미지 삭제

    if ProfileImagePath:

        Delete_Profile_Image(
            ProfileImagePath
        )


    # 4. Django User 삭제
    # UserProfile / SocialAccount는
    # CASCADE 설정에 따라 함께 삭제

    User.delete()

    return True

