// profile_tab.js
console.log('profile_tab.js 로드됨');


// ============================================================
// DOM
// ============================================================

const ProfileTabButtons = document.querySelectorAll(
    '[data-profile-tab]'
);


const ProfileTabContents = {

    profile: document.getElementById(
        'profileTabProfile'
    ),

    friend: document.getElementById(
        'profileTabFriend'
    ),

    addFriend: document.getElementById(
        'profileTabAddFriend'
    ),

};


// ============================================================
// 탭 활성화
// ============================================================

function SetProfileTab(
    TabName
) {

    // --------------------------------------------------------
    // 존재하지 않는 탭
    // --------------------------------------------------------

    if (
        !ProfileTabContents[TabName]
    ) {

        console.error(
            '존재하지 않는 프로필 탭입니다:',
            TabName
        );

        return;

    }


    // --------------------------------------------------------
    // 모든 탭 버튼 비활성화
    // --------------------------------------------------------

    ProfileTabButtons.forEach(
        function (
            TabButton
        ) {

            TabButton.classList.remove(
                'border-gray-900',
                'text-gray-900'
            );


            TabButton.classList.add(
                'border-transparent',
                'text-gray-400'
            );

        }
    );


    // --------------------------------------------------------
    // 선택한 탭 버튼 활성화
    // --------------------------------------------------------

    const ActiveTabButton =
        document.querySelector(
            `[data-profile-tab='${TabName}']`
        );


    if (
        ActiveTabButton
    ) {

        ActiveTabButton.classList.remove(
            'border-transparent',
            'text-gray-400'
        );


        ActiveTabButton.classList.add(
            'border-gray-900',
            'text-gray-900'
        );

    }


    // --------------------------------------------------------
    // 모든 탭 내용 숨김
    // --------------------------------------------------------

    Object.values(
        ProfileTabContents
    ).forEach(
        function (
            TabContent
        ) {

            if (
                TabContent
            ) {

                TabContent.classList.add(
                    'hidden'
                );

            }

        }
    );


    // --------------------------------------------------------
    // 선택한 탭 내용 표시
    // --------------------------------------------------------

    ProfileTabContents[TabName]
        .classList.remove(
            'hidden'
        );


    console.log(
        '프로필 탭 전환:',
        TabName
    );

}


// ============================================================
// 탭 클릭 이벤트
// ============================================================

ProfileTabButtons.forEach(
    function (
        TabButton
    ) {

        TabButton.addEventListener(
            'click',
            function () {

                const TabName =
                    TabButton.dataset
                        .profileTab;


                SetProfileTab(
                    TabName
                );

            }
        );

    }
);


// ============================================================
// 초기 탭
// ============================================================

SetProfileTab(
    'profile'
);