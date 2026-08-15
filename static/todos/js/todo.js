console.log('todo.js 로드됨');


// ============================================================
// CSRF
// ============================================================

function getCsrfToken() {

    const body = document.body;

    if (body && body.dataset.csrf) {

        return body.dataset.csrf;

    }


    const cookie = document.cookie
        .split('; ')
        .find(
            row => row.startsWith('csrftoken=')
        );


    if (!cookie) {

        return '';

    }


    return decodeURIComponent(
        cookie.split('=')[1]
    );

}


// ============================================================
// 오늘 할 일 추가 모달
// ============================================================

function openModal() {

    const modal =
        document.getElementById(
            'createModal'
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        'hidden'
    );

    modal.classList.add(
        'flex'
    );

}


function closeModal() {

    const modal =
        document.getElementById(
            'createModal'
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        'hidden'
    );

    modal.classList.remove(
        'flex'
    );

}


// ============================================================
// 언젠가 할 일 추가 모달
// ============================================================

function openSomedayCreateModal() {

    const modal =
        document.getElementById(
            'somedayCreateModal'
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        'hidden'
    );

    modal.classList.add(
        'flex'
    );

}


function closeSomedayCreateModal() {

    const modal =
        document.getElementById(
            'somedayCreateModal'
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        'hidden'
    );

    modal.classList.remove(
        'flex'
    );

}


// 오늘 할 일 완료 / 미완료
function toggleTodo(
    todoId,
    selectedTag,
    selectedDate
) {

    const csrfToken =
        getCsrfToken();


    fetch(
        `/toggle/${todoId}/`,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({

                tag: selectedTag,

                date: selectedDate

            })

        }
    )


    .then(response => {

        if (!response.ok) {

            return response.json()
                .then(data => {

                    throw new Error(
                        data.message ||
                        '서버 오류'
                    );

                });

        }


        return response.json();

    })


    .then(data => {

        if (
            data.status !== 'success'
        ) {

            throw new Error(
                data.message ||
                '변경 실패'
            );

        }


        // 제목
        const titleElement =
            document.getElementById(
                `todo-title-${todoId}`
            );


        if (titleElement) {


            titleElement.classList.remove(
                'line-through',
                'text-gray-400',
                'text-gray-800'
            );


            if (data.is_completed) {


                titleElement.classList.add(
                    'line-through',
                    'text-gray-400'
                );


            }

            else {


                titleElement.classList.add(
                    'text-gray-800'
                );


            }

        }


        //모바일 카드
        const mobileCard =
            document.getElementById(
                `todo-card-${todoId}`
            );


        if (mobileCard) {

            if (data.is_completed) {

                mobileCard.classList.remove(
                    'bg-white'
                );

                mobileCard.classList.add(
                    'bg-gray-50'
                );

            }

            else {

                mobileCard.classList.remove(
                    'bg-gray-50'
                );

                mobileCard.classList.add(
                    'bg-white'
                );

            }


            const mobileButton =
                mobileCard.querySelector(
                    '[data-todo-id]'
                );


            if (mobileButton) {

                if (data.is_completed) {

                    mobileButton.classList.remove(
                        'border-2',
                        'border-gray-300',
                        'bg-white'
                    );

                    mobileButton.classList.add(
                        'bg-black',
                        'text-white'
                    );

                    mobileButton.innerHTML =
                        `
                        <i class="fa-solid fa-check text-[10px]"></i>
                        `;

                }

                else {

                    mobileButton.classList.remove(
                        'bg-black',
                        'text-white'
                    );

                    mobileButton.classList.add(
                        'border-2',
                        'border-gray-300',
                        'bg-white'
                    );

                    mobileButton.innerHTML =
                        '';

                }

            }

        }


        // PC 정렬 데이터
        const pcTodoItem =
            document.querySelector(
                `[data-todo-sort-item][data-todo-id="${todoId}"]`
            );

        if (pcTodoItem) {

            pcTodoItem.dataset.completed =
                data.is_completed
                    ? '1'
                    : '0';

        }


        // 모바일 정렬 데이터
        const mobileTodayItem =
            document.querySelector(
                `[data-mobile-today-sort-item][data-mobile-todo-id="${todoId}"]`
            );


        if (mobileTodayItem) {

            mobileTodayItem.dataset.completed =
                data.is_completed
                    ? '1'
                    : '0';

        }



        // 통계 및 정렬
        updatePcStats(data);

        updateMobileStats(data);


        // ==================================================
        // 정렬
        // ==================================================

        sortTodayTodoList();

        sortMobileTodayTodoList();

    })


    .catch(error => {

        console.error(
            'Todo 변경 오류:',
            error
        );


        alert(
            error.message
        );

    });

}


// 언젠가 할 일 완료 / 미완료
function toggleSomedayTodo(
    somedayId
) {


    fetch(
        `/someday/toggle/${somedayId}/`,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken': getCsrfToken(),
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({})
        }
    )


    .then(response => {

        if (!response.ok) {

            throw new Error(
                '언젠가 할 일 변경 실패'
            );

        }


        return response.json();

    })


    .then(data => {


        if (
            data.status !== 'success'
        ) {

            throw new Error(
                data.message ||
                '변경 실패'
            );

        }


        const isCompleted =
            Boolean(
                data.is_completed
            );



        // ==================================================
        // PC 언젠가 할 일
        // ==================================================

        const desktopSomedayItem =
            document.querySelector(
                `[data-desktop-someday-id="${somedayId}"]`
            );


        if (
            desktopSomedayItem
        ) {


            // 정렬용 데이터 갱신

            desktopSomedayItem.dataset.completed =
                isCompleted
                    ? '1'
                    : '0';



            // 제목 스타일 변경

            const titleElement =
                desktopSomedayItem.querySelector(
                    `#desktop-someday-title-${somedayId}`
                );


            if (
                titleElement
            ) {


                titleElement.classList.remove(
                    'line-through',
                    'text-gray-400',
                    'text-gray-800'
                );


                if (
                    isCompleted
                ) {

                    titleElement.classList.add(
                        'line-through',
                        'text-gray-400'
                    );

                }

                else {

                    titleElement.classList.add(
                        'text-gray-800'
                    );

                }

            }


        }



        // ==================================================
        // 모바일 카드
        // ==================================================

        const mobileCard =
            document.querySelector(
                `[data-someday-id="${somedayId}"]`
            );


        if (
            mobileCard
        ) {


            const mobileButton =
                mobileCard.querySelector(
                    '[data-someday-toggle]'
                );


            const mobileTitle =
                mobileCard.querySelector(
                    `#someday-title-${somedayId}`
                );


            if (
                typeof UpdateSomedayCard === 'function'
            ) {


                UpdateSomedayCard(
                    mobileCard,
                    mobileButton,
                    mobileTitle,
                    isCompleted
                );

            }



            const mobileSomedayItem =
                document.querySelector(
                    `[data-mobile-someday-id="${somedayId}"]`
                );


            if (
                mobileSomedayItem
            ) {

                mobileSomedayItem.dataset.completed =
                    isCompleted
                        ? '1'
                        : '0';

            }


        }



        // ==================================================
        // 통계
        // ==================================================

        updateSomedayStats(data);



        // ==================================================
        // 정렬
        // DOM 반영 후 실행
        // ==================================================

        setTimeout(
            () => {


                if (
                    typeof sortSomedayTodoList === 'function'
                ) {

                    sortSomedayTodoList();

                }



                if (
                    typeof sortMobileSomedayTodoList === 'function'
                ) {

                    sortMobileSomedayTodoList();

                }


            },
            50
        );


    })


    .catch(error => {


        console.error(
            '언젠가 할 일 오류:',
            error
        );


        alert(
            error.message
        );


    });

}


// PC 통계 즉시 갱신
function updatePcStats(
    data
) {

    const todoProgress =
        document.getElementById(
            'todo-progress'
        );


    if (todoProgress) {

        todoProgress.textContent =
            `${data.selected_completed_count}/${data.selected_total_count} 완료`;

    }


    const totalCount =
        document.getElementById(
            'pc-total-count'
        );


    const completedCount =
        document.getElementById(
            'pc-completed-count'
        );


    const completionRate =
        document.getElementById(
            'pc-completion-rate'
        );


    const completionBar =
        document.getElementById(
            'pc-completion-bar'
        );


    if (totalCount) {

        totalCount.textContent =
            data.monthly_total_count;

    }


    if (completedCount) {

        completedCount.textContent =
            data.monthly_completed_count;

    }


    if (completionRate) {

        completionRate.textContent =
            `${data.monthly_completion_rate}%`;

    }


    if (completionBar) {

        completionBar.style.width =
            `${data.monthly_completion_rate}%`;

    }


    if (
        Array.isArray(
            data.monthly_tag_stats
        )
    ) {

        data.monthly_tag_stats.forEach(
            tag => {

                const countElement =
                    document.getElementById(
                        `pc-tag-${tag.code}-count`
                    );


                const barElement =
                    document.getElementById(
                        `pc-tag-${tag.code}-bar`
                    );


                if (countElement) {

                    countElement.textContent =
                        `${tag.completed}/${tag.total}`;

                }


                if (barElement) {

                    barElement.style.width =
                        `${tag.rate}%`;

                }

            }
        );

    }


    if (
        Array.isArray(
            data.monthly_priority_stats
        )
    ) {

        data.monthly_priority_stats.forEach(
            priority => {

                const totalElement =
                    document.getElementById(
                        `pc-priority-${priority.code}-total`
                    );


                const completedElement =
                    document.getElementById(
                        `pc-priority-${priority.code}-completed`
                    );


                if (totalElement) {

                    totalElement.textContent =
                        priority.total;

                }


                if (completedElement) {

                    completedElement.textContent =
                        `${priority.completed}완료`;

                }

            }
        );

    }

}


// ============================================================
// 모바일 오늘 할 일 통계
// ============================================================

function updateMobileStats(
    data
) {

    const mobileProgress =
        document.getElementById(
            'mobile-progress'
        );


    if (mobileProgress) {

        mobileProgress.textContent =
            `${data.selected_completed_count}/${data.selected_total_count}`;

    }

}


// ============================================================
// 언젠가 할 일 통계
// ============================================================

function updateSomedayStats(
    data
) {

    const totalCount =
        Number(
            data.someday_total_count || 0
        );


    const completedCount =
        Number(
            data.someday_completed_count || 0
        );


    // PC

    const desktopProgress =
        document.getElementById(
            'desktopSomedayProgress'
        );


    if (desktopProgress) {

        desktopProgress.textContent =
            `${completedCount}/${totalCount} 완료`;

    }


    // 모바일

    const mobileProgress =
        document.getElementById(
            'someday-progress'
        );


    if (mobileProgress) {

        mobileProgress.textContent =
            `${completedCount}/${totalCount}`;

    }


    // 기존 전체 개수

    const somedayTodoCount =
        document.getElementById(
            'somedayTodoCount'
        );


    if (somedayTodoCount) {

        somedayTodoCount.textContent =
            totalCount;

    }

}


// ============================================================
// 언젠가 할 일 카드 변경
// ============================================================

function UpdateSomedayCard(
    card,
    button,
    title,
    isCompleted
) {


    if (
        !card ||
        !button ||
        !title
    ) {

        console.warn(
            '언젠가 카드 요소 없음'
        );

        return;

    }



    // ================================================
    // 완료
    // ================================================

    if (isCompleted) {


        card.classList.remove(
            'bg-white'
        );


        card.classList.add(
            'bg-gray-50'
        );



        button.classList.remove(
            'border-2',
            'border-gray-300',
            'bg-white'
        );


        button.classList.add(
            'bg-gray-950',
            'text-white'
        );



        button.innerHTML =
            `
            <i class="fa-solid fa-check text-[10px]"></i>
            `;



        title.classList.remove(
            'text-gray-900',
            'text-gray-800'
        );


        title.classList.add(
            'text-gray-400',
            'line-through'
        );


    }


    // ================================================
    // 미완료
    // ================================================

    else {


        card.classList.remove(
            'bg-gray-50'
        );


        card.classList.add(
            'bg-white'
        );



        button.classList.remove(
            'bg-gray-950',
            'text-white'
        );


        button.classList.add(
            'border-2',
            'border-gray-300',
            'bg-white'
        );



        button.innerHTML =
            '';



        title.classList.remove(
            'text-gray-400',
            'line-through'
        );


        title.classList.add(
            'text-gray-900'
        );


    }


}

// ============================================================
// PC 월 선택
// ============================================================

const bodyElement =
    document.body;


let pcPickerYear =
    Number(
        bodyElement?.dataset.year
    );


function openPcMonthPicker() {

    const picker =
        document.getElementById(
            'pcMonthPicker'
        );


    if (!picker) {

        return;

    }


    picker.classList.remove(
        'hidden'
    );


    updatePcMonthButton();

}


function closePcMonthPicker() {

    const picker =
        document.getElementById(
            'pcMonthPicker'
        );


    if (!picker) {

        return;

    }


    picker.classList.add(
        'hidden'
    );

}


function changePcPickerYear(
    direction
) {

    pcPickerYear +=
        direction;


    const yearElement =
        document.getElementById(
            'pcPickerYear'
        );


    if (yearElement) {

        yearElement.textContent =
            `${pcPickerYear}년`;

    }

}


function updatePcMonthButton() {

    const currentMonth =
        Number(
            document.body.dataset.month
        );


    document
        .querySelectorAll(
            '.pc-month-button'
        )
        .forEach(
            button => {

                const buttonMonth =
                    Number(
                        button.dataset.month
                    );


                if (
                    buttonMonth ===
                    currentMonth
                ) {

                    button.classList.add(
                        'bg-black',
                        'text-white'
                    );

                    button.classList.remove(
                        'bg-gray-100',
                        'text-gray-700'
                    );

                }

                else {

                    button.classList.add(
                        'bg-gray-100',
                        'text-gray-700'
                    );

                    button.classList.remove(
                        'bg-black',
                        'text-white'
                    );

                }

            }
        );

}


function selectPcMonth(
    month
) {

    const monthString =
        String(month)
            .padStart(2, '0');


    const date =
        `${pcPickerYear}-${monthString}-01`;


    window.location.href =
        `/?year=${pcPickerYear}&month=${monthString}&date=${date}`;

}


// ============================================================
// 기간 할 일
// ============================================================

function toggleEndDate() {

    const rangeRadio =
        document.querySelector(
            'input[name="schedule_type"][value="range"]'
        );


    const endDateWrapper =
        document.getElementById(
            'endDateWrapper'
        );


    const endDateInput =
        document.getElementById(
            'endDateInput'
        );


    const dueDateInput =
        document.getElementById(
            'dueDateInput'
        );


    if (
        !rangeRadio ||
        !endDateWrapper ||
        !endDateInput
    ) {

        return;

    }


    if (rangeRadio.checked) {

        endDateWrapper.classList.remove(
            'hidden'
        );


        endDateInput.required =
            true;


        if (dueDateInput) {

            endDateInput.min =
                dueDateInput.value;

        }

    }

    else {

        endDateWrapper.classList.add(
            'hidden'
        );


        endDateInput.required =
            false;


        endDateInput.value =
            '';

    }

}


// ============================================================
// 시작일 변경 시 종료일 최소 날짜 변경
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const dueDateInput =
            document.getElementById(
                'dueDateInput'
            );


        if (dueDateInput) {

            dueDateInput.addEventListener(
                'change',
                function () {

                    const endDateInput =
                        document.getElementById(
                            'endDateInput'
                        );


                    if (endDateInput) {

                        endDateInput.min =
                            this.value;

                    }

                }
            );

        }

    }
);


// ============================================================
// 날짜 선택창
// ============================================================

function openDatePicker(
    inputId
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {

        return;

    }


    if (
        typeof input.showPicker ===
        'function'
    ) {

        try {

            input.showPicker();

            return;

        }

        catch (error) {

            console.warn(
                'showPicker 실행 실패:',
                error
            );

        }

    }


    input.focus();

}


// ============================================================
// 오늘 할 일 정렬
// ============================================================

function sortTodayTodoList() {

    const desktopList =
        document.getElementById(
            'desktopTodoList'
        );


    if (desktopList) {

        SortTodayTodoItems(
            desktopList
        );

    }

}


function SortTodayTodoItems(
    list
) {

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
                '[data-todo-sort-item]'
            )
        );


    items.sort(
        (a, b) => {

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

        }
    );


    items.forEach(
        item => {

            list.appendChild(
                item
            );

        }
    );

}


// ============================================================
// 모바일 오늘 할 일 정렬
// ============================================================

function sortMobileTodayTodoList() {

    const mobileList =
        document.getElementById(
            'mobileTodoList'
        );


    if (!mobileList) {

        return;

    }


    SortMobileTodayTodoItems(
        mobileList
    );

}


function SortMobileTodayTodoItems(
    list
) {

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


            return (
                Number(
                    a.dataset.createdAt || 0
                ) -
                Number(
                    b.dataset.createdAt || 0
                )
            );

        }
    );


    items.forEach(
        item => {

            list.appendChild(
                item
            );

        }
    );

}


// ============================================================
// 언젠가 할 일 정렬
// ============================================================

function sortSomedayTodoList() {

    const list =
        document.getElementById(
            'desktopSomedayTodoList'
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
                '[data-desktop-someday-id]'
            )
        );


    items.sort(
        (a, b) => {

            // 미완료 → 완료

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


            // H → M → L

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


            // 오래 만든 것 → 최근 만든 것

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

        }
    );


    const fragment =
        document.createDocumentFragment();


    items.forEach(
        item => {

            fragment.appendChild(
                item
            );

        }
    );


    list.appendChild(
        fragment
    );

}

// ============================================================
// 모바일 언젠가 할 일 정렬
// ============================================================

function sortMobileSomedayTodoList() {


    const list =
        document.getElementById(
            'somedayTodoList'
        );


    if (!list) {

        return;

    }



    const items =
        Array.from(
            list.querySelectorAll(
                '[data-mobile-someday-sort-item]'
            )
        );



    items.sort(
        (a, b) => {


            const completedA =
                Number(
                    a.dataset.completed || 0
                );


            const completedB =
                Number(
                    b.dataset.completed || 0
                );



            if (
                completedA !== completedB
            ) {

                return (
                    completedA -
                    completedB
                );

            }



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


        }
    );



    items.forEach(
        item => {

            list.appendChild(
                item
            );

        }
    );


}

// ============================================================
// 언젠가 할 일 버튼 이벤트 위임
//
// HTML의 onclick이 빠져도 동작하도록 보강
// ============================================================

document.addEventListener(
    'click',
    function (event) {

        // ------------------------------------------------------
        // 수정
        // ------------------------------------------------------

        const editButton =
            event.target.closest(
                '[data-someday-edit]'
            );


        if (editButton) {

            event.preventDefault();

            openSomedayEditModal(
                editButton
            );

            return;

        }


        // ------------------------------------------------------
        // 삭제
        // ------------------------------------------------------

        const deleteButton =
            event.target.closest(
                '[data-someday-delete]'
            );


        if (deleteButton) {

            event.preventDefault();

            openSomedayDeleteModal(
                deleteButton
            );

            return;

        }

    }
);


// ============================================================
// 모달 ESC 닫기
// ============================================================

document.addEventListener(
    'keydown',
    function (event) {

        if (
            event.key !==
            'Escape'
        ) {

            return;

        }


        closeSomedayEditModal();

        closeSomedayDeleteModal();

        closeSomedayCreateModal();

        closeModal();

    }
);


// ============================================================
// 페이지 로드
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        sortTodayTodoList();

        sortMobileTodayTodoList();

        sortSomedayTodoList();

    }
);