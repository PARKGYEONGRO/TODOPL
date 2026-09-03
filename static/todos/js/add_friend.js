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
        document.cookie
        .split(
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

    const Response =
        await fetch(
            Url,
            {
                credentials:
                    'same-origin',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-CSRFToken':
                        Get_CSRF_Token(),

                    ...Options.headers
                },

                ...Options
            }
        );


    let ResponseData =
        null;


    try {

        ResponseData =
            await Response.json();

    }

    catch (
        Error
    ) {

        console.error(
            'JSON 응답 파싱 실패:',
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
// 프로필 첫 글자
// ============================================================

function Get_Profile_Initial(
    Nickname
) {

    if (
        !Nickname
    ) {

        return '?';

    }


    return (
        Nickname.charAt(
            0
        )
    );

}


// ============================================================
// 프로필 이미지 HTML
// ============================================================

function Create_Profile_Avatar(
    FriendObject,
    AvatarType
) {

    const Nickname =
        Escape_HTML(
            FriendObject.nickname
        );


    const ProfileImagePath =
        FriendObject.profile_image_path;


    const BackgroundClass =
        AvatarType === 'sent'
            ? 'bg-indigo-500'
            : 'bg-emerald-500';


    // --------------------------------------------------------
    // 현재 API에서는 profile_image_path만 전달한다.
    // Private Bucket Signed URL은 별도 API 구현 전까지
    // 실제 이미지 대신 기본 아바타를 표시한다.
    // --------------------------------------------------------

    if (
        ProfileImagePath
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
                    bg-gray-200
                '
            >

                <i
                    class='
                        fa-regular
                        fa-user
                        text-lg
                        text-gray-400
                    '
                ></i>

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
                class='font-extrabold text-white'
            >
                ${Get_Profile_Initial(Nickname)}
            </span>

        </div>
    `;

}


// ============================================================
// 보낸 친구 요청 카드
// ============================================================

function Create_Sent_Request_Card(
    FriendObject
) {

    const Card =
        document.createElement(
            'div'
        );


    const DisplayName =
        Escape_HTML(
            FriendObject.display_name
        );


    Card.className =
        `
        rounded-2xl
        border
        border-gray-100
        bg-gray-50
        p-4
        `;


    Card.dataset
        .friendRequestId =
            FriendObject.request_id;


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
        document.createElement(
            'div'
        );


    const DisplayName =
        Escape_HTML(
            FriendObject.display_name
        );


    Card.className =
        `
        rounded-2xl
        border
        border-gray-100
        bg-gray-50
        p-4
        `;


    Card.dataset
        .friendRequestId =
            FriendObject.request_id;


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
                data-friend-request-accept='${FriendObject.request_id}'
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
                data-friend-request-reject='${FriendObject.request_id}'
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
        ResponseData.sent_requests ||
        [];


    const ReceivedRequests =
        ResponseData.received_requests ||
        [];


    const TotalCount =
        SentRequests.length +
        ReceivedRequests.length;


    if (
        NewFriendCount
    ) {

        NewFriendCount.textContent =
            TotalCount;

    }


    // --------------------------------------------------------
    // 빈 상태
    // --------------------------------------------------------

    if (
        TotalCount === 0
    ) {

        NewFriendList.appendChild(
            Create_Empty_Friend_Request()
        );

        return;

    }


    // --------------------------------------------------------
    // 보낸 요청
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // 받은 요청
    // --------------------------------------------------------

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

}


// ============================================================
// 친구 요청 목록 불러오기
// ============================================================

async function Load_Friend_Requests() {

    try {

        const ResponseData =
            await Friend_API_Fetch(
                Friend_API_URL
                .RequestList
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

    }

}


// ============================================================
// 친구 요청 보내기
// ============================================================

async function Send_Friend_Request() {

    if (
        !AddFriendInput
        ||
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
            '사용자명을 입력해주세요.'
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

    try {

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

    try {

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
// 이벤트
// ============================================================

function Initialize_Add_Friend_Page() {

    console.log(
        '친구 추가 페이지 초기화'
    );


    // --------------------------------------------------------
    // 친구 요청 보내기
    // --------------------------------------------------------

    if (
        SendFriendRequestButton
    ) {

        SendFriendRequestButton
        .addEventListener(
            'click',
            Send_Friend_Request
        );

    }


    // --------------------------------------------------------
    // Enter
    // --------------------------------------------------------

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
                    Event.key === 'Enter'
                ) {

                    Event.preventDefault();


                    Send_Friend_Request();

                }

            }
        );

    }


    // --------------------------------------------------------
    // 수락 / 거절
    // --------------------------------------------------------

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


                    Reject_Friend_Request(
                        RequestId,
                        RejectButton
                    );

                }

            }
        );

    }


    // --------------------------------------------------------
    // 초기 데이터 로드
    // --------------------------------------------------------

    Load_Friend_Requests();

}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    Initialize_Add_Friend_Page
);