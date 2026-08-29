console.log('home.js 로드됨');


/*
    오늘 할 일 접기 / 펼치기
*/
function ToggleTodayTodos() {

    const todoList =
        document.getElementById(
            'todayTodoList'
        );

    const toggleButton =
        document.getElementById(
            'todayTodoToggle'
        );

    if (!todoList || !toggleButton) {
        return;
    }

    const isHidden =
        todoList.classList.contains(
            'hidden'
        );

    if (isHidden) {

        todoList.classList.remove(
            'hidden'
        );

        toggleButton.textContent =
            '접기';

    } else {

        todoList.classList.add(
            'hidden'
        );

        toggleButton.textContent =
            '전체보기';
    }
}


/*
    언젠가 할 일 접기 / 펼치기
*/
function ToggleSomedayTodos() {

    const todoList =
        document.getElementById(
            'somedayTodoList'
        );

    const toggleButton =
        document.getElementById(
            'somedayTodoToggle'
        );

    if (!todoList || !toggleButton) {
        return;
    }

    const isHidden =
        todoList.classList.contains(
            'hidden'
        );

    if (isHidden) {

        todoList.classList.remove(
            'hidden'
        );

        toggleButton.textContent =
            '접기';

    } else {

        todoList.classList.add(
            'hidden'
        );

        toggleButton.textContent =
            '전체보기';
    }
}


/*
    ========================================
    모바일 Home 오늘 할 일 정렬
    ========================================

    최종 정렬 기준

    1. 미완료 → 완료
    2. 미완료 중
       - 사용자가 직접 입력한 시간 → 시간 빠른 순
       - 시간 미입력 → 우선순위 순
    3. 같은 조건이면
       - 오래 만든 Todo → 최근 만든 Todo

    중요

    DB에는 시간 미입력 Todo도 현재 시간이 저장되므로
    실제 시간값이 있는지만 보면 안 된다.

    data-time-manual
        1 = 사용자가 직접 시간 입력
        0 = 시간 미입력
*/
function sortMobileTodayTodoList() {

    const mobileList =
        document.getElementById(
            'todayTodoList'
        );

    if (!mobileList) {
        return;
    }

    SortMobileTodayTodoItems(
        mobileList
    );
}


function SortMobileTodayTodoItems(list) {

    const priorityOrder = {
        'H': 1,
        'M': 2,
        'L': 3
    };


    const items =
        Array.from(
            list.querySelectorAll(
                '[data-mobile-today-sort-item]'
            )
        );


    items.sort((a, b) => {

        /*
            ========================================
            1. 완료 여부
            ========================================

            미완료 0
            완료   1

            따라서 미완료가 항상 위
        */
        const completedA =
            Number(
                a.dataset.completed || 0
            );

        const completedB =
            Number(
                b.dataset.completed || 0
            );


        if (
            completedA !==
            completedB
        ) {

            return (
                completedA -
                completedB
            );
        }


        /*
            ========================================
            여기부터는 같은 완료 상태끼리 비교
            ========================================
        */


        /*
            ========================================
            1. 사용자가 직접 입력한 시간 여부
            ========================================

            data-time-manual

            1 = 직접 입력
            0 = 시간 미입력
        */

        const timeManualA =
            a.dataset.timeManual === '1';

        const timeManualB =
            b.dataset.timeManual === '1';


        /*
            ========================================
            2. 둘 다 사용자가 입력한 시간이 있으면
               시간순 정렬
            ========================================
        */

        if (
            timeManualA &&
            timeManualB
        ) {

            const timeA =
                a.dataset.todoTime || '';

            const timeB =
                b.dataset.todoTime || '';


            if (timeA !== timeB) {

                return timeA.localeCompare(
                    timeB
                );
            }
        }


        /*
            ========================================
            3. 한쪽만 직접 입력한 시간이 있으면
            ========================================

            직접 입력한 시간
                ↓
            시간 미입력

            순서

            08:00 운동
            12:00 점심
            ----------------
            장보기
            독서
            게임
        */

        if (
            timeManualA !==
            timeManualB
        ) {

            return timeManualA
                ? -1
                : 1;
        }


        /*
            ========================================
            1. 둘 다 직접 입력 시간이 없거나
               같은 시간이면

               우선순위

               H → M → L
            ========================================
        */

        const priorityA =
            priorityOrder[
                a.dataset.priority
            ] || 4;

        const priorityB =
            priorityOrder[
                b.dataset.priority
            ] || 4;


        if (
            priorityA !==
            priorityB
        ) {

            return (
                priorityA -
                priorityB
            );
        }


        /*
            ========================================
            5. 최종 기준
               오래 만든 Todo → 최근 만든 Todo
            ========================================
        */

        const createdA =
            Number(
                a.dataset.createdAt || 0
            );

        const createdB =
            Number(
                b.dataset.createdAt || 0
            );


        return (
            createdA -
            createdB
        );
    });


    /*
        ========================================
        DOM 재배치
        ========================================
    */

    items.forEach(
        item => {

            list.appendChild(
                item
            );
        }
    );
}


/*
    ========================================
    모바일 Home 언젠가 할 일 정렬
    ========================================

    언젠가 할 일은 시간이 없으므로

    1. 미완료 → 완료
    2. 우선순위 H → M → L
    3. 오래 만든 것 → 최근 만든 것
*/
function sortMobileSomedayTodoList() {

    const list =
        document.getElementById(
            'somedayTodoList'
        );

    if (!list) {
        return;
    }


    const priorityOrder = {
        'H': 1,
        'M': 2,
        'L': 3
    };


    const items =
        Array.from(
            list.querySelectorAll(
                '[data-mobile-someday-sort-item]'
            )
        );


    items.sort((a, b) => {

        /*
            1. 미완료 → 완료
        */

        const completedA =
            Number(
                a.dataset.completed || 0
            );

        const completedB =
            Number(
                b.dataset.completed || 0
            );


        if (
            completedA !==
            completedB
        ) {

            return (
                completedA -
                completedB
            );
        }


        /*
            2. 우선순위
        */

        const priorityA =
            priorityOrder[
                a.dataset.priority
            ] || 4;

        const priorityB =
            priorityOrder[
                b.dataset.priority
            ] || 4;


        if (
            priorityA !==
            priorityB
        ) {

            return (
                priorityA -
                priorityB
            );
        }


        /*
            3. 생성 시간
        */

        const createdA =
            Number(
                a.dataset.createdAt || 0
            );

        const createdB =
            Number(
                b.dataset.createdAt || 0
            );


        return (
            createdA -
            createdB
        );
    });


    /*
        DOM 재배치
    */

    items.forEach(
        item => {

            list.appendChild(
                item
            );
        }
    );
}


/*
    ========================================
    DOM 준비 후 정렬
    ========================================
*/

document.addEventListener(
    'DOMContentLoaded',
    function () {

        sortMobileTodayTodoList();

        sortMobileSomedayTodoList();

    }
);