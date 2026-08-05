/*
    ============================================================
    Home 화면
    ============================================================
*/


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
    ============================================================
    언젠가 할 일 접기 / 펼치기
    ============================================================
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