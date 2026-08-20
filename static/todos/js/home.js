console.log('home.js 로드됨');

if (
    typeof sortMobileTodayTodoList === 'function'
) {

    sortMobileTodayTodoList();

}


if (
    typeof sortMobileSomedayTodoList === 'function'
) {

    sortMobileSomedayTodoList();

}



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

// 정렬 순서
// 1. 미완료 → 완료
// 2. 높음(H) → 보통(M) → 낮음(L)
// 3. 오래 만든 것 → 최근 만든 것

// 모바일 Home 오늘 할 일 정렬
function sortMobileTodayTodoList() {

    const list =
        document.getElementById(
            'todayTodoList'
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
                '[data-mobile-today-sort-item]'
            )

        );


    items.sort(
        (a, b) => {

            /*
                ========================================
                1. 미완료 → 완료
                ========================================
            */

            const completedA =
                Number(
                    a.dataset.completed
                );


            const completedB =
                Number(
                    b.dataset.completed
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
                2. 높음 → 보통 → 낮음
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
                3. 오래 만든 것 → 최근 만든 것
                ========================================
            */

            const createdA =
                Number(
                    a.dataset.createdAt
                );


            const createdB =
                Number(
                    b.dataset.createdAt
                );


            return (
                createdA -
                createdB
            );

        }
    );


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

// 모바일 Home 언젠가 할 일 정렬
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


    items.sort(
        (a, b) => {

            /*
                ========================================
                1. 미완료 → 완료
                ========================================
            */

            const completedA =
                Number(
                    a.dataset.completed
                );


            const completedB =
                Number(
                    b.dataset.completed
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
                2. 높음 → 보통 → 낮음
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
                3. 오래 만든 것 → 최근 만든 것
                ========================================
            */

            const createdA =
                Number(
                    a.dataset.createdAt
                );


            const createdB =
                Number(
                    b.dataset.createdAt
                );


            return (
                createdA -
                createdB
            );

        }
    );


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