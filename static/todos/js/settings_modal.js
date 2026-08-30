//settings_modal.js
console.log('settings_modal.js 로드됨')


/*
    설정창 열기
*/

function openSettingsModal() {

    const settingsModal =
        document.getElementById(
            'settingsModal'
        );


    if (!settingsModal) {

        return;

    }


    settingsModal.classList.remove(
        'hidden'
    );


    document.body.classList.add(
        'overflow-hidden'
    );

}


/*
    설정창 닫기
*/

function closeSettingsModal() {

    const settingsModal =
        document.getElementById(
            'settingsModal'
        );


    if (!settingsModal) {

        return;

    }


    settingsModal.classList.add(
        'hidden'
    );


    document.body.classList.remove(
        'overflow-hidden'
    );

}


/*
    ============================================================
    화면 모드
    ============================================================
*/

function setupThemeButtons() {

    const themeButtons =
        document.querySelectorAll(
            '[data-theme]'
        );


    if (!themeButtons.length) {

        return;

    }


    themeButtons.forEach(
        button => {

            button.addEventListener(
                'click',
                function () {

                    themeButtons.forEach(
                        item => {

                            item.classList.remove(
                                'bg-black',
                                'text-white'
                            );

                            item.classList.add(
                                'bg-gray-100',
                                'text-gray-500'
                            );

                        }
                    );


                    this.classList.remove(
                        'bg-gray-100',
                        'text-gray-500'
                    );

                    this.classList.add(
                        'bg-black',
                        'text-white'
                    );

                }
            );

        }
    );

}


/*
    ============================================================
    초기화
    ============================================================
*/

document.addEventListener(
    'DOMContentLoaded',
    function () {

        setupThemeButtons();

    }
);


/*
    ============================================================
    프로필 화면
    ============================================================
*/

function openProfilePage() {

    const settingsModal =
        document.getElementById('settingsModal');

    const profilePage =
        document.getElementById('profilePage');


    if (settingsModal) {

        settingsModal.classList.add('hidden');

    }


    if (profilePage) {

        profilePage.classList.remove('hidden');

    }

}


function closeProfilePage() {

    const settingsModal =
        document.getElementById('settingsModal');

    const profilePage =
        document.getElementById('profilePage');


    if (profilePage) {

        profilePage.classList.add('hidden');

    }


    if (settingsModal) {

        settingsModal.classList.remove('hidden');

    }

}

function backdropClick(event) {

    if (event.target !== event.currentTarget) {

        return;

    }


    const profilePage =
        document.getElementById('profilePage');


    if (
        profilePage &&
        !profilePage.classList.contains('hidden')
    ) {

        closeProfilePage();

        return;

    }


    const settingsModal =
        document.getElementById('settingsModal');


    if (
        settingsModal &&
        !settingsModal.classList.contains('hidden')
    ) {

        closeSettingsModal();

    }

}

/*
============================================================
설정창 프로필 정보 갱신
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

    const SettingsProfileBio =
        document.getElementById(
            'settingsProfileBio'
        );


    if (SettingsProfileNickname) {

        SettingsProfileNickname.textContent =
            Nickname;

    }


    if (SettingsProfileBio) {

        SettingsProfileBio.textContent =
            Bio ||
            '한 줄 소개를 입력하세요';

    }

}

async function LoadSettingsProfileImage() {

    const ProfileImage = document.getElementById(
        'settingsProfileImage'
    );

    const DefaultIcon = document.getElementById(
        'settingsProfileDefaultIcon'
    );

    if (!ProfileImage || !DefaultIcon) {
        return;
    }

    try {

        const Response = await fetch(
            '/account/profile/image-url/',
            {
                method: 'GET',
                credentials: 'same-origin'
            }
        );

        const Data = await Response.json();

        if (
            Data.success
            &&
            Data.image_url
        ) {

            ProfileImage.src = Data.image_url;

            ProfileImage.classList.remove(
                'hidden'
            );

            DefaultIcon.classList.add(
                'hidden'
            );

        } else {

            ProfileImage.src = '';

            ProfileImage.classList.add(
                'hidden'
            );

            DefaultIcon.classList.remove(
                'hidden'
            );

        }

    } catch (Error) {

        console.error(
            '프로필 이미지 불러오기 오류:',
            Error
        );

        ProfileImage.src = '';

        ProfileImage.classList.add(
            'hidden'
        );

        DefaultIcon.classList.remove(
            'hidden'
        );
    }
}

function logoutUser() {

    if (
        !confirm(
            '로그아웃 하시겠습니까?'
        )
    ) {

        return;

    }


    const form =
        document.createElement(
            'form'
        );


    form.method =
        'POST';


    form.action =
        '/logout/';


    const csrf =
        document.createElement(
            'input'
        );


    csrf.type =
        'hidden';


    csrf.name =
        'csrfmiddlewaretoken';


    csrf.value =
        getCsrfToken();


    form.appendChild(
        csrf
    );


    document.body.appendChild(
        form
    );


    form.submit();

}