// ============================================================
// add_friend.js
// ============================================================

console.log(
    'add_friend.js 로드됨'
);


// ============================================================
// API URL
// ============================================================

const Friend_API_URL = {

    RequestList:
        '/friend-requests/',

    SendRequest:
        '/friend-request/send/',

    AcceptRequest:
        '/friend-request/accept/',

    RejectRequest:
        '/friend-request/reject/'

};


// ============================================================
// DOM
// ============================================================

const AddFriendInput =
    document.getElementById(
        'addFriendInput'
    );


const SendFriendRequestButton =
    document.getElementById(
        'sendFriendRequestButton'
    );


const NewFriendCount =
    document.getElementById(
        'newFriendCount'
    );


const NewFriendList =
    document.getElementById(
        'newFriendList'
    );


// ============================================================
// CSRF TOKEN
// ============================================================

function Get_CSRF_Token() {

    const CookieName =
        'csrftoken=';


    const CookieList =
        document.cookie.split(
            ';'
        );


    for (
        let Index = 0;
        Index < CookieList.length;
        Index++
    ) {

        const Cookie =
            CookieList[Index]
            .trim();


        if (
            Cookie.startsWith(
                CookieName
            )
        ) {

            return decodeURIComponent(
                Cookie.substring(
                    CookieName.length
                )
            );

        }

    }


    return '';

}


// ============================================================
// API FETCH
// ============================================================

async function Friend_API_Fetch(
    Url,
    Options = {}
) {

    const {

        headers:
            CustomHeaders = {},

        ...FetchOptions

    } =
        Options;


    const Response =
        await fetch(
            Url,
            {
                credentials:
                    'same-origin',

                ...FetchOptions,

                headers: {

                    'X-CSRFToken':
                        Get_CSRF_Token(),

                    ...CustomHeaders

                }

            }
        );


    const ContentType =
        Response.headers.get(
            'content-type'
        ) ||
        '';


    let ResponseData =
        null;


    try {

        if (
            ContentType.includes(
                'application/json'
            )
        ) {

            ResponseData =
                await Response.json();

        }

        else {

            const ResponseText =
                await Response.text();


            if (
                ResponseText
            ) {

                try {

                    ResponseData =
                        JSON.parse(
                            ResponseText
                        );

                }

                catch (
                    Error
                ) {

                    ResponseData =
                        {
                            message:
                                ResponseText
                        };

                }

            }

        }

    }

    catch (
        Error
    ) {

        console.error(
            '응답 파싱 실패:',
            Error
        );

    }


    if (
        !Response.ok
    ) {

        throw new Error(
            ResponseData?.message ||
            '요청 처리에 실패했습니다.'
        );

    }


    return ResponseData;

}


// ============================================================
// HTML 이스케이프
// ============================================================

function Escape_HTML(
    Value
) {

    return String(
        Value ?? ''
    )
    .replace(
        /&/g,
        '&amp;'
    )
    .replace(
        /</g,
        '&lt;'
    )
    .replace(
        />/g,
        '&gt;'
    )
    .replace(
        /"/g,
        '&quot;'
    )
    .replace(
        /'/g,
        '&#039;'
    );

}


// ============================================================
// 사용자 표시 이름
// ============================================================

function Get_Friend_Display_Name(
    FriendObject
) {

    const DisplayName =
        String(
            FriendObject.display_name ||
            ''
        )
        .trim();


    if (
        DisplayName
    ) {

        return DisplayName;

    }


    const Nickname =
        String(
            FriendObject.nickname ||
            ''
        )
        .trim();


    const NicknameTag =
        String(
            FriendObject.nickname_tag ||
            ''
        )
        .trim();


    if (
        Nickname &&
        NicknameTag
    ) {

        return `${Nickname}#${NicknameTag}`;

    }


    if (
        Nickname
    ) {

        return Nickname;

    }


    return '알 수 없는 사용자';

}


// ============================================================
// 프로필 첫 글자
// ============================================================

function Get_Profile_Initial(
    Nickname
) {

    const SafeNickname =
        String(
            Nickname || ''
        )
        .trim();


    if (
        !SafeNickname
    ) {

        return '?';

    }


    return SafeNickname.charAt(
        0
    );

}


// ============================================================
// 프로필 아바타 생성
// ============================================================

function Create_Profile_Avatar(
    FriendObject,
    AvatarType
) {

    const Nickname =
        String(
            FriendObject.nickname ||
            FriendObject.display_name ||
            ''
        )
        .trim();


    const ProfileImageURL =
        FriendObject.profile_image_url ||
        '';


    const BackgroundClass =
        AvatarType === 'sent'
            ? 'bg-indigo-500'
            : 'bg-emerald-500';


    if (
        ProfileImageURL
    ) {

        return `
            <div
                class='
                    flex
                    h-12
                    w-12
                    flex-shrink-0
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-full
                    bg-gray-100
                '
            >

                <img
                    src='${Escape_HTML(
                        ProfileImageURL
                    )}'
                    alt='${Escape_HTML(
                        Nickname
                    )}'
                    class='
                        h-full
                        w-full
                        object-cover
                    '
                >

            </div>
        `;

    }


    return `
        <div
            class='
                flex
                h-12
                w-12
                flex-shrink-0
                items-center
                justify-center
                rounded-full
                ${BackgroundClass}
            '
        >

            <span
                class='
                    font-extrabold
                    text-white
                '
            >
                ${Escape_HTML(
                    Get_Profile_Initial(
                        Nickname
                    )
                )}
            </span>

        </div>
    `;

}


// ============================================================
// 카드 공통 컨테이너 생성
// ============================================================

function Create_Friend_Request_Card() {

    const Card =
        document.createElement(
            'div'
        );


    Card.className =
        `
        rounded-2xl
        border
        border-gray-100
        bg-gray-50
        p-4
        `;


    return Card;

}


// ============================================================
// 보낸 친구 요청 카드
// ============================================================

function Create_Sent_Request_Card(
    FriendObject
) {

    const Card =
        Create_Friend_Request_Card();


    const RequestId =
        FriendObject.request_id;


    const DisplayName =
        Escape_HTML(
            Get_Friend_Display_Name(
                FriendObject
            )
        );


    Card.dataset.friendRequestId =
        RequestId;


    Card.dataset.friendRequestType =
        'sent';


    Card.innerHTML =
        `
        <div
            class='flex items-center gap-4'
        >

            ${Create_Profile_Avatar(
                FriendObject,
                'sent'
            )}


            <div
                class='min-w-0 flex-1'
            >

                <p
                    class='
                        truncate
                        text-base
                        font-bold
                        text-gray-900
                    '
                >
                    ${DisplayName}
                </p>


                <p
                    class='
                        mt-1
                        text-sm
                        font-medium
                        text-indigo-500
                    '
                >
                    친구 요청 완료
                </p>

            </div>


            <div
                class='
                    flex
                    h-10
                    w-10
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-indigo-50
                '
                title='요청 대기 중'
            >

                <i
                    class='
                        fa-solid
                        fa-clock
                        text-sm
                        text-indigo-500
                    '
                ></i>

            </div>

        </div>
        `;


    return Card;

}


// ============================================================
// 받은 친구 요청 카드
// ============================================================

function Create_Received_Request_Card(
    FriendObject
) {

    const Card =
        Create_Friend_Request_Card();


    const RequestId =
        FriendObject.request_id;


    const DisplayName =
        Escape_HTML(
            Get_Friend_Display_Name(
                FriendObject
            )
        );


    Card.dataset.friendRequestId =
        RequestId;


    Card.dataset.friendRequestType =
        'received';


    Card.innerHTML =
        `
        <div
            class='flex items-center gap-4'
        >

            ${Create_Profile_Avatar(
                FriendObject,
                'received'
            )}


            <div
                class='min-w-0 flex-1'
            >

                <p
                    class='
                        truncate
                        text-base
                        font-bold
                        text-gray-900
                    '
                >
                    ${DisplayName}
                </p>


                <p
                    class='
                        mt-1
                        text-sm
                        text-gray-400
                    '
                >
                    친구 요청을 보냈습니다.
                </p>

            </div>

        </div>


        <div
            class='mt-4 flex gap-2'
        >

            <button
                type='button'
                data-friend-request-accept='${Escape_HTML(
                    RequestId
                )}'
                class='
                    flex-1
                    rounded-xl
                    bg-indigo-500
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-indigo-600
                    active:scale-[0.98]
                '
            >
                수락
            </button>


            <button
                type='button'
                data-friend-request-reject='${Escape_HTML(
                    RequestId
                )}'
                class='
                    flex-1
                    rounded-xl
                    bg-gray-200
                    py-3
                    text-sm
                    font-bold
                    text-gray-600
                    transition
                    hover:bg-gray-300
                    active:scale-[0.98]
                '
            >
                거절
            </button>

        </div>
        `;


    return Card;

}


// ============================================================
// 빈 상태
// ============================================================

function Create_Empty_Friend_Request() {

    const EmptyElement =
        document.createElement(
            'div'
        );


    EmptyElement.className =
        `
        flex
        min-h-48
        flex-col
        items-center
        justify-center
        rounded-2xl
        border
        border-dashed
        border-gray-200
        bg-gray-50
        px-5
        text-center
        `;


    EmptyElement.innerHTML =
        `
        <div
            class='
                mb-4
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
            class='font-bold text-gray-500'
        >
            새로운 친구 요청이 없습니다.
        </p>


        <p
            class='mt-2 text-sm text-gray-400'
        >
            친구 요청이 도착하면 이곳에 표시됩니다.
        </p>
        `;


    return EmptyElement;

}


// ============================================================
// 로딩 상태
// ============================================================

function Render_Friend_Request_Loading() {

    if (
        !NewFriendList
    ) {

        return;

    }


    NewFriendList.innerHTML =
        `
        <div
            class='
                flex
                min-h-48
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-gray-100
                bg-gray-50
            '
        >

            <div
                class='
                    h-7
                    w-7
                    animate-spin
                    rounded-full
                    border-2
                    border-gray-200
                    border-t-indigo-500
                '
            ></div>


            <p
                class='
                    mt-4
                    text-sm
                    font-medium
                    text-gray-400
                '
            >
                친구 요청을 불러오는 중...
            </p>

        </div>
        `;

}


// ============================================================
// 오류 상태
// ============================================================

function Render_Friend_Request_Error(
    Message
) {

    if (
        !NewFriendList
    ) {

        return;

    }


    NewFriendList.innerHTML =
        `
        <div
            class='
                flex
                min-h-48
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-red-100
                bg-red-50
                px-5
                text-center
            '
        >

            <div
                class='
                    mb-4
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                '
            >

                <i
                    class='
                        fa-solid
                        fa-circle-exclamation
                        text-lg
                        text-red-400
                    '
                ></i>

            </div>


            <p
                class='font-bold text-red-500'
            >
                친구 요청을 불러올 수 없습니다.
            </p>


            <p
                class='
                    mt-2
                    text-sm
                    leading-relaxed
                    text-red-400
                '
            >
                ${Escape_HTML(
                    Message ||
                    '잠시 후 다시 시도해주세요.'
                )}
            </p>

        </div>
        `;

}


// ============================================================
// 친구 요청 목록 렌더링
// ============================================================

function Render_Friend_Request_List(
    ResponseData
) {

    if (
        !NewFriendList
    ) {

        console.error(
            'newFriendList 요소를 찾을 수 없습니다.'
        );

        return;

    }


    NewFriendList.innerHTML =
        '';


    const SentRequests =
        Array.isArray(
            ResponseData.sent_requests
        )
            ? ResponseData.sent_requests
            : [];


    const ReceivedRequests =
        Array.isArray(
            ResponseData.received_requests
        )
            ? ResponseData.received_requests
            : [];


    const TotalCount =
        SentRequests.length +
        ReceivedRequests.length;


    if (
        NewFriendCount
    ) {

        NewFriendCount.textContent =
            String(
                TotalCount
            );

    }


    if (
        TotalCount === 0
    ) {

        NewFriendList.appendChild(
            Create_Empty_Friend_Request()
        );

        return;

    }


    ReceivedRequests.forEach(
        function (
            FriendObject
        ) {

            const RequestCard =
                Create_Received_Request_Card(
                    FriendObject
                );


            NewFriendList.appendChild(
                RequestCard
            );

        }
    );


    SentRequests.forEach(
        function (
            FriendObject
        ) {

            const RequestCard =
                Create_Sent_Request_Card(
                    FriendObject
                );


            NewFriendList.appendChild(
                RequestCard
            );

        }
    );

}


// ============================================================
// 친구 요청 목록 불러오기
// ============================================================

async function Load_Friend_Requests() {

    if (
        !NewFriendList
    ) {

        return;

    }


    Render_Friend_Request_Loading();


    try {

        const ResponseData =
            await Friend_API_Fetch(
                Friend_API_URL
                .RequestList,
                {
                    method:
                        'GET'
                }
            );


        console.log(
            '친구 요청 목록:',
            ResponseData
        );


        if (
            !ResponseData.success
        ) {

            throw new Error(
                ResponseData.message ||
                '친구 요청을 불러올 수 없습니다.'
            );

        }


        Render_Friend_Request_List(
            ResponseData
        );

    }

    catch (
        Error
    ) {

        console.error(
            '친구 요청 목록 불러오기 실패:',
            Error
        );


        if (
            NewFriendCount
        ) {

            NewFriendCount.textContent =
                '0';

        }


        Render_Friend_Request_Error(
            Error.message
        );

    }

}


// ============================================================
// 친구 요청 보내기
// ============================================================

async function Send_Friend_Request() {

    if (
        !AddFriendInput ||
        !SendFriendRequestButton
    ) {

        return;

    }


    const FriendUsername =
        AddFriendInput
        .value
        .trim();


    if (
        !FriendUsername
    ) {

        alert(
            '닉네임#태그를 입력해주세요.'
        );


        AddFriendInput.focus();


        return;

    }


    const OriginalButtonText =
        SendFriendRequestButton
        .textContent;


    try {

        SendFriendRequestButton.disabled =
            true;


        SendFriendRequestButton.textContent =
            '요청 중...';


        const ResponseData =
            await Friend_API_Fetch(
                Friend_API_URL
                .SendRequest,
                {
                    method:
                        'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            {
                                username:
                                    FriendUsername
                            }
                        )
                }
            );


        console.log(
            '친구 요청 결과:',
            ResponseData
        );


        if (
            !ResponseData.success
        ) {

            throw new Error(
                ResponseData.message ||
                '친구 요청에 실패했습니다.'
            );

        }


        AddFriendInput.value =
            '';


        await Load_Friend_Requests();


        alert(
            ResponseData.message ||
            '친구 요청을 보냈습니다.'
        );

    }

    catch (
        Error
    ) {

        console.error(
            '친구 요청 실패:',
            Error
        );


        alert(
            Error.message
        );

    }

    finally {

        SendFriendRequestButton.disabled =
            false;


        SendFriendRequestButton.textContent =
            OriginalButtonText;

    }

}


// ============================================================
// 친구 요청 수락
// ============================================================

async function Accept_Friend_Request(
    RequestId,
    ButtonElement
) {

    const Card =
        ButtonElement?.closest(
            '[data-friend-request-id]'
        );


    try {

        if (
            Card
        ) {

            Card.classList.add(
                'opacity-60',
                'pointer-events-none'
            );

        }


        if (
            ButtonElement
        ) {

            ButtonElement.disabled =
                true;


            ButtonElement.textContent =
                '수락 중...';

        }


        const ResponseData =
            await Friend_API_Fetch(
                Friend_API_URL
                .AcceptRequest,
                {
                    method:
                        'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            {
                                request_id:
                                    RequestId
                            }
                        )
                }
            );


        console.log(
            '친구 요청 수락 결과:',
            ResponseData
        );


        if (
            !ResponseData.success
        ) {

            throw new Error(
                ResponseData.message ||
                '친구 요청 수락에 실패했습니다.'
            );

        }


        await Load_Friend_Requests();

    }

    catch (
        Error
    ) {

        console.error(
            '친구 요청 수락 실패:',
            Error
        );


        alert(
            Error.message
        );


        if (
            Card
        ) {

            Card.classList.remove(
                'opacity-60',
                'pointer-events-none'
            );

        }


        if (
            ButtonElement
        ) {

            ButtonElement.disabled =
                false;


            ButtonElement.textContent =
                '수락';

        }

    }

}


// ============================================================
// 친구 요청 거절
// ============================================================

async function Reject_Friend_Request(
    RequestId,
    ButtonElement
) {

    const Card =
        ButtonElement?.closest(
            '[data-friend-request-id]'
        );


    try {

        if (
            Card
        ) {

            Card.classList.add(
                'opacity-60',
                'pointer-events-none'
            );

        }


        if (
            ButtonElement
        ) {

            ButtonElement.disabled =
                true;


            ButtonElement.textContent =
                '거절 중...';

        }


        const ResponseData =
            await Friend_API_Fetch(
                Friend_API_URL
                .RejectRequest,
                {
                    method:
                        'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify(
                            {
                                request_id:
                                    RequestId
                            }
                        )
                }
            );


        console.log(
            '친구 요청 거절 결과:',
            ResponseData
        );


        if (
            !ResponseData.success
        ) {

            throw new Error(
                ResponseData.message ||
                '친구 요청 거절에 실패했습니다.'
            );

        }


        await Load_Friend_Requests();

    }

    catch (
        Error
    ) {

        console.error(
            '친구 요청 거절 실패:',
            Error
        );


        alert(
            Error.message
        );


        if (
            Card
        ) {

            Card.classList.remove(
                'opacity-60',
                'pointer-events-none'
            );

        }


        if (
            ButtonElement
        ) {

            ButtonElement.disabled =
                false;


            ButtonElement.textContent =
                '거절';

        }

    }

}


// ============================================================
// 이벤트 초기화
// ============================================================

function Initialize_Add_Friend_Page() {

    console.log(
        '친구 추가 페이지 초기화'
    );


    if (
        SendFriendRequestButton
    ) {

        SendFriendRequestButton
        .addEventListener(
            'click',
            Send_Friend_Request
        );

    }


    if (
        AddFriendInput
    ) {

        AddFriendInput
        .addEventListener(
            'keydown',
            function (
                Event
            ) {

                if (
                    Event.key !== 'Enter'
                ) {

                    return;

                }


                Event.preventDefault();


                Send_Friend_Request();

            }
        );

    }


    if (
        NewFriendList
    ) {

        NewFriendList
        .addEventListener(
            'click',
            function (
                Event
            ) {

                const AcceptButton =
                    Event.target.closest(
                        '[data-friend-request-accept]'
                    );


                if (
                    AcceptButton
                ) {

                    const RequestId =
                        AcceptButton.dataset
                        .friendRequestAccept;


                    if (
                        !RequestId
                    ) {

                        return;

                    }


                    Accept_Friend_Request(
                        RequestId,
                        AcceptButton
                    );


                    return;

                }


                const RejectButton =
                    Event.target.closest(
                        '[data-friend-request-reject]'
                    );


                if (
                    RejectButton
                ) {

                    const RequestId =
                        RejectButton.dataset
                        .friendRequestReject;


                    if (
                        !RequestId
                    ) {

                        return;

                    }


                    Reject_Friend_Request(
                        RequestId,
                        RejectButton
                    );

                }

            }
        );

    }


    Load_Friend_Requests();

}


document.addEventListener(
    'DOMContentLoaded',
    () => {

        Initialize_Add_Friend_Page();

        Load_Friend_Requests();

        const AddFriendTabButton = document.getElementById(
            'AddFriendTabButton'
        );

        if (
            AddFriendTabButton
        ) {
            AddFriendTabButton.addEventListener(
                'click',
                () => {
                    console.log(
                        '친구 추가 탭 열기 - 친구 추가 목록 최신 데이터 로드'
                    );

                    Load_Friend_Requests();
                }
            );
        }
    }
);