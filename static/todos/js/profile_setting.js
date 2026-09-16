// profile_setting.js
console.log('profile_setting.js 로드됨');


let SelectedProfileImageFile =
    null;


document.addEventListener(
    'DOMContentLoaded',
    function() {

        InitializeProfileSetting();

    }
);


/*
============================================================
초기화
============================================================
*/

function InitializeProfileSetting() {

    const ProfilePage =
        document.getElementById(
            'profilePage'
        );


    if (!ProfilePage) {

        return;

    }


    InitializeProfileInputs();

    InitializeProfileImage();

    InitializeSaveButton();

    LoadProfileImage();

}


/*
============================================================
입력창 초기화
============================================================
*/

function InitializeProfileInputs() {

    const NicknameInput =
        document.getElementById(
            'nicknameInput'
        );

    const BioInput =
        document.getElementById(
            'bioInput'
        );


    if (NicknameInput) {

        NicknameInput.addEventListener(
            'input',
            function() {

                NicknameInput.value =
                    NicknameInput.value.slice(
                        0,
                        30
                    );

            }
        );

    }


    if (BioInput) {

        BioInput.addEventListener(
            'input',
            function() {

                BioInput.value =
                    BioInput.value.slice(
                        0,
                        100
                    );

            }
        );

    }

}


/*
============================================================
프로필 이미지 초기화
============================================================
*/

function InitializeProfileImage() {

    const ProfileImageEditButton =
        document.getElementById(
            'profileImageEditButton'
        );

    const ProfileImageInput =
        document.getElementById(
            'profileImageInput'
        );


    if (!ProfileImageEditButton) {

        return;

    }


    if (!ProfileImageInput) {

        return;

    }


    ProfileImageEditButton.addEventListener(
        'click',
        function() {

            ProfileImageInput.click();

        }
    );


    ProfileImageInput.addEventListener(
        'change',
        function() {

            const File =
                ProfileImageInput.files[0];


            if (!File) {

                return;

            }


            /*
            ----------------------------------------------------
            MIME 타입 검사
            ----------------------------------------------------
            */

            const AllowedContentTypes = [
                'image/jpeg',
                'image/png',
                'image/webp'
            ];


            if (
                !AllowedContentTypes.includes(
                    File.type
                )
            ) {

                alert(
                    'JPG, PNG, WEBP 이미지 파일만 선택할 수 있습니다.'
                );


                ProfileImageInput.value =
                    '';


                return;

            }


            /*
            ----------------------------------------------------
            파일 크기 검사
            ----------------------------------------------------
            */

            const MaximumFileSize =
                5 * 1024 * 1024;


            if (
                File.size >
                MaximumFileSize
            ) {

                alert(
                    '프로필 이미지는 5MB 이하만 사용할 수 있습니다.'
                );


                ProfileImageInput.value =
                    '';


                return;

            }


            /*
            ----------------------------------------------------
            선택 파일 저장
            ----------------------------------------------------
            */

            SelectedProfileImageFile =
                File;


            PreviewProfileImage(
                File
            );

        }
    );

}


/*
============================================================
프로필 이미지 서버에서 불러오기
============================================================
*/

async function LoadProfileImage() {

    const ProfileImagePreview =
        document.getElementById(
            'profileImagePreview'
        );

    const ProfileImageDefaultIcon =
        document.getElementById(
            'profileImageDefaultIcon'
        );


    if (!ProfileImagePreview) {

        return;

    }


    try {

        /*
        ========================================================
        현재 프로필 이미지 Signed URL 요청
        ========================================================
        */

        const Response =
            await fetch(
                '/profile/image-url/',
                {
                    method:
                        'GET',

                    credentials:
                        'same-origin',

                    headers: {

                        'X-Requested-With':
                            'XMLHttpRequest'

                    }
                }
            );


        /*
        ========================================================
        응답 확인
        ========================================================
        */

        const ResponseText =
            await Response.text();


        console.log(
            '프로필 이미지 URL 응답 상태:',
            Response.status
        );


        console.log(
            '프로필 이미지 URL 응답:',
            ResponseText
        );


        /*
        ========================================================
        JSON 파싱
        ========================================================
        */

        let Data = null;


        try {

            Data =
                JSON.parse(
                    ResponseText
                );

        }
        catch (ParseError) {

            console.error(
                '프로필 이미지 URL JSON 파싱 오류:',
                ParseError
            );


            throw new Error(
                '프로필 이미지 응답을 확인할 수 없습니다.'
            );

        }


        /*
        ========================================================
        이미지 URL이 존재하는 경우
        ========================================================
        */

        if (
            Response.ok
            &&
            Data
            &&
            Data.success
            &&
            Data.image_url
        ) {

            UpdateProfileImage(
                Data.image_url
            );


            return;

        }


        /*
        ========================================================
        이미지가 없는 경우
        ========================================================
        */

        ClearProfileImage();

    }
    catch (ErrorObject) {

        console.error(
            '프로필 이미지 로드 오류:',
            ErrorObject
        );


        ClearProfileImage();

    }

}


/*
============================================================
프로필 이미지 제거
============================================================
*/

function ClearProfileImage() {

    const ProfileImagePreview =
        document.getElementById(
            'profileImagePreview'
        );

    const ProfileImageDefaultIcon =
        document.getElementById(
            'profileImageDefaultIcon'
        );


    if (ProfileImagePreview) {

        ProfileImagePreview.src =
            '';

        ProfileImagePreview.classList.add(
            'hidden'
        );

    }


    if (ProfileImageDefaultIcon) {

        ProfileImageDefaultIcon.classList.remove(
            'hidden'
        );

    }


    /*
    ========================================================
    설정 모달 이미지도 기본 아이콘으로 변경
    ========================================================
    */

    const SettingsProfileImage =
        document.getElementById(
            'settingsProfileImage'
        );

    const SettingsProfileDefaultIcon =
        document.getElementById(
            'settingsProfileDefaultIcon'
        );


    if (SettingsProfileImage) {

        SettingsProfileImage.src =
            '';

        SettingsProfileImage.classList.add(
            'hidden'
        );

    }


    if (SettingsProfileDefaultIcon) {

        SettingsProfileDefaultIcon.classList.remove(
            'hidden'
        );

    }

}


/*
============================================================
저장 버튼 초기화
============================================================
*/

function InitializeSaveButton() {

    const SaveButton =
        document.getElementById(
            'saveProfileButton'
        );


    if (!SaveButton) {

        return;

    }


    SaveButton.addEventListener(
        'click',
        function() {

            SaveProfile();

        }
    );

}


/*
============================================================
프로필 이미지 미리보기
============================================================
*/

function PreviewProfileImage(
    File
) {

    const ProfileImagePreview =
        document.getElementById(
            'profileImagePreview'
        );

    const ProfileImageDefaultIcon =
        document.getElementById(
            'profileImageDefaultIcon'
        );


    if (!ProfileImagePreview) {

        return;

    }


    /*
    ========================================================
    기존 Object URL 해제
    ========================================================
    */

    if (
        ProfileImagePreview.dataset.objectUrl
    ) {

        URL.revokeObjectURL(
            ProfileImagePreview.dataset.objectUrl
        );

    }


    /*
    ========================================================
    새 Object URL 생성
    ========================================================
    */

    const ImageUrl =
        URL.createObjectURL(
            File
        );


    ProfileImagePreview.dataset.objectUrl =
        ImageUrl;


    ProfileImagePreview.src =
        ImageUrl;


    ProfileImagePreview.classList.remove(
        'hidden'
    );


    if (ProfileImageDefaultIcon) {

        ProfileImageDefaultIcon.classList.add(
            'hidden'
        );

    }

}


/*
============================================================
프로필 저장
============================================================
*/

async function SaveProfile() {

    const NicknameInput =
        document.getElementById(
            'nicknameInput'
        );


    const BioInput =
        document.getElementById(
            'bioInput'
        );


    const SaveButton =
        document.getElementById(
            'saveProfileButton'
        );


    if (!NicknameInput) {

        return;

    }


    if (!BioInput) {

        return;

    }


    const Nickname =
        NicknameInput.value.trim();


    const Bio =
        BioInput.value.trim();


    /*
    ========================================================
    닉네임 검증
    ========================================================
    */

    if (!Nickname) {

        alert(
            '닉네임을 입력해주세요.'
        );


        NicknameInput.focus();


        return;

    }


    if (Nickname.length > 30) {

        alert(
            '닉네임은 30자 이하로 입력해주세요.'
        );


        NicknameInput.focus();


        return;

    }


    /*
    ========================================================
    한 줄 소개 검증
    ========================================================
    */

    if (Bio.length > 100) {

        alert(
            '한 줄 소개는 100자 이하로 입력해주세요.'
        );


        BioInput.focus();


        return;

    }


    /*
    ========================================================
    저장 버튼 비활성화
    ========================================================
    */

    SetSaveButtonLoading(
        SaveButton,
        true
    );


    try {

        /*
        ========================================================
        프로필 데이터 생성
        ========================================================
        */

        const FormDataObject =
            new FormData();


        FormDataObject.append(
            'nickname',
            Nickname
        );


        FormDataObject.append(
            'bio',
            Bio
        );


        /*
        ========================================================
        선택된 프로필 이미지 추가
        ========================================================
        */

        if (
            SelectedProfileImageFile
        ) {

            FormDataObject.append(
                'profile_image',
                SelectedProfileImageFile
            );

        }


        /*
        ========================================================
        프로필 저장 요청
        ========================================================
        */

        const Response =
            await fetch(
                '/profile/update/',
                {

                    method:
                        'POST',

                    credentials:
                        'same-origin',

                    headers: {

                        'X-CSRFToken':
                            GetCookie(
                                'csrftoken'
                            ),

                        'X-Requested-With':
                            'XMLHttpRequest'

                    },

                    body:
                        FormDataObject

                }
            );


        /*
        ========================================================
        서버 응답 원문
        ========================================================
        */

        const ResponseText =
            await Response.text();


        console.log(
            '프로필 저장 서버 응답 상태:',
            Response.status
        );


        console.log(
            '프로필 저장 서버 응답:',
            ResponseText
        );


        /*
        ========================================================
        JSON 변환
        ========================================================
        */

        let Data = null;


        try {

            Data =
                JSON.parse(
                    ResponseText
                );

        }
        catch (ParseError) {

            console.error(
                '프로필 저장 JSON 파싱 오류:',
                ParseError
            );


            throw new Error(
                '서버 응답을 확인할 수 없습니다.'
            );

        }


        /*
        ========================================================
        저장 실패
        ========================================================
        */

        if (
            !Response.ok
            ||
            !Data
            ||
            !Data.success
        ) {

            throw new Error(
                Data
                &&
                Data.message
                    ? Data.message
                    : '프로필 저장에 실패했습니다.'
            );

        }


        /*
        ========================================================
        서버에서 저장된 닉네임 / 소개 반영
        ========================================================
        */

        const SavedNickname =
            Data.nickname !== undefined
                ? Data.nickname
                : Nickname;


        const SavedBio =
            Data.bio !== undefined
                ? Data.bio
                : Bio;


        NicknameInput.value =
            SavedNickname;


        BioInput.value =
            SavedBio;


        UpdateProfileName(
            SavedNickname
        );


        UpdateProfileInfo(
            SavedNickname,
            SavedBio
        );


        UpdateSettingsProfile(
            SavedNickname,
            SavedBio
        );


        /*
        ========================================================
        서버에서 받은 프로필 이미지 URL 반영
        ========================================================
        */

        if (
            Data.image_url
        ) {

            UpdateProfileImage(
                Data.image_url
            );

        }
        else {

            /*
            이미지가 없는 경우
            */

            ClearProfileImage();

        }


        /*
        ========================================================
        이미지 선택 상태 초기화
        ========================================================
        */

        SelectedProfileImageFile =
            null;


        const ProfileImageInput =
            document.getElementById(
                'profileImageInput'
            );


        if (ProfileImageInput) {

            ProfileImageInput.value =
                '';

        }


        /*
        ========================================================
        Object URL 정리
        ========================================================
        */

        const ProfileImagePreview =
            document.getElementById(
                'profileImagePreview'
            );


        if (
            ProfileImagePreview
            &&
            ProfileImagePreview.dataset.objectUrl
        ) {

            URL.revokeObjectURL(
                ProfileImagePreview.dataset.objectUrl
            );


            delete ProfileImagePreview.dataset.objectUrl;

        }


        /*
        ========================================================
        저장 성공
        ========================================================
        */

        alert(
            '프로필이 저장되었습니다.'
        );

    }
    catch (ErrorObject) {

        console.error(
            '프로필 저장 오류:',
            ErrorObject
        );


        alert(
            ErrorObject.message
            ||
            '프로필 저장 중 오류가 발생했습니다.'
        );

    }
    finally {

        SetSaveButtonLoading(
            SaveButton,
            false
        );

    }

}


/*
============================================================
프로필 이미지 화면 반영
============================================================
*/

function UpdateProfileImage(
    ImageUrl
) {

    if (!ImageUrl) {

        ClearProfileImage();

        return;

    }


    const ProfileImagePreview =
        document.getElementById(
            'profileImagePreview'
        );


    const ProfileImageDefaultIcon =
        document.getElementById(
            'profileImageDefaultIcon'
        );


    if (ProfileImagePreview) {

        ProfileImagePreview.src =
            ImageUrl;

        ProfileImagePreview.classList.remove(
            'hidden'
        );

    }


    if (ProfileImageDefaultIcon) {

        ProfileImageDefaultIcon.classList.add(
            'hidden'
        );

    }


    /*
    ========================================================
    설정 모달 프로필 이미지
    ========================================================
    */

    const SettingsProfileImage =
        document.getElementById(
            'settingsProfileImage'
        );


    const SettingsProfileDefaultIcon =
        document.getElementById(
            'settingsProfileDefaultIcon'
        );


    if (SettingsProfileImage) {

        SettingsProfileImage.src =
            ImageUrl;

        SettingsProfileImage.classList.remove(
            'hidden'
        );

    }


    if (SettingsProfileDefaultIcon) {

        SettingsProfileDefaultIcon.classList.add(
            'hidden'
        );

    }

}


/*
============================================================
저장 버튼 로딩 상태
============================================================
*/

function SetSaveButtonLoading(
    SaveButton,
    IsLoading
) {

    if (!SaveButton) {

        return;

    }


    if (IsLoading) {

        SaveButton.disabled =
            true;


        SaveButton.dataset.originalText =
            SaveButton.textContent.trim();


        SaveButton.textContent =
            '저장 중...';


        SaveButton.classList.add(
            'opacity-50',
            'cursor-not-allowed'
        );

    }
    else {

        SaveButton.disabled =
            false;


        SaveButton.textContent =
            SaveButton.dataset.originalText
            ||
            '저장';


        SaveButton.classList.remove(
            'opacity-50',
            'cursor-not-allowed'
        );

    }

}


/*
============================================================
프로필 상단 이름 갱신
============================================================
*/

function UpdateProfileName(
    Nickname
) {

    const ProfilePage =
        document.getElementById(
            'profilePage'
        );


    if (!ProfilePage) {

        return;

    }


    const HeaderTitle =
        ProfilePage.querySelector(
            'header h1'
        );


    if (HeaderTitle) {

        HeaderTitle.textContent =
            Nickname;

    }

}


/*
============================================================
프로필 정보 갱신
============================================================
*/

function UpdateProfileInfo(
    Nickname,
    Bio
) {

    const ProfilePage =
        document.getElementById(
            'profilePage'
        );


    /*
    --------------------------------------------------------
    프로필 설정 페이지
    --------------------------------------------------------
    */

    if (ProfilePage) {

        const NicknameInput =
            document.getElementById(
                'nicknameInput'
            );


        if (NicknameInput) {

            NicknameInput.value =
                Nickname;

        }


        const BioInput =
            document.getElementById(
                'bioInput'
            );


        if (BioInput) {

            BioInput.value =
                Bio;

        }

    }


    /*
    --------------------------------------------------------
    설정 모달 프로필
    --------------------------------------------------------
    */

    const SettingsProfileNickname =
        document.getElementById(
            'settingsProfileNickname'
        );


    if (SettingsProfileNickname) {

        SettingsProfileNickname.textContent =
            Nickname;

    }


    const SettingsProfileBio =
        document.getElementById(
            'settingsProfileBio'
        );


    if (SettingsProfileBio) {

        if (Bio) {

            SettingsProfileBio.textContent =
                Bio;


            SettingsProfileBio.classList.remove(
                'text-gray-500'
            );


            SettingsProfileBio.classList.add(
                'text-gray-400'
            );

        }
        else {

            SettingsProfileBio.textContent =
                '한 줄 소개를 입력하세요';


            SettingsProfileBio.classList.remove(
                'text-gray-400'
            );


            SettingsProfileBio.classList.add(
                'text-gray-500'
            );

        }

    }

}


/*
============================================================
설정 모달 프로필 정보 갱신
============================================================
*/

function UpdateSettingsProfile(
    Nickname,
    Bio
) {

    const SettingsProfileNickname =
        document.getElementById(
            'settingsProfileNickname'
        );


    if (SettingsProfileNickname) {

        SettingsProfileNickname.textContent =
            Nickname;

    }


    const SettingsProfileBio =
        document.getElementById(
            'settingsProfileBio'
        );


    if (!SettingsProfileBio) {

        return;

    }


    if (Bio) {

        SettingsProfileBio.textContent =
            Bio;


        SettingsProfileBio.classList.remove(
            'text-gray-500'
        );


        SettingsProfileBio.classList.add(
            'text-gray-400'
        );

    }
    else {

        SettingsProfileBio.textContent =
            '한 줄 소개를 입력하세요';


        SettingsProfileBio.classList.remove(
            'text-gray-400'
        );


        SettingsProfileBio.classList.add(
            'text-gray-500'
        );

    }

}


/*
============================================================
CSRF Cookie 가져오기
============================================================
*/

function GetCookie(
    Name
) {

    const Cookies =
        document.cookie.split(
            ';'
        );


    for (
        const Cookie of Cookies
    ) {

        const CookieText =
            Cookie.trim();


        if (!CookieText) {

            continue;

        }


        const SeparatorIndex =
            CookieText.indexOf(
                '='
            );


        if (
            SeparatorIndex === -1
        ) {

            continue;

        }


        const Key =
            CookieText.substring(
                0,
                SeparatorIndex
            );


        const Value =
            CookieText.substring(
                SeparatorIndex + 1
            );


        if (
            Key === Name
        ) {

            return decodeURIComponent(
                Value
            );

        }

    }


    return null;

}