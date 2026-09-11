console.log(
    'friend_calendar_modal.js 로드됨'
);


// ============================================================
// 친구 캘린더 모달 요소
// ============================================================

let FriendCalendarModal = null;
let FriendCalendarTitle = null;
let FriendCalendarCloseButton = null;
let FriendCalendarGrid = null;
let FriendCalendarTodoDate = null;
let FriendCalendarTodoList = null;


// ============================================================
// 친구 캘린더 모달 초기화
// ============================================================

function Initialize_Friend_Calendar_Modal() {

    FriendCalendarModal = document.getElementById(
        'FriendCalendarModal'
    );

    FriendCalendarTitle = document.getElementById(
        'FriendCalendarTitle'
    );

    FriendCalendarCloseButton = document.getElementById(
        'FriendCalendarCloseButton'
    );

    FriendCalendarGrid = document.getElementById(
        'FriendCalendarGrid'
    );

    FriendCalendarTodoDate = document.getElementById(
        'FriendCalendarTodoDate'
    );

    FriendCalendarTodoList = document.getElementById(
        'FriendCalendarTodoList'
    );


    if (
        !FriendCalendarModal
    ) {

        console.error(
            'FriendCalendarModal 요소를 찾을 수 없습니다.'
        );

        return false;

    }


    if (
        !FriendCalendarGrid
    ) {

        console.error(
            'FriendCalendarGrid 요소를 찾을 수 없습니다.'
        );

        return false;

    }


    if (
        FriendCalendarCloseButton
    ) {

        FriendCalendarCloseButton.addEventListener(
            'click',
            Close_Friend_Calendar
        );

    }


    FriendCalendarModal.addEventListener(
        'click',
        (
            Event
        ) => {

            if (
                Event.target === FriendCalendarModal
            ) {

                Close_Friend_Calendar();

            }

        }
    );


    Render_Friend_Calendar();


    return true;

}


// ============================================================
// 친구 캘린더 요소 다시 확인
// ============================================================

function Ensure_Friend_Calendar_Initialized() {

    if (
        FriendCalendarModal
        &&
        FriendCalendarGrid
    ) {

        return true;

    }


    return Initialize_Friend_Calendar_Modal();

}


// ============================================================
// 친구 캘린더 열기
// ============================================================

function Open_Friend_Calendar(
    FriendObject
) {

    console.log(
        '친구 캘린더 열기:',
        FriendObject
    );


    if (
        !Ensure_Friend_Calendar_Initialized()
    ) {

        console.error(
            '친구 캘린더 모달을 초기화할 수 없습니다.'
        );

        return;

    }


    const FriendNickname = (
        FriendObject.nickname
        ||
        '친구'
    );


    // --------------------------------------------------------
    // 상단에 친구 닉네임 표시
    // --------------------------------------------------------

    if (
        FriendCalendarTitle
    ) {

        FriendCalendarTitle.textContent = (
            `${FriendNickname}님의 캘린더`
        );

    }


    // --------------------------------------------------------
    // 기존 선택 날짜 초기화
    // --------------------------------------------------------

    if (
        FriendCalendarTodoDate
    ) {

        FriendCalendarTodoDate.textContent = (
            '날짜를 선택해주세요.'
        );

    }


    if (
        FriendCalendarTodoList
    ) {

        FriendCalendarTodoList.innerHTML = '';

    }


    // --------------------------------------------------------
    // 현재 달 캘린더 다시 생성
    // --------------------------------------------------------

    Render_Friend_Calendar();


    // --------------------------------------------------------
    // 모달 표시
    // --------------------------------------------------------

    FriendCalendarModal.classList.remove(
        'hidden'
    );

    FriendCalendarModal.classList.add(
        'flex'
    );


    document.body.classList.add(
        'overflow-hidden'
    );

}


// ============================================================
// 친구 캘린더 닫기
// ============================================================

function Close_Friend_Calendar() {

    if (
        !FriendCalendarModal
    ) {

        return;

    }


    FriendCalendarModal.classList.add(
        'hidden'
    );

    FriendCalendarModal.classList.remove(
        'flex'
    );


    document.body.classList.remove(
        'overflow-hidden'
    );

}


// ============================================================
// 친구 캘린더 렌더링
// 현재 달만 표시
// ============================================================

function Render_Friend_Calendar() {

    if (
        !FriendCalendarGrid
    ) {

        return;

    }


    FriendCalendarGrid.innerHTML = '';


    const Today = new Date();


    const Year = (
        Today.getFullYear()
    );


    const Month = (
        Today.getMonth()
    );


    // --------------------------------------------------------
    // 현재 달 1일
    // --------------------------------------------------------

    const FirstDay = new Date(
        Year,
        Month,
        1
    );


    // --------------------------------------------------------
    // 현재 달 마지막 날짜
    // --------------------------------------------------------

    const LastDate = new Date(
        Year,
        Month + 1,
        0
    ).getDate();


    // --------------------------------------------------------
    // 1일의 요일
    // 일요일 = 0
    // --------------------------------------------------------

    const StartDay = (
        FirstDay.getDay()
    );


    // --------------------------------------------------------
    // 월 표시
    // --------------------------------------------------------

    const MonthText = String(
        Month + 1
    ).padStart(
        2,
        '0'
    );


    if (
        FriendCalendarTitle
        &&
        !FriendCalendarTitle.textContent
    ) {

        FriendCalendarTitle.textContent = (
            '친구님의 캘린더'
        );

    }


    // --------------------------------------------------------
    // 기존 날짜 표시 영역은 사용하지 않음
    // FriendCalendarDate 요소가 있어도 무시
    // --------------------------------------------------------


    // --------------------------------------------------------
    // 1일 이전 빈 공간
    // --------------------------------------------------------

    for (
        let Index = 0;
        Index < StartDay;
        Index++
    ) {

        const EmptyElement = document.createElement(
            'div'
        );


        EmptyElement.className = (
            'h-10'
        );


        FriendCalendarGrid.appendChild(
            EmptyElement
        );

    }


    // --------------------------------------------------------
    // 날짜 생성
    // --------------------------------------------------------

    for (
        let DateNumber = 1;
        DateNumber <= LastDate;
        DateNumber++
    ) {

        const DateButton = document.createElement(
            'button'
        );


        DateButton.type = (
            'button'
        );


        DateButton.className = `
            flex
            h-10
            w-full
            items-center
            justify-center
            rounded-full
            text-sm
            font-semibold
            text-gray-700
            transition
            hover:bg-gray-100
            active:scale-95
        `;


        DateButton.textContent = (
            DateNumber
        );


        const DateString = (
            `${Year}-${MonthText}-${String(DateNumber).padStart(2, '0')}`
        );


        DateButton.dataset.date = (
            DateString
        );


        // ----------------------------------------------------
        // 오늘 날짜 표시
        // ----------------------------------------------------

        const IsToday = (
            DateNumber === Today.getDate()
        );


        if (
            IsToday
        ) {

            DateButton.classList.add(
                'bg-indigo-50',
                'text-indigo-600'
            );

        }


        // ----------------------------------------------------
        // 날짜 클릭
        // ----------------------------------------------------

        DateButton.addEventListener(
            'click',
            () => {

                Select_Friend_Calendar_Date(
                    Year,
                    Month,
                    DateNumber
                );

            }
        );


        FriendCalendarGrid.appendChild(
            DateButton
        );

    }

}


// ============================================================
// 친구 캘린더 날짜 선택
// ============================================================

function Select_Friend_Calendar_Date(
    Year,
    Month,
    DateNumber
) {

    const SelectedDate = new Date(
        Year,
        Month,
        DateNumber
    );


    const YearText = (
        SelectedDate.getFullYear()
    );


    const MonthText = String(
        SelectedDate.getMonth() + 1
    ).padStart(
        2,
        '0'
    );


    const DateText = String(
        SelectedDate.getDate()
    ).padStart(
        2,
        '0'
    );


    const DisplayDate = (
        `${YearText}.${MonthText}.${DateText}`
    );


    console.log(
        '친구 캘린더 날짜 선택:',
        DisplayDate
    );


    // --------------------------------------------------------
    // 선택한 날짜 표시
    // --------------------------------------------------------

    if (
        FriendCalendarTodoDate
    ) {

        FriendCalendarTodoDate.textContent = (
            DisplayDate
        );

    }


    // --------------------------------------------------------
    // 해당 날짜의 할 일 표시
    // --------------------------------------------------------

    Render_Friend_Calendar_Todos(
        DisplayDate
    );

}


// ============================================================
// 친구 캘린더 할 일 렌더링
// 현재는 하드코딩 테스트
// ============================================================

function Render_Friend_Calendar_Todos(
    SelectedDate
) {

    if (
        !FriendCalendarTodoList
    ) {

        return;

    }


    // ========================================================
    // 하드코딩 테스트 데이터
    // ========================================================

    const TodoList = {

        '2026.09.01': [
            '친구와 저녁 약속',
            '운동하기'
        ],

        '2026.09.05': [
            '프로젝트 회의'
        ],

        '2026.09.10': [
            '영화 보기',
            '카페 가기'
        ]

    };


    const SelectedTodoList = (
        TodoList[SelectedDate]
        ||
        []
    );


    FriendCalendarTodoList.innerHTML = '';


    // ========================================================
    // 할 일이 없는 경우
    // ========================================================

    if (
        SelectedTodoList.length === 0
    ) {

        FriendCalendarTodoList.innerHTML = `

            <div
                class='
                    rounded-2xl
                    bg-gray-50
                    px-4
                    py-5
                    text-center
                '
            >

                <p
                    class='
                        text-sm
                        font-medium
                        text-gray-400
                    '
                >
                    등록된 할 일이 없습니다.
                </p>

            </div>

        `;


        return;

    }


    // ========================================================
    // 할 일 목록
    // ========================================================

    SelectedTodoList.forEach(
        (
            TodoText
        ) => {

            const TodoElement = document.createElement(
                'div'
            );


            TodoElement.className = `
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-100
                bg-white
                px-4
                py-3
            `;


            TodoElement.innerHTML = `

                <div
                    class='
                        flex
                        h-8
                        w-8
                        flex-shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-50
                    '
                >

                    <i
                        class='
                            fa-solid
                            fa-check
                            text-xs
                            text-gray-400
                        '
                    ></i>

                </div>


                <p
                    class='
                        min-w-0
                        flex-1
                        text-sm
                        font-semibold
                        text-gray-700
                    '
                >
                    ${TodoText}
                </p>

            `;


            FriendCalendarTodoList.appendChild(
                TodoElement
            );

        }
    );

}


// ============================================================
// DOMContentLoaded
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        Initialize_Friend_Calendar_Modal();

    }
);