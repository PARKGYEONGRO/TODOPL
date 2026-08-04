/*
    ============================================================
    설정 모달
    ============================================================
*/


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


function saveProfile() {

    /*
        현재는 UI 연결만 먼저 처리.
        실제 이름 / 소개 / 프로필 이미지 저장은
        다음 단계에서 DB와 연결.
    */

    closeProfilePage();

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