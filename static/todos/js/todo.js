console.log('todo.js 로드됨');


//할 일 추가 모달
function openModal() {

    document
        .getElementById('createModal')
        .classList
        .remove('hidden');

}

function closeModal() {

    document
        .getElementById('createModal')
        .classList
        .add('hidden');

}


// 언젠가 할 일 추가 모달
function openSomedayCreateModal() {

    document
        .getElementById('somedayCreateModal')
        .classList
        .remove('hidden');

}

function closeSomedayCreateModal() {

    document
        .getElementById('somedayCreateModal')
        .classList
        .add('hidden');

}


// Todo 완료 상태 변경
const csrfToken = document.body.dataset.csrf;
// Todo 완료 상태 변경
function toggleTodo(
    todoId,
    selectedTag,
    selectedDate
) {

    const csrfToken =
        document.body.dataset.csrf;


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


        /*
            ========================================
            1. 제목 변경
            ========================================
        */

        const titleElement =
            document.getElementById(
                `todo-title-${todoId}`
            );


        if (titleElement) {

            if (data.is_completed) {

                titleElement.classList.add(
                    'line-through',
                    'text-gray-400'
                );

                titleElement.classList.remove(
                    'text-gray-800',
                    'text-gray-900'
                );

            }

            else {

                titleElement.classList.remove(
                    'line-through',
                    'text-gray-400'
                );

                titleElement.classList.add(
                    'text-gray-800'
                );

            }

        }


        /*
            ========================================
            2. 모바일 카드 배경 변경
            ========================================
        */

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


            /*
                모바일 체크 버튼 변경
            */

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


        /*
            ========================================
            3. PC 오늘 할 일 정렬 데이터 갱신
            ========================================
        */

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


        /*
            ========================================
            4. 모바일 오늘 할 일 정렬 데이터 갱신
            ========================================
        */

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


        /*
            ========================================
            5. 통계 즉시 갱신
            ========================================
        */

        updatePcStats(data);

        updateMobileStats(data);


        /*
            ========================================
            6. PC 오늘 할 일 비동기 정렬
            ========================================
        */

        if (
            typeof sortTodayTodoList === 'function'
        ) {

            sortTodayTodoList();

        }


        /*
            ========================================
            7. 모바일 오늘 할 일 비동기 정렬
            ========================================
        */

        if (
            typeof sortMobileTodayTodoList === 'function'
        ) {

            sortMobileTodayTodoList();

        }

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
function toggleSomedayTodo(somedayId) {

    const csrfToken =
        document.body.dataset.csrf;


    fetch(
        `/someday/toggle/${somedayId}/`,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            }
        }
    )


    .then(response => {

        if (!response.ok) {

            throw new Error(
                '언젠가 할 일 상태 변경에 실패했습니다.'
            );

        }

        return response.json();

    })


    .then(data => {

        if (data.status !== 'success') {

            throw new Error(
                data.message ||
                '상태 변경에 실패했습니다.'
            );

        }


        /*
            ========================================
            모바일 카드
            ========================================
        */

        const mobileCard =
            document.querySelector(
                `[data-someday-id="${somedayId}"]`
            );


        if (mobileCard) {

            const mobileButton =
                mobileCard.querySelector(
                    '[data-someday-toggle]'
                );


            const mobileTitle =
                mobileCard.querySelector(
                    `#someday-title-${somedayId}`
                );


            UpdateSomedayCard(
                mobileCard,
                mobileButton,
                mobileTitle,
                data.is_completed
            );

        }


        /*
            ========================================
            PC 카드
            ========================================
        */

        const desktopCard =
            document.querySelector(
                `[data-desktop-someday-id="${somedayId}"]`
            );


        if (desktopCard) {

            const desktopButton =
                desktopCard.querySelector(
                    '[data-someday-toggle]'
                );


            const desktopTitle =
                desktopCard.querySelector(
                    `#desktop-someday-title-${somedayId}`
                );


            UpdateSomedayCard(
                desktopCard,
                desktopButton,
                desktopTitle,
                data.is_completed
            );


            /*
                정렬용 완료 상태 갱신
            */

            desktopCard.dataset.completed =
                data.is_completed ? '1' : '0';

        }


            
        //언젠가 할 일 정렬 데이터 갱신
        const mobileSomedayItem =
            document.querySelector(
                `[data-mobile-someday-sort-item][data-mobile-someday-id="${somedayId}"]`
            );


        if (mobileSomedayItem) {

            mobileSomedayItem.dataset.completed =
                data.is_completed
                    ? '1'
                    : '0';

        }


        /*
            ========================================
            언젠가 할 일 통계
            ========================================
        */

        updateSomedayStats(data);


        /*
            ========================================
            PC 언젠가 할 일 비동기 정렬
            ========================================
        */

        if (
            typeof sortSomedayTodoList === 'function'
        ) {

            sortSomedayTodoList();

        }


        /*
            ========================================
            모바일 언젠가 할 일 비동기 정렬
            ========================================
        */

        if (
            typeof sortMobileSomedayTodoList === 'function'
        ) {

            sortMobileSomedayTodoList();

        }
    })


    .catch(error => {

        console.error(
            '언젠가 할 일 토글 오류:',
            error
        );


        alert(
            error.message
        );

    });

}


//PC 통계 즉시 갱신
function updatePcStats(data) {
    
    console.log(
        '=============================='
    );
    
    console.log(
        'updatePcStats 실행'
    );
    
    console.log(
        '응답 데이터:',
        data
    );
    
    
    // ==================================================
    // 중앙 완료 현황
    // ==================================================
    
    const todoProgress =
    document.getElementById(
        'todo-progress'
    );
    
    
    if (todoProgress) {
        
        todoProgress.textContent =
        `${data.selected_completed_count}/${data.selected_total_count} 완료`;
        
    }
    
    
    // ==================================================
    // 우측 이번달 기본 통계
    // ==================================================
    
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
    
    
    // ==================================================
    // 태그별 현황
    // ==================================================
    
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
    
    
    // ==================================================
    // 우선순위별 현황
    // ==================================================
    
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
    
    
    console.log(
        '중앙 완료:',
        `${data.selected_completed_count}/${data.selected_total_count}`
    );
    
    
    console.log(
        '이번달 완료:',
        `${data.monthly_completed_count}/${data.monthly_total_count}`
    );
    
    
    console.log(
        'updatePcStats 종료'
    );
    
    console.log(
        '=============================='
    );
    
}

//Mobile 오늘 할 일 즉시 갱신
function updateMobileStats(data) {

    const mobileProgress =
        document.getElementById(
            'mobile-progress'
        );


    if (mobileProgress) {

        mobileProgress.textContent =
            `${data.selected_completed_count}/${data.selected_total_count}`;

    }

}
//Mobile 언젠가 할 일 즉시 갱신
function updateSomedayStats(data) {

    const totalCount =
        data.someday_total_count;


    const completedCount =
        data.someday_completed_count;


    /*
        PC
    */

    const desktopProgress =
        document.getElementById(
            'desktopSomedayProgress'
        );


    if (desktopProgress) {

        desktopProgress.textContent =
            `${completedCount}/${totalCount} 완료`;

    }


    /*
        모바일
    */

    const mobileProgress =
        document.getElementById(
            'someday-progress'
        );


    if (mobileProgress) {

        mobileProgress.textContent =
            `${completedCount}/${totalCount}`;

    }


    /*
        기존 전체 개수
    */

    const somedayTodoCount =
        document.getElementById(
            'somedayTodoCount'
        );


    if (somedayTodoCount) {

        somedayTodoCount.textContent =
            totalCount;

    }

}
//언젠가 할 일 카드 변경
function UpdateSomedayCard(
    card,
    button,
    title,
    isCompleted
) {

    if (!card || !button || !title) {

        return;

    }


    /*
        ========================================
        완료
        ========================================
    */

    if (isCompleted) {

        /*
            카드
        */

        card.classList.remove(
            'bg-white'
        );

        card.classList.add(
            'bg-gray-50'
        );


        /*
            버튼
        */

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
            <i class='fa-solid fa-check text-[10px]'></i>
            `;


        /*
            제목
        */

        title.classList.remove(
            'text-gray-900'
        );

        title.classList.add(
            'text-gray-400',
            'line-through'
        );

    }


    /*
        ========================================
        미완료
        ========================================
    */

    else {

        /*
            카드
        */

        card.classList.remove(
            'bg-gray-50'
        );

        card.classList.add(
            'bg-white'
        );


        /*
            버튼
        */

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


        /*
            제목
        */

        title.classList.remove(
            'text-gray-400',
            'line-through'
        );

        title.classList.add(
            'text-gray-900'
        );

    }

}

//PC 월 선택
const bodyElement =
    document.body;


let pcPickerYear =
    Number(
        bodyElement.dataset.year
    );

//월 선택창 열기
function openPcMonthPicker() {

    const picker =
        document.getElementById(
            'pcMonthPicker'
        );


    picker.classList.remove(
        'hidden'
    );


    updatePcMonthButton();

}


//월 선택창 닫기
function closePcMonthPicker() {

    const picker =
        document.getElementById(
            'pcMonthPicker'
        );


    picker.classList.add(
        'hidden'
    );

}


//연도 변경
function changePcPickerYear(
    direction
) {

    pcPickerYear += direction;


    document.getElementById(
        'pcPickerYear'
    ).textContent =
        `${pcPickerYear}년`;

}


//현재 월 강조
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
                    buttonMonth === currentMonth
                ) {

                    button.classList.add(
                        'bg-black',
                        'text-white'
                    );

                    button.classList.remove(
                        'bg-gray-100',
                        'text-gray-700'
                    );

                } else {

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


//월 선택
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


//기간 할 일
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
        !endDateWrapper
    ) {

        return;

    }


    if (rangeRadio.checked) {

        endDateWrapper.classList.remove(
            'hidden'
        );


        endDateInput.required =
            true;


        endDateInput.min =
            dueDateInput.value;

    } else {

        endDateWrapper.classList.add(
            'hidden'
        );


        endDateInput.required =
            false;


        endDateInput.value =
            '';

    }

}


//시작일 변경 시 종료일 최소 날짜 변경
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


//날짜 선택창 열기
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


    /*
        Chrome 등 showPicker 지원 브라우저
    */

    if (
        typeof input.showPicker === 'function'
    ) {

        try {

            input.showPicker();

            return;

        } catch (error) {

            console.warn(
                'showPicker 실행 실패:',
                error
            );

        }

    }


    /*
        showPicker를 지원하지 않는 경우
        input 자체에 focus
    */

    input.focus();

}


// ============================================================
// 언젠가 할 일 수정 모달
// ============================================================

function openSomedayEditModal(button) {

    const modal =
        document.getElementById(
            'somedayEditModal'
        );


    const form =
        document.getElementById(
            'somedayEditForm'
        );


    const titleInput =
        document.getElementById(
            'someday-edit-title'
        );


    const tagInput =
        document.getElementById(
            'someday-edit-tag'
        );


    const priorityH =
        document.getElementById(
            'someday-edit-priority-H'
        );


    const priorityM =
        document.getElementById(
            'someday-edit-priority-M'
        );


    const priorityL =
        document.getElementById(
            'someday-edit-priority-L'
        );


    if (
        !modal ||
        !form ||
        !titleInput ||
        !tagInput
    ) {

        return;

    }


    const somedayId =
        button.dataset.somedayId;


    const title =
        button.dataset.somedayTitle;


    const tag =
        button.dataset.somedayTag;


    const priority =
        button.dataset.somedayPriority;


    // 제목

    titleInput.value =
        title || '';


    // 태그

    tagInput.value =
        tag || 'WORK';


    // 우선순위

    priorityH.checked =
        priority === 'H';


    priorityM.checked =
        priority === 'M';


    priorityL.checked =
        priority === 'L';


    // Form action

    form.action =
        `/someday/edit/${somedayId}/`;


    // 모달 열기

    modal.classList.remove(
        'hidden'
    );


    modal.classList.add(
        'flex'
    );

}


// ============================================================
// 언젠가 할 일 수정 모달 닫기
// ============================================================

function closeSomedayEditModal() {

    const modal =
        document.getElementById(
            'somedayEditModal'
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
// 언젠가 할 일 삭제 모달
// ============================================================

function openSomedayDeleteModal(button) {

    const modal =
        document.getElementById(
            'somedayDeleteModal'
        );


    const form =
        document.getElementById(
            'somedayDeleteForm'
        );


    const titleElement =
        document.getElementById(
            'somedayDeleteTodoTitle'
        );


    if (
        !modal ||
        !form ||
        !titleElement
    ) {

        return;

    }


    const somedayId =
        button.dataset.somedayId;


    const title =
        button.dataset.somedayTitle;


    // 삭제 대상 제목

    titleElement.textContent =
        title || '';


    // Form action

    form.action =
        `/someday/delete/${somedayId}/`;


    // 모달 열기

    modal.classList.remove(
        'hidden'
    );


    modal.classList.add(
        'flex'
    );

}


// ============================================================
// 언젠가 할 일 삭제 모달 닫기
// ============================================================

function closeSomedayDeleteModal() {

    const modal =
        document.getElementById(
            'somedayDeleteModal'
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


function sortTodayTodoList() {

    /*
        PC 오늘 할 일 목록
    */

    const desktopList =
        document.getElementById(
            'desktopTodoList'
        );


    if (desktopList) {

        SortTodayTodoItems(
            desktopList
        );

    }


    /*
        모바일 오늘 할 일 목록
    */

    const mobileList =
        document.getElementById(
            'mobileTodoList'
        );


    if (mobileList) {

        SortTodayTodoItems(
            mobileList
        );

    }

}


function sortTodayTodoList() {

    const list =
        document.querySelector(
            '.todo-scroll'
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
                '[data-todo-sort-item]'
            )
        );


    items.sort(
        (a, b) => {


            // ========================================
            // 1. 미완료 → 완료
            // ========================================

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


            // ========================================
            // 2. 우선순위
            //
            // H → M → L
            // ========================================

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


            // ========================================
            // 3. 생성일
            //
            // 오래 만든 것 → 최근 만든 것
            // ========================================

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


    // ========================================
    // DOM 재배치
    // ========================================

    items.forEach(
        item => {

            list.appendChild(
                item
            );

        }
    );

}

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

            /*
                1.
                미완료 → 완료
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
                2.
                높음 → 보통 → 낮음
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
                3.
                오래 만든 것 → 최근 만든 것
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

        }
    );


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

//페이지 로드 시 할 일 정렬
document.addEventListener(
    'DOMContentLoaded',
    function () {

        sortTodayTodoList();

        sortSomedayTodoList();

    }
);