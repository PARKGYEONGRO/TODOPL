# storage/services.py
import os

from supabase import create_client


def Delete_Profile_Image(
    Profile_Image_Path
):
    if not Profile_Image_Path:
        return

    Supabase_Url = os.getenv(
        'SUPABASE_URL'
    )

    Supabase_Service_Role_Key = os.getenv(
        'SUPABASE_SERVICE_ROLE_KEY'
    )

    Supabase_Profile_Bucket = os.getenv(
        'SUPABASE_PROFILE_BUCKET'
    )

    if (
        not Supabase_Url
        or
        not Supabase_Service_Role_Key
        or
        not Supabase_Profile_Bucket
    ):
        raise RuntimeError(
            'Supabase Storage 설정을 확인해주세요.'
        )

    Supabase = create_client(
        Supabase_Url,
        Supabase_Service_Role_Key
    )

    Supabase.storage.from_(
        Supabase_Profile_Bucket
    ).remove(
        [
            Profile_Image_Path
        ]
    )