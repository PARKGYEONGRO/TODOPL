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
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },

            body: JSON.stringify({
                tag: selectedTag,
                date: selectedDate
            })
        }
    )


    // ========================================================
    // 서버 응답 처리
    // ========================================================

    .then(async response => {

        const contentType =
            response.headers.get(
                'content-type'
            ) || '';


        const responseText =
            await response.text();


        console.log(
            'Todo toggle 응답 상태:',
            response.status
        );


        console.log(
            'Todo toggle 응답:',
            responseText
        );


        // ----------------------------------------------------
        // JSON 응답 여부
        // ----------------------------------------------------

        if (
            !contentType.includes(
                'application/json'
            )
        ) {

            throw new Error(
                `서버가 JSON이 아닌 응답을 반환했습니다. ` +
                `HTTP ${response.status}\n\n` +
                responseText.substring(
                    0,
                    500
                )
            );

        }


        // ----------------------------------------------------
        // JSON 파싱
        // ----------------------------------------------------

        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (error) {

            throw new Error(
                '서버 JSON 응답을 해석할 수 없습니다.'
            );

        }


        // ----------------------------------------------------
        // HTTP 오류
        // ----------------------------------------------------

        if (
            !response.ok
        ) {

            throw new Error(
                data.message ||
                `서버 오류 (${response.status})`
            );

        }


        return data;

    })


    // ========================================================
    // 성공 처리
    // ========================================================

    .then(data => {

        if (
            data.status !==
            'success'
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


        console.log(
            'Todo 변경 성공:',
            data
        );


        // ====================================================
        // PC Todo 제목
        // ====================================================

        const titleElement =
            document.getElementById(
                `todo-title-${todoId}`
            );


        if (
            titleElement
        ) {

            titleElement.classList.remove(
                'line-through',
                'text-gray-400',
                'text-gray-800',
                'text-gray-900'
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


        // ====================================================
        // PC Todo 카드
        // ====================================================

        const pcTodoItem =
            document.querySelector(
                `[data-todo-sort-item][data-todo-id="${todoId}"]`
            );


        if (
            pcTodoItem
        ) {

            // 정렬 데이터

            pcTodoItem.dataset.completed =
                isCompleted
                    ? '1'
                    : '0';


            // PC 카드 제목이 별도의 요소라면
            // 한 번 더 안전하게 처리

            const pcTitle =
                pcTodoItem.querySelector(
                    '[data-todo-title]'
                );


            if (
                pcTitle
            ) {

                pcTitle.classList.remove(
                    'line-through',
                    'text-gray-400',
                    'text-gray-800',
                    'text-gray-900'
                );


                if (
                    isCompleted
                ) {

                    pcTitle.classList.add(
                        'line-through',
                        'text-gray-400'
                    );

                }

                else {

                    pcTitle.classList.add(
                        'text-gray-800'
                    );

                }

            }

        }


        // ====================================================
        // 모바일 Todo 카드
        // ====================================================

        const mobileCard =
            document.getElementById(
                `todo-card-${todoId}`
            );


        if (
            mobileCard
        ) {

            // ----------------------------------------------
            // 카드 배경
            // ----------------------------------------------

            mobileCard.classList.remove(
                'bg-white',
                'bg-gray-50'
            );


            mobileCard.classList.add(
                isCompleted
                    ? 'bg-gray-50'
                    : 'bg-white'
            );


            // ----------------------------------------------
            // 모바일 제목
            // ----------------------------------------------

            const mobileTitle =
                mobileCard.querySelector(
                    `#todo-title-${todoId}`
                );


            if (
                mobileTitle
            ) {

                mobileTitle.classList.remove(
                    'line-through',
                    'text-gray-400',
                    'text-gray-800',
                    'text-gray-900'
                );


                if (
                    isCompleted
                ) {

                    mobileTitle.classList.add(
                        'line-through',
                        'text-gray-400'
                    );

                }

                else {

                    mobileTitle.classList.add(
                        'text-gray-800'
                    );

                }

            }


            // ----------------------------------------------
            // 모바일 완료 버튼
            // ----------------------------------------------

            const mobileButton =
                mobileCard.querySelector(
                    '[data-todo-id]'
                );


            if (
                mobileButton
            ) {

                mobileButton.classList.remove(
                    'border-2',
                    'border-gray-300',
                    'bg-white',
                    'bg-black',
                    'bg-gray-950',
                    'text-white'
                );


                if (
                    isCompleted
                ) {

                    mobileButton.classList.add(
                        'bg-black',
                        'text-white'
                    );


                    mobileButton.innerHTML =
                        `
                        <i
                            class='fa-solid fa-check text-[10px]'>
                        </i>
                        `;

                }

                else {

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


        // ====================================================
        // 모바일 정렬 데이터
        // ====================================================

        const mobileTodayItem =
            document.querySelector(
                `[data-mobile-today-sort-item][data-mobile-todo-id="${todoId}"]`
            );


        if (
            mobileTodayItem
        ) {

            mobileTodayItem.dataset.completed =
                isCompleted
                    ? '1'
                    : '0';

        }


        // ====================================================
        // 오늘 할 일 선택 날짜 통계
        // ====================================================

        updatePcStats(
            data
        );


        updateMobileStats(
            data
        );


        // ====================================================
        // 정렬
        // ====================================================

        sortTodayTodoList();


        sortMobileTodayTodoList();

    })


    // ========================================================
    // 오류
    // ========================================================

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






// ============================================================
// 오늘 할 일 생성
// AJAX 방식
// ============================================================

function CreateTodo(event) {

    if (event) {
        event.preventDefault();
    }


    const form =
        document.getElementById(
            'createTodoForm'
        );


    if (!form) {

        console.error(
            'createTodoForm을 찾을 수 없습니다.'
        );

        return;

    }


    const formData =
        new FormData(
            form
        );


    fetch(
        form.action,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken':
                    getCsrfToken(),

                'X-Requested-With':
                    'XMLHttpRequest'
            },

            body: formData
        }
    )


    .then(
        async response => {

            const contentType =
                response.headers.get(
                    'content-type'
                ) || '';


            // ----------------------------------------
            // JSON 응답이 아닌 경우
            // ----------------------------------------

            if (
                !contentType.includes(
                    'application/json'
                )
            ) {

                const text =
                    await response.text();


                console.error(
                    'JSON이 아닌 응답:',
                    text
                );


                throw new Error(
                    '서버에서 JSON 응답을 받지 못했습니다.'
                );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Todo 생성에 실패했습니다.'
                );

            }


            return data;

        }
    )


    .then(
        data => {

            if (
                data.status !==
                'success'
            ) {

                throw new Error(
                    data.message ||
                    'Todo 생성에 실패했습니다.'
                );

            }


            console.log(
                'Todo 생성 성공'
            );


            // ----------------------------------------
            // 모달 닫기
            // ----------------------------------------

            closeModal();


            // ----------------------------------------
            // 폼 초기화
            // ----------------------------------------

            form.reset();


            // ----------------------------------------
            // JSON 데이터를 화면에 출력하지 않음
            //
            // 새 Todo 카드 HTML은 Django가 다시
            // 렌더링하도록 페이지 새로고침
            // ----------------------------------------

            window.location.reload();

        }
    )


    .catch(
        error => {

            console.error(
                'Todo 생성 오류:',
                error
            );


            alert(
                error.message ||
                'Todo 생성 중 오류가 발생했습니다.'
            );

        }
    );

}


// ============================================================
// Todo 생성 폼 이벤트 연결
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        sortTodayTodoList();

        sortMobileTodayTodoList();

        sortSomedayTodoList();

        sortMobileSomedayTodoList();


        const createForm =
            document.getElementById(
                'createTodoForm'
            );


        if (!createForm) {

            return;

        }


        // 기존 submit 이벤트가 중복 등록되지 않도록
        // 한 번만 연결

        createForm.addEventListener(
            'submit',
            CreateTodo
        );

    }
);



// ============================================================
// 오늘 할 일 삭제
// AJAX 방식으로 삭제 후 현재 화면 새로고침
// ============================================================

function DeleteTodo(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    if (!form) {

        console.error(
            '삭제 폼을 찾을 수 없습니다.'
        );

        return;

    }


    const formData =
        new FormData(
            form
        );


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    // 중복 클릭 방지
    if (submitButton) {

        submitButton.disabled =
            true;

        submitButton.dataset.originalText =
            submitButton.textContent;

        submitButton.textContent =
            '삭제 중...';

    }


    fetch(
        form.action,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken':
                    getCsrfToken(),

                'X-Requested-With':
                    'XMLHttpRequest'
            },

            body: formData
        }
    )


    .then(
        async response => {

            const contentType =
                response.headers.get(
                    'content-type'
                ) || '';


            // JSON 응답인 경우
            if (
                contentType.includes(
                    'application/json'
                )
            ) {

                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        '할 일 삭제에 실패했습니다.'
                    );

                }


                return data;

            }


            // JSON이 아닌 응답이 온 경우
            const text =
                await response.text();


            console.error(
                '삭제 응답이 JSON이 아닙니다:',
                text
            );


            throw new Error(
                '서버에서 올바른 삭제 응답을 받지 못했습니다.'
            );

        }
    )


    .then(
        data => {

            if (
                data.status !==
                'success'
            ) {

                throw new Error(
                    data.message ||
                    '할 일 삭제에 실패했습니다.'
                );

            }


            console.log(
                'Todo 삭제 성공:',
                data
            );


            // 모달 닫기
            closeDeleteModal();


            // 현재 화면 상태 유지
            // 서버에서 삭제된 상태로 다시 렌더링
            window.location.reload();

        }
    )


    .catch(
        error => {

            console.error(
                'Todo 삭제 오류:',
                error
            );


            alert(
                error.message
            );


            // 삭제 버튼 복구
            if (submitButton) {

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    submitButton.dataset.originalText ||
                    '삭제';

            }

        }
    );

}


// ============================================================
// Todo 삭제 폼 이벤트 연결
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const deleteForm =
            document.getElementById(
                'deleteForm'
            );


        if (!deleteForm) {

            return;

        }


        deleteForm.addEventListener(
            'submit',
            DeleteTodo
        );

    }
);




// ============================================================
// 오늘 할 일 수정
// AJAX 방식으로 수정 후 현재 화면 새로고침
// ============================================================

function EditTodo(event) {

    event.preventDefault();


    const form =
        event.currentTarget;


    if (!form) {

        console.error(
            '수정 폼을 찾을 수 없습니다.'
        );

        return;

    }


    if (!form.action) {

        console.error(
            '수정 Form action이 설정되지 않았습니다.'
        );

        alert(
            '수정할 할 일을 찾을 수 없습니다.'
        );

        return;

    }


    const formData =
        new FormData(
            form
        );


    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    // ========================================================
    // 중복 클릭 방지
    // ========================================================

    if (submitButton) {

        submitButton.disabled =
            true;


        submitButton.dataset.originalText =
            submitButton.textContent;


        submitButton.textContent =
            '저장 중...';

    }


    // ========================================================
    // AJAX 요청
    // ========================================================

    fetch(
        form.action,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken':
                    getCsrfToken(),

                'X-Requested-With':
                    'XMLHttpRequest'
            },

            body: formData
        }
    )


    .then(
        async response => {

            const contentType =
                response.headers.get(
                    'content-type'
                ) || '';


            // ------------------------------------------------
            // JSON 응답
            // ------------------------------------------------

            if (
                contentType.includes(
                    'application/json'
                )
            ) {

                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        '할 일 수정에 실패했습니다.'
                    );

                }


                return data;

            }


            // ------------------------------------------------
            // JSON이 아닌 응답
            // ------------------------------------------------

            const text =
                await response.text();


            console.error(
                '수정 응답이 JSON이 아닙니다:',
                text
            );


            throw new Error(
                '서버에서 올바른 수정 응답을 받지 못했습니다.'
            );

        }
    )


    .then(
        data => {

            if (
                data.status !==
                'success'
            ) {

                throw new Error(
                    data.message ||
                    '할 일 수정에 실패했습니다.'
                );

            }


            console.log(
                'Todo 수정 성공:',
                data
            );


            // =================================================
            // 모달 닫기
            // =================================================

            closeEditModal();


            // =================================================
            // 현재 화면 다시 렌더링
            // =================================================
            //
            // 수정된 제목 / 태그 / 우선순위 /
            // 일정 / 날짜 등을 서버 기준으로
            // 다시 렌더링한다.
            //

            window.location.reload();

        }
    )


    .catch(
        error => {

            console.error(
                'Todo 수정 오류:',
                error
            );


            alert(
                error.message
            );


            // =================================================
            // 저장 버튼 복구
            // =================================================

            if (submitButton) {

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    submitButton.dataset.originalText ||
                    '저장';

            }

        }
    );

}


// ============================================================
// Todo 수정 폼 이벤트 연결
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const editForm =
            document.getElementById(
                'editForm'
            );


        if (!editForm) {

            return;

        }


        editForm.addEventListener(
            'submit',
            EditTodo
        );

    }
);



// ============================================================
// 언젠가 할 일 생성
// ============================================================

function SubmitSomedayCreateForm(
    form
) {

    if (!form) {

        return;

    }


    const formData =
        new FormData(
            form
        );


    fetch(
        form.action,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken':
                    getCsrfToken(),

                'X-Requested-With':
                    'XMLHttpRequest'
            },

            body:
                formData
        }
    )
    .then(async response => {

        const contentType =
            response.headers.get(
                'content-type'
            ) || '';

        const responseText =
            await response.text();


        if (
            !contentType.includes(
                'application/json'
            )
        ) {

            throw new Error(
                `서버가 JSON이 아닌 응답을 반환했습니다. ` +
                `HTTP ${response.status}\n\n` +
                responseText.substring(
                    0,
                    500
                )
            );

        }


        let data;

        try {

            data =
                JSON.parse(
                    responseText
                );

        }

        catch (error) {

            throw new Error(
                '서버 JSON 응답을 해석할 수 없습니다.'
            );

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                `서버 오류 (${response.status})`
            );

        }


        return data;

    })
    .then(data => {

        if (
            data.status !== 'success'
        ) {

            throw new Error(
                data.message ||
                '언젠가 할 일 생성에 실패했습니다.'
            );

        }


        // 생성된 Todo 데이터
        const somedayTodo =
            data.todo_someday;


        if (!somedayTodo) {

            throw new Error(
                '생성된 언젠가 할 일 데이터가 없습니다.'
            );

        }


        // ====================================================
        // PC 목록에 추가
        // ====================================================

        AddDesktopSomedayTodo(
            somedayTodo
        );


        // ====================================================
        // 모바일 목록에 추가
        // ====================================================

        AddMobileSomedayTodo(
            somedayTodo
        );


        // ====================================================
        // 통계 갱신
        // ====================================================

        updateSomedayStats(
            data
        );


        // ====================================================
        // 모달 초기화
        // ====================================================

        form.reset();


        closeSomedayCreateModal();


        // ====================================================
        // 정렬
        // ====================================================

        if (
            typeof sortSomedayTodoList ===
            'function'
        ) {

            sortSomedayTodoList();

        }


        if (
            typeof sortMobileSomedayTodoList ===
            'function'
        ) {

            sortMobileSomedayTodoList();

        }

    })
    .catch(error => {

        console.error(
            '언젠가 할 일 생성 오류:',
            error
        );


        alert(
            error.message
        );

    });

}


// ============================================================
// HTML 이스케이프
// ============================================================

function EscapeHtml(value) {

    if (value === null || value === undefined) {

        return '';

    }


    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}



// ============================================================
// PC 언젠가 할 일 추가
// ============================================================

function AddDesktopSomedayTodo(
    somedayTodo
) {

    if (!somedayTodo) {

        return;

    }


    const list =
        document.getElementById(
            'desktopSomedayTodoList'
        );


    if (!list) {

        // console.warn(
        //     'desktopSomedayTodoList 요소가 없습니다.'
        // );

        return;

    }


    const todoId =
        somedayTodo.id;

    const title =
        EscapeHtml(
            somedayTodo.title
        );

    const priority =
        somedayTodo.priority || 'M';

    const isCompleted =
        Boolean(
            somedayTodo.is_completed
        );


    let priorityClass =
        'bg-green-500';


    let priorityText =
        '낮음';


    let priorityBadgeClass =
        'bg-green-100 text-green-600 border-green-200';


    if (priority === 'H') {

        priorityClass =
            'bg-red-500';

        priorityText =
            '높음';

        priorityBadgeClass =
            'bg-red-100 text-red-600 border-red-200';

    }

    else if (priority === 'M') {

        priorityClass =
            'bg-amber-500';

        priorityText =
            '보통';

        priorityBadgeClass =
            'bg-amber-100 text-amber-600 border-amber-200';

    }


    const tagName =
        somedayTodo.tag &&
        somedayTodo.tag.name
            ? EscapeHtml(
                somedayTodo.tag.name
            )
            : '기타';


    const titleClass =
        isCompleted
            ? 'line-through text-gray-400'
            : 'text-gray-800';


    const checked =
        isCompleted
            ? 'checked'
            : '';


    const createdAt =
        somedayTodo.created_at || '';


    const emptyMessage =
        list.querySelector(
            '.text-center'
        );


    if (emptyMessage) {

        emptyMessage.remove();

    }


    const item =
        document.createElement('div');


    item.setAttribute(
        'data-desktop-someday-id',
        todoId
    );


    item.setAttribute(
        'data-completed',
        isCompleted ? '1' : '0'
    );


    item.setAttribute(
        'data-priority',
        priority
    );


    item.setAttribute(
        'data-created-at',
        createdAt
    );


    item.className =
        'flex items-center justify-between p-3 border-b border-gray-100 rounded group bg-white hover:bg-gray-50 transition-colors';


    item.innerHTML = `

        <div
            class='flex items-center gap-3 min-w-0'>

            <div
                class='w-1 h-5 rounded-full flex-shrink-0 ${priorityClass}'>
            </div>


            <input
                type='checkbox'
                id='someday-check-${todoId}'
                ${checked}
                onchange="toggleSomedayTodo('${todoId}')"
                class='w-5 h-5 accent-black rounded cursor-pointer flex-shrink-0'>


            <span
                id='desktop-someday-title-${todoId}'
                class='font-medium truncate ${titleClass}'>

                ${title}

            </span>

        </div>


        <div
            class='flex items-center gap-3 flex-shrink-0'>

            <span
                class='border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded'>

                ${tagName}

            </span>


            <span
                class='px-2 py-0.5 text-xs font-bold rounded-full border ${priorityBadgeClass}'>

                ${priorityText}

            </span>


            <button
                type='button'
                data-someday-edit
                data-id='${todoId}'
                data-title='${title}'
                data-tag='${
                    somedayTodo.tag &&
                    somedayTodo.tag.id
                        ? somedayTodo.tag.id
                        : ''
                }'
                data-priority='${priority}'
                onclick='openSomedayEditModal(this)'
                class='text-gray-400 hover:text-black transition-colors mr-1'>

                <i
                    class='fa-regular fa-pen-to-square'>
                </i>

            </button>


            <button
                type='button'
                data-someday-delete
                data-id='${todoId}'
                data-title='${title}'
                onclick='openSomedayDeleteModal(this)'
                class='text-gray-300 hover:text-red-500 transition-colors'>

                <i
                    class='fa-regular fa-trash-can'>
                </i>

            </button>

        </div>

    `;


    list.appendChild(
        item
    );


    // 새로 추가된 Todo의 정렬
    if (
        typeof sortSomedayTodoList === 'function'
    ) {

        sortSomedayTodoList();

    }

}


// ============================================================
// 모바일 언젠가 할 일 추가
// ============================================================

function AddMobileSomedayTodo(
    somedayTodo
) {

    if (!somedayTodo) {

        return;

    }


    // ========================================================
    // 모바일 언젠가 할 일 목록 찾기
    // ========================================================

    const list =
        document.getElementById(
            'somedayTodoList'
        );


    if (!list) {

        console.warn(
            'somedayTodoList 요소를 찾을 수 없습니다.'
        );

        return;

    }


    console.log(
        '모바일 언젠가 할 일 목록 발견:',
        list
    );

    // ========================================================
    // 데이터
    // ========================================================

    const TodoId =
        somedayTodo.id;


    const Title =
        EscapeHtml(
            somedayTodo.title || ''
        );


    const Priority =
        somedayTodo.priority || 'M';


    const IsCompleted =
        Boolean(
            somedayTodo.is_completed
        );


    const TagId =
        somedayTodo.tag &&
        somedayTodo.tag.id
            ? somedayTodo.tag.id
            : '';


    const TagName =
        somedayTodo.tag &&
        somedayTodo.tag.name
            ? EscapeHtml(
                somedayTodo.tag.name
            )
            : '기타';


    const CreatedAt =
        somedayTodo.created_at || '';


    // ========================================================
    // 우선순위
    // ========================================================

    let PriorityBarClass =
        'bg-green-500';


    if (Priority === 'H') {

        PriorityBarClass =
            'bg-red-500';

    }

    else if (Priority === 'M') {

        PriorityBarClass =
            'bg-orange-400';

    }


    // ========================================================
    // 완료 상태
    // ========================================================

    const CardClass =
        IsCompleted
            ? 'bg-gray-50'
            : 'bg-white';


    const TitleClass =
        IsCompleted
            ? 'text-gray-400 line-through'
            : 'text-gray-900';


    const ToggleButtonClass =
        IsCompleted
            ? 'bg-gray-950 text-white'
            : 'border-2 border-gray-300 bg-white';


    const CheckIcon =
        IsCompleted
            ? '<i class="fa-solid fa-check text-[10px]"></i>'
            : '';


    // ========================================================
    // 우선순위 배지
    // ========================================================

    let PriorityBadgeClass =
        'bg-green-100 text-green-500';


    let PriorityText =
        '낮음';


    if (Priority === 'H') {

        PriorityBadgeClass =
            'bg-red-100 text-red-500';

        PriorityText =
            '높음';

    }

    else if (Priority === 'M') {

        PriorityBadgeClass =
            'bg-orange-100 text-orange-500';

        PriorityText =
            '보통';

    }


    // ========================================================
    // 빈 목록 메시지 제거
    // ========================================================

    const EmptyMessage =
        Array.from(
            list.children
        ).find(
            Element =>
                !Element.hasAttribute(
                    'data-mobile-someday-sort-item'
                )
        );


    if (
        EmptyMessage &&
        EmptyMessage.textContent.includes(
            '아직 등록된 할 일이 없습니다.'
        )
    ) {

        EmptyMessage.remove();

    }


    // ========================================================
    // 카드 생성
    // ========================================================

    const Card =
        document.createElement(
            'div'
        );


    Card.id =
        `someday-card-${TodoId}`;


    Card.setAttribute(
        'data-someday-id',
        TodoId
    );


    Card.setAttribute(
        'data-mobile-someday-sort-item',
        ''
    );


    Card.setAttribute(
        'data-mobile-someday-id',
        TodoId
    );


    Card.setAttribute(
        'data-completed',
        IsCompleted
            ? '1'
            : '0'
    );


    Card.setAttribute(
        'data-priority',
        Priority
    );


    Card.setAttribute(
        'data-created-at',
        CreatedAt
    );


    Card.className =
        `relative flex items-center gap-3 px-3 py-3
        border border-gray-200 rounded-xl
        ${CardClass}`;


    Card.innerHTML = `

        <!-- 우선순위 왼쪽 막대 -->

        <div
            class='w-1 h-7 rounded-full flex-shrink-0
            ${PriorityBarClass}'>
        </div>


        <!-- 완료 체크 -->

        <button
            type='button'

            data-someday-toggle

            onclick='toggleSomedayTodo(${TodoId})'

            class='w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
            ${ToggleButtonClass}'>

            ${CheckIcon}

        </button>


        <!-- 내용 -->

        <div
            class='flex-1 min-w-0'>


            <!-- 제목 -->

            <p
                id='someday-title-${TodoId}'

                class='text-[13px] font-medium
                ${TitleClass}'>

                ${Title}

            </p>


            <!-- 태그 + 우선순위 -->

            <div
                class='flex items-center gap-2 mt-1'>


                <!-- 태그 -->

                <span
                    class='px-2 py-0.5 rounded-md
                        border border-gray-200
                        text-[10px] text-gray-600'>

                    ${TagName}

                </span>


                <!-- 우선순위 -->

                <span
                    class='px-2 py-0.5 rounded-full
                        text-xs font-bold
                        ${PriorityBadgeClass}'>

                    ${PriorityText}

                </span>


            </div>


        </div>


        <!-- 오른쪽 버튼 -->

        <div
            class='flex items-center gap-1'>


            <!-- 수정 -->

            <button
                type='button'

                data-someday-edit

                data-id='${TodoId}'

                data-title='${Title}'

                data-tag='${TagId}'

                data-priority='${Priority}'

                onclick='openSomedayEditModal(this)'

                class='w-9 h-9 rounded-full
                    hover:bg-gray-100
                    flex items-center justify-center'>


                <i
                    class='fa-regular fa-pen-to-square
                        text-[16px] text-gray-500'>
                </i>


            </button>


            <!-- 삭제 -->

            <button
                type='button'

                data-someday-delete

                data-id='${TodoId}'

                data-title='${Title}'

                onclick='openSomedayDeleteModal(this)'

                class='w-9 h-9 rounded-full
                    hover:bg-red-50
                    flex items-center justify-center'>


                <i
                    class='fa-regular fa-trash-can
                        text-[16px] text-gray-400'>
                </i>


            </button>


        </div>

    `;


    // ========================================================
    // 목록에 추가
    // ========================================================

    list.appendChild(
        Card
    );


    // ========================================================
    // 정렬
    // ========================================================

    if (
        typeof sortMobileSomedayTodoList ===
        'function'
    ) {

        sortMobileSomedayTodoList();

    }

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
                        `pc-tag-${tag.id}-count`
                    );


                const barElement =
                    document.getElementById(
                        `pc-tag-${tag.id}-bar`
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

    if (
        !desktopList
    ) {
        return;
    }

    SortTodayTodoItems(
        desktopList
    );
}


function SortTodayTodoItems(
    list
) {

    if (
        !list
    ) {
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
        (
            a,
            b
        ) => {

            // ====================================================
            // 1. 완료 여부
            //
            // 미완료 0 → 완료 1
            // 완료된 Todo는 무조건 아래쪽
            // ====================================================

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


            // ====================================================
            // 2. 직접 입력 시간 여부
            //
            // 시간이 있는 Todo가 먼저
            //
            // 수정 버튼이 아니라
            // Todo 카드 자체의 data-* 값을 사용
            // ====================================================

            const timeManualA =
                a.dataset.timeManual === '1';

            const timeManualB =
                b.dataset.timeManual === '1';


            // ====================================================
            // 3. 둘 다 직접 입력 시간이 있는 경우
            //
            // 빠른 시간 → 늦은 시간
            // ====================================================

            if (
                timeManualA &&
                timeManualB
            ) {

                const timeA =
                    a.dataset.todoTime ||
                    '';

                const timeB =
                    b.dataset.todoTime ||
                    '';


                if (
                    timeA !==
                    timeB
                ) {

                    return timeA.localeCompare(
                        timeB
                    );

                }

            }


            // ====================================================
            // 4. 시간 있음 → 시간 없음
            // ====================================================

            if (
                timeManualA !==
                timeManualB
            ) {

                return timeManualA
                    ? -1
                    : 1;

            }


            // ====================================================
            // 5. 시간 없는 Todo
            //
            // H → M → L
            // ====================================================

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


            // ====================================================
            // 6. 최종 기준
            //
            // 오래 만든 Todo → 최근 Todo
            // ====================================================

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


    // ============================================================
    // DOM 재배치
    // ============================================================

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
