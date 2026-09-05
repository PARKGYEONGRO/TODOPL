console.log('friend_list.js 로드됨');

function Get_Friend_List_Element() {

    return document.getElementById(
        'FriendList'
    );

}



function Get_Friend_Count_Element() {

    return document.getElementById(
        'FriendCount'
    );

}



async function Load_Friend_List() {

    console.log(
        '친구 목록 로드 시작'
    );


    try {

        const Response = await fetch(
            '/friend-list/',
            {
                method: 'GET',

                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }
        );


        const Data = await Response.json();


        console.log(
            '친구 목록 응답:',
            Data
        );


        console.log(
            'FriendList 존재 여부:',
            !!Get_Friend_List_Element()
        );


        console.log(
            'FriendCount 존재 여부:',
            !!Get_Friend_Count_Element()
        );


        if (
            !Response.ok
            ||
            !Data.success
        ) {

            throw new Error(
                Data.message
                ||
                '친구 목록을 불러오지 못했습니다.'
            );

        }


        Render_Friend_List(
            Data.friends
        );


        Update_Friend_Count(
            Data.friend_count
        );


    }

    catch (
        Error
    ) {

        console.error(
            '친구 목록 불러오기 실패:',
            Error
        );


        Render_Friend_Load_Error();

    }

}



function Update_Friend_Count(
    FriendCount
) {

    const FriendCountElement = (
        Get_Friend_Count_Element()
    );


    if (
        !FriendCountElement
    ) {

        console.error(
            'FriendCount Element를 찾을 수 없습니다.'
        );

        return;

    }


    FriendCountElement.textContent = (
        `친구 - ${FriendCount}명`
    );

}



function Render_Friend_List(
    FriendList
) {

    const FriendListElement = (
        Get_Friend_List_Element()
    );


    if (
        !FriendListElement
    ) {

        console.error(
            'FriendList Element를 찾을 수 없습니다.'
        );

        return;

    }


    FriendListElement.innerHTML = '';


    if (
        !FriendList
        ||
        FriendList.length === 0
    ) {

        Render_Empty_Friend_List(
            FriendListElement
        );

        return;

    }


    FriendList.forEach(
        (
            FriendObject
        ) => {

            const FriendElement = (
                Create_Friend_Element(
                    FriendObject
                )
            );


            FriendListElement.appendChild(
                FriendElement
            );

        }
    );

}



function Create_Friend_Element(
    FriendObject
) {

    const FriendCard = document.createElement(
        'div'
    );


    FriendCard.className = `
        group
        flex
        cursor-pointer
        items-center
        gap-4
        rounded-2xl
        border
        border-gray-100
        bg-gray-50
        p-4
        transition
        hover:border-gray-200
        hover:bg-gray-100
    `;


    FriendCard.dataset.userId = (
        FriendObject.user_id
    );


    FriendCard.dataset.friendshipId = (
        FriendObject.friendship_id
    );


    const ProfileElement = (
        Create_Friend_Profile_Element(
            FriendObject
        )
    );


    const FriendInfoElement = document.createElement(
        'div'
    );


    FriendInfoElement.className = (
        'min-w-0 flex-1'
    );


    const NameRowElement = document.createElement(
        'div'
    );


    NameRowElement.className = (
        'flex min-w-0 items-center gap-2'
    );


    const NicknameElement = document.createElement(
        'p'
    );


    NicknameElement.className = (
        'truncate text-lg font-bold text-gray-900'
    );


    NicknameElement.textContent = (
        FriendObject.nickname
        ||
        '이름 없음'
    );


    const NicknameTagElement = document.createElement(
        'span'
    );


    NicknameTagElement.className = (
        'flex-shrink-0 text-sm font-semibold text-gray-400'
    );


    NicknameTagElement.textContent = (
        `#${FriendObject.nickname_tag || ''}`
    );


    NameRowElement.appendChild(
        NicknameElement
    );


    NameRowElement.appendChild(
        NicknameTagElement
    );


    const BioElement = document.createElement(
        'p'
    );


    BioElement.className = (
        'mt-1 truncate text-sm font-medium text-gray-400'
    );


    BioElement.textContent = (
        FriendObject.bio
        ||
        '한 줄 소개가 없습니다.'
    );


    FriendInfoElement.appendChild(
        NameRowElement
    );


    FriendInfoElement.appendChild(
        BioElement
    );


    const RemoveButton = document.createElement(
        'button'
    );


    RemoveButton.type = (
        'button'
    );


    RemoveButton.className = `
        flex
        h-11
        w-11
        flex-shrink-0
        items-center
        justify-center
        rounded-full
        text-gray-300
        transition
        hover:bg-red-50
        hover:text-red-500
        active:scale-95
    `;


    RemoveButton.setAttribute(
        'aria-label',
        '친구 끊기'
    );


    RemoveButton.setAttribute(
        'title',
        '친구 끊기'
    );


    RemoveButton.innerHTML = `
        <i
            class='fa-solid fa-link-slash text-lg'
        ></i>
    `;


    RemoveButton.addEventListener(
        'click',
        (
            Event
        ) => {

            Event.stopPropagation();


            Remove_Friend(
                FriendObject.friendship_id,
                FriendObject.nickname
            );

        }
    );


    FriendCard.addEventListener(
        'click',
        () => {

            Open_Friend_Calendar(
                FriendObject
            );

        }
    );


    FriendCard.appendChild(
        ProfileElement
    );


    FriendCard.appendChild(
        FriendInfoElement
    );


    FriendCard.appendChild(
        RemoveButton
    );


    return (
        FriendCard
    );

}



function Create_Friend_Profile_Element(
    FriendObject
) {

    const ProfileWrapper = document.createElement(
        'div'
    );


    ProfileWrapper.className = `
        flex
        h-14
        w-14
        flex-shrink-0
        items-center
        justify-center
        overflow-hidden
        rounded-full
        bg-indigo-500
    `;


    const ProfileImageUrl = (
        FriendObject.profile_image_url
    );


    if (
        ProfileImageUrl
    ) {

        const ProfileImage = document.createElement(
            'img'
        );


        ProfileImage.src = (
            ProfileImageUrl
        );


        ProfileImage.alt = (
            FriendObject.nickname
        );


        ProfileImage.className = `
            h-full
            w-full
            object-cover
        `;


        ProfileImage.addEventListener(
            'error',
            () => {

                Render_Friend_Profile_Fallback(
                    ProfileWrapper,
                    FriendObject.nickname
                );

            }
        );


        ProfileWrapper.appendChild(
            ProfileImage
        );

    }

    else {

        Render_Friend_Profile_Fallback(
            ProfileWrapper,
            FriendObject.nickname
        );

    }


    return (
        ProfileWrapper
    );

}



function Render_Friend_Profile_Fallback(
    ProfileWrapper,
    Nickname
) {

    ProfileWrapper.innerHTML = '';


    const Initial = (
        Nickname
        ?
        Nickname.charAt(
            0
        )
        :
        '?'
    );


    const InitialElement = document.createElement(
        'span'
    );


    InitialElement.className = (
        'text-lg font-extrabold text-white'
    );


    InitialElement.textContent = (
        Initial
    );


    ProfileWrapper.appendChild(
        InitialElement
    );

}



function Render_Empty_Friend_List(
    FriendListElement
) {

    FriendListElement.innerHTML = `

        <div
            class='
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-gray-200
                bg-gray-50
                px-5
                py-16
                text-center
            '
        >

            <div
                class='
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                '
            >

                <i
                    class='
                        fa-solid
                        fa-user-group
                        text-xl
                        text-gray-300
                    '
                ></i>

            </div>


            <p
                class='
                    mt-5
                    text-base
                    font-bold
                    text-gray-700
                '
            >
                아직 친구가 없습니다.
            </p>


            <p
                class='
                    mt-2
                    text-sm
                    text-gray-400
                '
            >
                친구를 추가하고 함께 할 일을 관리해보세요.
            </p>

        </div>

    `;

}



function Render_Friend_Load_Error() {

    if (
        !FriendListElement
    ) {

        return;

    }


    FriendListElement.innerHTML = `

        <div
            class='
                rounded-2xl
                border
                border-red-100
                bg-red-50
                px-5
                py-6
                text-center
            '
        >

            <p
                class='
                    text-sm
                    font-bold
                    text-red-500
                '
            >
                친구 목록을 불러오지 못했습니다.
            </p>

        </div>

    `;

}



function Open_Friend_Calendar(
    FriendObject
) {

    console.log(
        '친구 캘린더 열기:',
        FriendObject
    );



    /*
    다음 단계에서 연결

    예시:

    window.location.href = (
        `/friend-calendar/${FriendObject.user_id}/`
    );

    */

}



async function Remove_Friend(
    FriendshipId,
    FriendNickname
) {

    const ConfirmRemove = window.confirm(
        `'${FriendNickname}'님과 친구 관계를 끊을까요?`
    );


    if (
        !ConfirmRemove
    ) {

        return;

    }


    try {

        const Response = await fetch(
            '/friend-remove/',
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': Get_Csrf_Token()
                },

                body: JSON.stringify(
                    {
                        friendship_id: FriendshipId
                    }
                )
            }
        );


        const ResponseText = await Response.text();


        console.log(
            '친구 끊기 응답 상태:',
            Response.status
        );


        console.log(
            '친구 끊기 원본 응답:',
            ResponseText
        );


        let Data = {};


        if (
            ResponseText
        ) {

            try {

                Data = JSON.parse(
                    ResponseText
                );

            }

            catch (
                Error
            ) {

                console.error(
                    '친구 끊기 응답 JSON 변환 실패:',
                    Error
                );

            }

        }


        if (
            !Response.ok
            ||
            !Data.success
        ) {

            throw new Error(
                Data.message
                ||
                `친구 끊기에 실패했습니다. (HTTP ${Response.status})`
            );

        }


        console.log(
            '친구 끊기 성공:',
            Data
        );


        Load_Friend_List();


    }

    catch (
        Error
    ) {

        console.error(
            '친구 끊기 실패:',
            Error
        );


        alert(
            Error.message
            ||
            '친구 끊기에 실패했습니다.'
        );

    }

}



document.addEventListener(
    'DOMContentLoaded',
    () => {

        Load_Friend_List();


        const FriendTabButton = document.getElementById(
            'FriendTabButton'
        );


        if (
            FriendTabButton
        ) {

            FriendTabButton.addEventListener(
                'click',
                () => {

                    console.log(
                        '친구 탭 열기 - 친구 목록 최신 데이터 로드'
                    );


                    Load_Friend_List();

                }
            );

        }

    }
);