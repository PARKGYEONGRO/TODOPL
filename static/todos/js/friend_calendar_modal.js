console.log(
    'friend_calendar_modal.js 로드됨'
);


/* ============================================================
   친구 캘린더 모달 전역 변수
============================================================ */

let FriendCalendarModal = null;
let FriendCalendarTitle = null;
let FriendCalendarCloseButton = null;
let FriendCalendarGrid = null;
let FriendCalendarTodoDate = null;
let FriendCalendarTodoList = null;


/* ============================================================
   현재 선택된 친구
============================================================ */

let CurrentFriendObject = null;


/* ============================================================
   현재 선택된 날짜
============================================================ */

let CurrentSelectedDate = null;


/* ============================================================
   캘린더 현재 연도 / 월
============================================================ */

let FriendCalendarYear = null;
let FriendCalendarMonth = null;


/* ============================================================
   친구 캘린더 모달 초기화
============================================================ */

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


    console.log(
        '친구 캘린더 모달 요소 확인:',
        {
            Modal: FriendCalendarModal,
            Title: FriendCalendarTitle,
            CloseButton: FriendCalendarCloseButton,
            Grid: FriendCalendarGrid,
            TodoDate: FriendCalendarTodoDate,
            TodoList: FriendCalendarTodoList
        }
    );


    if (
        !FriendCalendarModal
    ) {

        console.error(
            'FriendCalendarModal 요소를 찾을 수 없습니다.'
        );

        return;

    }


    if (
        !FriendCalendarGrid
    ) {

        console.error(
            'FriendCalendarGrid 요소를 찾을 수 없습니다.'
        );

        return;

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


    /*
     * 처음에는 현재 날짜를 선택하지 않는다.
     */

    CurrentSelectedDate = null;


    /*
     * 현재 달 설정
     */

    const Today = new Date();

    FriendCalendarYear = (
        Today.getFullYear()
    );

    FriendCalendarMonth = (
        Today.getMonth()
    );


    /*
     * 캘린더 렌더링
     */

    Render_Friend_Calendar();

}


/* ============================================================
   친구 캘린더 열기
============================================================ */

function Open_Friend_Calendar(
    FriendObject
) {

    console.log(
        '========== 친구 캘린더 열기 =========='
    );


    console.log(
        '친구 객체:',
        FriendObject
    );


    if (
        !FriendCalendarModal
    ) {

        console.error(
            'FriendCalendarModal이 초기화되지 않았습니다.'
        );

        return;

    }


    if (
        !FriendCalendarGrid
    ) {

        console.error(
            'FriendCalendarGrid가 초기화되지 않았습니다.'
        );

        return;

    }


    /*
     * 현재 친구 저장
     */

    CurrentFriendObject = FriendObject;


    /*
     * 날짜 선택 상태 초기화
     *
     * 중요:
     * 모달을 열 때 오늘 날짜를 자동 선택하지 않는다.
     */

    CurrentSelectedDate = null;


    /*
     * 친구 닉네임
     */

    const FriendNickname = (
        FriendObject.nickname
        ||
        '친구'
    );


    /*
     * 상단 친구 이름
     */

    if (
        FriendCalendarTitle
    ) {

        FriendCalendarTitle.textContent = (
            `${FriendNickname}님의 캘린더`
        );

    }


    /*
     * 선택 날짜 영역 초기화
     */

    if (
        FriendCalendarTodoDate
    ) {

        FriendCalendarTodoDate.textContent = (
            '날짜를 선택해주세요.'
        );

    }


    /*
     * Todo 목록 초기화
     */

    if (
        FriendCalendarTodoList
    ) {

        FriendCalendarTodoList.innerHTML = '';

    }


    /*
     * 현재 달 설정
     */

    const Today = new Date();

    FriendCalendarYear = (
        Today.getFullYear()
    );

    FriendCalendarMonth = (
        Today.getMonth()
    );


    /*
     * 캘린더 표시
     */

    Render_Friend_Calendar();


    /*
     * 모달 표시
     */

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


/* ============================================================
   친구 캘린더 닫기
============================================================ */

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


    /*
     * 선택 상태 초기화
     */

    CurrentSelectedDate = null;

    CurrentFriendObject = null;

}


/* ============================================================
   친구 캘린더 렌더링
============================================================ */

async function Render_Friend_Calendar() {

    if (
        !FriendCalendarGrid
    ) {

        console.error(
            'FriendCalendarGrid가 없습니다.'
        );

        return;

    }


    if (
        FriendCalendarYear === null
        ||
        FriendCalendarMonth === null
    ) {

        const Today = new Date();

        FriendCalendarYear = (
            Today.getFullYear()
        );

        FriendCalendarMonth = (
            Today.getMonth()
        );

    }


    /*
     * 현재 연월
     */

    const Year = (
        FriendCalendarYear
    );

    const Month = (
        FriendCalendarMonth
    );


    /*
     * 캘린더 제목
     */

    const CalendarDateElement = document.getElementById(
        'FriendCalendarDate'
    );


    if (
        CalendarDateElement
    ) {

        CalendarDateElement.textContent = (
            `${Year}.${String(Month + 1).padStart(2, '0')}`
        );

    }


    /*
     * 캘린더 초기화
     */

    FriendCalendarGrid.innerHTML = '';


    /*
     * 해당 월의 첫 번째 날짜
     */

    const FirstDay = new Date(
        Year,
        Month,
        1
    );


    /*
     * 해당 월의 마지막 날짜
     */

    const LastDate = new Date(
        Year,
        Month + 1,
        0
    ).getDate();


    /*
     * 시작 요일
     *
     * 일요일 = 0
     * 월요일 = 1
     * ...
     * 토요일 = 6
     */

    const StartDay = (
        FirstDay.getDay()
    );


    /*
     * 월간 Todo 데이터를 가져온다.
     */

    const MonthlyTodoData = (
        await Load_Friend_Calendar_Monthly_Todos(
            Year,
            Month
        )
    );


    /*
     * 시작 요일만큼 빈 공간 생성
     */

    for (
        let Index = 0;
        Index < StartDay;
        Index++
    ) {

        const EmptyElement = document.createElement(
            'div'
        );


        EmptyElement.className = (
            'h-14'
        );


        FriendCalendarGrid.appendChild(
            EmptyElement
        );

    }


    /*
     * 날짜 생성
     */

    for (
        let DateNumber = 1;
        DateNumber <= LastDate;
        DateNumber++
    ) {

        const DateString = (
            `${Year}-${String(Month + 1).padStart(2, '0')}-${String(DateNumber).padStart(2, '0')}`
        );


        const DateTodoList = (
            MonthlyTodoData[DateString]
            ||
            []
        );


        /*
         * 날짜 링크
         */

        const DateLink = document.createElement(
            'button'
        );


        DateLink.type = (
            'button'
        );


        DateLink.className = (
            'flex ' +
            'w-full ' +
            'flex-col ' +
            'items-center ' +
            'justify-start ' +
            'mx-auto ' +
            'text-center'
        );


        /*
         * 날짜 원
         */

        const DateCircle = document.createElement(
            'span'
        );


        DateCircle.className = (
            'flex ' +
            'h-7 ' +
            'w-7 ' +
            'items-center ' +
            'justify-center ' +
            'rounded-full ' +
            'text-sm ' +
            'transition-all'
        );


        /*
         * 날짜 선택 여부
         *
         * 처음에는 선택 날짜가 없기 때문에
         * 아무 날짜에도 선택 스타일을 주지 않는다.
         */

        if (
            CurrentSelectedDate === DateString
        ) {

            DateCircle.classList.add(
                'bg-indigo-50',
                'text-indigo-600',
                'font-bold'
            );

        }

        else {

            DateCircle.classList.add(
                'text-gray-700',
                'hover:bg-gray-100'
            );

        }


        DateCircle.textContent = (
            DateNumber
        );


        DateLink.appendChild(
            DateCircle
        );


        /*
         * 기간 Todo
         */

        const PeriodTodoList = (
            DateTodoList.filter(
                (
                    TodoObject
                ) => {

                    return (
                        TodoObject.due_date
                        &&
                        TodoObject.end_date
                    );

                }
            )
        );


        /*
         * 기간 Todo 표시 영역
         */

        const PeriodTodoContainer = document.createElement(
            'div'
        );


        PeriodTodoContainer.className = (
            'flex ' +
            'w-full ' +
            'flex-col ' +
            'items-center ' +
            'justify-center ' +
            'mb-1'
        );


        PeriodTodoList.forEach(
            (
                TodoObject
            ) => {

                const PeriodBar = document.createElement(
                    'div'
                );


                PeriodBar.className = (
                    'h-1.5 ' +
                    'w-full'
                );


                /*
                 * 우선순위에 따른 캘린더 막대 색상
                 */

                if (
                    TodoObject.priority === 'H'
                ) {

                    PeriodBar.classList.add(
                        'bg-red-500'
                    );

                }

                else if (
                    TodoObject.priority === 'M'
                ) {

                    PeriodBar.classList.add(
                        'bg-yellow-400'
                    );

                }

                else if (
                    TodoObject.priority === 'L'
                ) {

                    PeriodBar.classList.add(
                        'bg-green-500'
                    );

                }

                else {

                    PeriodBar.classList.add(
                        'bg-gray-300'
                    );

                }


                PeriodTodoContainer.appendChild(
                    PeriodBar
                );

            }
        );


        DateLink.appendChild(
            PeriodTodoContainer
        );


        /*
         * 당일 Todo
         *
         * end_date가 없는 Todo만 표시
         */

        const SingleTodoList = (
            DateTodoList.filter(
                (
                    TodoObject
                ) => {

                    return (
                        !TodoObject.end_date
                    );

                }
            )
        );


        /*
         * 당일 Todo 점 표시 영역
         */

        const SingleTodoContainer = document.createElement(
            'span'
        );


        SingleTodoContainer.className = (
            'flex ' +
            'h-1.5 ' +
            'items-center ' +
            'justify-center ' +
            'gap-0.5 ' +
            'mt-0.5'
        );


        SingleTodoList.forEach(
            (
                TodoObject
            ) => {

                const TodoDot = document.createElement(
                    'span'
                );


                TodoDot.className = (
                    'h-1 ' +
                    'w-1 ' +
                    'rounded-full'
                );


                /*
                 * 우선순위에 따른 점 색상
                 */

                if (
                    TodoObject.priority === 'H'
                ) {

                    TodoDot.classList.add(
                        'bg-red-500'
                    );

                }

                else if (
                    TodoObject.priority === 'M'
                ) {

                    TodoDot.classList.add(
                        'bg-yellow-400'
                    );

                }

                else if (
                    TodoObject.priority === 'L'
                ) {

                    TodoDot.classList.add(
                        'bg-green-500'
                    );

                }

                else {

                    TodoDot.classList.add(
                        'bg-gray-300'
                    );

                }


                SingleTodoContainer.appendChild(
                    TodoDot
                );

            }
        );


        DateLink.appendChild(
            SingleTodoContainer
        );


        /*
         * 날짜 클릭
         */

        DateLink.addEventListener(
            'click',
            () => {

                Select_Friend_Calendar_Date(
                    DateString
                );

            }
        );


        FriendCalendarGrid.appendChild(
            DateLink
        );

    }

}


/* ============================================================
   친구 캘린더 월간 Todo 조회
============================================================ */

async function Load_Friend_Calendar_Monthly_Todos(
    Year,
    Month
) {

    console.log(
        '========== 친구 캘린더 월간 Todo 조회 시작 =========='
    );


    const MonthlyTodoData = {};


    if (
        !CurrentFriendObject
    ) {

        console.error(
            '현재 친구 객체가 없습니다.'
        );

        return MonthlyTodoData;

    }


    const FriendId = (
        CurrentFriendObject.user_id
    );


    if (
        !FriendId
    ) {

        console.error(
            '현재 친구 ID가 없습니다.'
        );

        return MonthlyTodoData;

    }


    /*
     * 해당 월의 마지막 날짜
     */

    const LastDate = new Date(
        Year,
        Month + 1,
        0
    ).getDate();


    /*
     * 현재 월의 모든 날짜를 조회
     *
     * 현재 백엔드 API가
     * friend_id + date 단위 조회이므로
     * 월간 표시를 위해 각 날짜를 조회한다.
     */

    const RequestList = [];


    for (
        let DateNumber = 1;
        DateNumber <= LastDate;
        DateNumber++
    ) {

        const DateString = (
            `${Year}-${String(Month + 1).padStart(2, '0')}-${String(DateNumber).padStart(2, '0')}`
        );


        RequestList.push(
            Load_Friend_Calendar_Day_Todos(
                FriendId,
                DateString
            )
        );

    }


    const ResultList = (
        await Promise.all(
            RequestList
        )
    );


    ResultList.forEach(
        (
            ResultObject
        ) => {

            if (
                !ResultObject
            ) {

                return;

            }


            MonthlyTodoData[
                ResultObject.date
            ] = (
                ResultObject.todos
                ||
                []
            );

        }
    );


    console.log(
        '친구 캘린더 월간 Todo 데이터:',
        MonthlyTodoData
    );


    return MonthlyTodoData;

}


/* ============================================================
   친구 캘린더 특정 날짜 Todo 조회
============================================================ */

async function Load_Friend_Calendar_Day_Todos(
    FriendId,
    SelectedDateString
) {

    try {

        const RequestUrl = (
            `/friend-calendar/?friend_id=${encodeURIComponent(FriendId)}&date=${encodeURIComponent(SelectedDateString)}`
        );


        const Response = await fetch(
            RequestUrl,
            {
                method: 'GET',

                headers: {
                    'Accept': 'application/json'
                }
            }
        );


        if (
            !Response.ok
        ) {

            console.error(
                '친구 캘린더 날짜 조회 실패:',
                Response.status,
                SelectedDateString
            );

            return null;

        }


        const Data = await Response.json();


        if (
            !Data.success
        ) {

            console.error(
                '친구 캘린더 날짜 조회 실패:',
                Data.message
            );

            return null;

        }


        return {
            date:
                Data.date
                ||
                SelectedDateString,

            todos:
                Data.todos
                ||
                []
        };

    }

    catch (
        Error
    ) {

        console.error(
            '친구 캘린더 날짜 조회 오류:',
            Error
        );

        return null;

    }

}


/* ============================================================
   친구 캘린더 날짜 선택
============================================================ */

async function Select_Friend_Calendar_Date(
    SelectedDateString
) {

    console.log(
        '========== 친구 캘린더 날짜 선택 =========='
    );


    console.log(
        '친구 캘린더 날짜 선택:',
        SelectedDateString
    );


    console.log(
        '현재 친구 객체:',
        CurrentFriendObject
    );


    if (
        !CurrentFriendObject
    ) {

        console.error(
            '현재 친구 객체가 없습니다.'
        );

        return;

    }


    const FriendId = (
        CurrentFriendObject.user_id
    );


    console.log(
        '현재 친구 ID:',
        FriendId
    );


    if (
        !FriendId
    ) {

        console.error(
            '현재 친구 ID가 없습니다.'
        );

        return;

    }


    /*
     * 선택 날짜 저장
     */

    CurrentSelectedDate = (
        SelectedDateString
    );


    /*
     * 선택 날짜 UI 적용
     */

    if (
        FriendCalendarTodoDate
    ) {

        FriendCalendarTodoDate.textContent = (
            SelectedDateString
        );

    }


    /*
     * 캘린더 다시 렌더링
     *
     * 선택된 날짜에만
     * bg-indigo-50 / text-indigo-600 적용
     */

    Render_Friend_Calendar();


    /*
     * Todo 목록 초기화
     */

    if (
        FriendCalendarTodoList
    ) {

        FriendCalendarTodoList.innerHTML = '';

    }


    /*
     * API 조회 직전 로그
     */

    console.log(
        'Load_Friend_Calendar_Todos 호출 직전'
    );


    /*
     * 실제 Todo 조회
     */

    await Load_Friend_Calendar_Todos(
        FriendId,
        SelectedDateString
    );

}


/* ============================================================
   친구 Todo 조회
============================================================ */

async function Load_Friend_Calendar_Todos(
    FriendId,
    SelectedDateString
) {

    console.log(
        '========== 친구 Todo 조회 시작 =========='
    );


    console.log(
        'FriendId:',
        FriendId
    );


    console.log(
        'SelectedDateString:',
        SelectedDateString
    );


    if (
        !FriendCalendarTodoList
    ) {

        console.error(
            'FriendCalendarTodoList 요소가 없습니다.'
        );

        return;

    }


    try {

        /*
         * 조회 URL
         */

        const RequestUrl = (
            `/friend-calendar/?friend_id=${encodeURIComponent(FriendId)}&date=${encodeURIComponent(SelectedDateString)}`
        );


        console.log(
            '친구 Todo 조회 URL:',
            RequestUrl
        );


        /*
         * API 요청
         */

        const Response = await fetch(
            RequestUrl,
            {
                method: 'GET',

                headers: {
                    'Accept': 'application/json'
                }
            }
        );


        console.log(
            '친구 Todo 응답 상태:',
            Response.status
        );


        /*
         * 원본 응답
         */

        const ResponseText = await Response.text();


        console.log(
            '친구 Todo 원본 응답:',
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
                JsonError
            ) {

                console.error(
                    '친구 Todo JSON 변환 실패:',
                    JsonError
                );

                throw new Error(
                    '친구 Todo 응답이 올바른 JSON 형식이 아닙니다.'
                );

            }

        }


        console.log(
            '친구 Todo JSON 데이터:',
            Data
        );


        if (
            !Response.ok
        ) {

            throw new Error(
                Data.message
                ||
                `친구 Todo 조회에 실패했습니다. (HTTP ${Response.status})`
            );

        }


        if (
            !Data.success
        ) {

            throw new Error(
                Data.message
                ||
                '친구 Todo 조회에 실패했습니다.'
            );

        }


        const TodoList = (
            Data.todos
            ||
            []
        );


        console.log(
            '친구 Todo 조회 성공:',
            TodoList
        );


        /*
         * Todo 화면 출력
         */

        Render_Friend_Calendar_Todos(
            TodoList
        );

    }

    catch (
        Error
    ) {

        console.error(
            '친구 Todo 조회 오류:',
            Error
        );


        FriendCalendarTodoList.innerHTML = '';


        const ErrorElement = document.createElement(
            'div'
        );


        ErrorElement.className = (
            'rounded-2xl ' +
            'bg-gray-50 ' +
            'px-4 ' +
            'py-5 ' +
            'text-center'
        );


        ErrorElement.innerHTML = `

            <p
                class='
                    text-sm
                    font-medium
                    text-gray-400
                '
            >
                할 일을 불러오지 못했습니다.
            </p>

        `;


        FriendCalendarTodoList.appendChild(
            ErrorElement
        );

    }

}


/* ============================================================
   친구 선택 날짜 Todo 렌더링
============================================================ */

function Render_Friend_Calendar_Todos(
    TodoList
) {

    if (
        !FriendCalendarTodoList
    ) {

        return;

    }


    FriendCalendarTodoList.innerHTML = '';


    /*
     * Todo 없음
     */

    if (
        !TodoList
        ||
        TodoList.length === 0
    ) {

        const EmptyElement = document.createElement(
            'div'
        );


        EmptyElement.className = (
            'rounded-2xl ' +
            'bg-gray-50 ' +
            'px-4 ' +
            'py-5 ' +
            'text-center'
        );


        EmptyElement.innerHTML = `

            <p
                class='
                    text-sm
                    font-medium
                    text-gray-400
                '
            >
                등록된 할 일이 없습니다.
            </p>

        `;


        FriendCalendarTodoList.appendChild(
            EmptyElement
        );


        return;

    }


    /*
     * Todo 생성
     */

    TodoList.forEach(
        (
            TodoObject
        ) => {

            const TodoElement = document.createElement(
                'div'
            );


            TodoElement.className = (
                'flex ' +
                'items-center ' +
                'gap-3 ' +
                'rounded-2xl ' +
                'border ' +
                'border-gray-100 ' +
                'bg-white ' +
                'px-4 ' +
                'py-3'
            );


            /*
             * 왼쪽 아이콘
             */

            const IconContainer = document.createElement(
                'div'
            );


            IconContainer.className = (
                'flex ' +
                'h-8 ' +
                'w-8 ' +
                'flex-shrink-0 ' +
                'items-center ' +
                'justify-center ' +
                'rounded-full ' +
                'bg-gray-50'
            );


            const IconElement = document.createElement(
                'i'
            );


            IconElement.className = (
                'fa-solid ' +
                'fa-list-check ' +
                'text-xs ' +
                'text-gray-400'
            );


            IconContainer.appendChild(
                IconElement
            );


            TodoElement.appendChild(
                IconContainer
            );


            /*
             * Todo 내용 영역
             */

            const ContentContainer = document.createElement(
                'div'
            );


            ContentContainer.className = (
                'min-w-0 ' +
                'flex-1'
            );


            /*
             * 제목
             */

            const TitleElement = document.createElement(
                'p'
            );


            TitleElement.className = (
                'truncate ' +
                'text-sm ' +
                'font-semibold ' +
                'text-gray-700'
            );


            TitleElement.textContent = (
                TodoObject.title
                ||
                '제목 없음'
            );


            ContentContainer.appendChild(
                TitleElement
            );


            /*
             * 시간
             */

            if (
                TodoObject.todo_time
            ) {

                const TimeElement = document.createElement(
                    'p'
                );


                TimeElement.className = (
                    'mt-0.5 ' +
                    'text-xs ' +
                    'text-gray-400'
                );


                TimeElement.textContent = (
                    TodoObject.todo_time
                );


                ContentContainer.appendChild(
                    TimeElement
                );

            }


            /*
             * 태그
             */

            if (
                TodoObject.tag
            ) {

                const TagElement = document.createElement(
                    'span'
                );


                TagElement.className = (
                    'mt-2 ' +
                    'inline-flex ' +
                    'items-center ' +
                    'rounded-full ' +
                    'bg-indigo-50 ' +
                    'px-2.5 ' +
                    'py-1 ' +
                    'text-xs ' +
                    'font-semibold ' +
                    'text-indigo-600'
                );


                TagElement.textContent = (
                    TodoObject.tag
                );


                ContentContainer.appendChild(
                    TagElement
                );

            }


            TodoElement.appendChild(
                ContentContainer
            );


            FriendCalendarTodoList.appendChild(
                TodoElement
            );

        }
    );

}


/* ============================================================
   DOMContentLoaded
============================================================ */

document.addEventListener(
    'DOMContentLoaded',
    () => {

        Initialize_Friend_Calendar_Modal();

    }
);