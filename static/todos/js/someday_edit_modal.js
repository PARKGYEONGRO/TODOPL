console.log('someday_edit_modal.js 로드됨');
// ============================================================
// 언젠가 할 일 수정 모달
// ============================================================

function openSomedayEditModal(button) {


    const id =
        button.dataset.id;


    const title =
        button.dataset.title;


    const tag =
        button.dataset.tag;


    const priority =
        button.dataset.priority;



    console.log(
        '수정 데이터:',
        id,
        title,
        tag,
        priority
    );


    document.getElementById(
        'someday-edit-title'
    ).value = title;



    document.getElementById(
        'someday-edit-tag'
    ).value = tag;



    const priorityRadio =
        document.querySelector(
            `input[name="priority"][value="${priority}"]`
        );


    if(priorityRadio){

        priorityRadio.checked = true;

    }



    const form =
        document.getElementById(
            'somedayEditForm'
        );


    form.action =
        `/someday/edit/${id}/`;



    const Modal =
        document.getElementById(
            'somedayEditModal'
        );


    Modal.classList.remove(
        'hidden'
    );


    Modal.classList.add(
        'flex'
    );


    // 우선순위 설정
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



    priorityH.checked = false;
    priorityM.checked = false;
    priorityL.checked = false;



    if (
        priority === 'H'
    ) {

        priorityH.checked = true;

    }

    else if (
        priority === 'M'
    ) {

        priorityM.checked = true;

    }

    else if (
        priority === 'L'
    ) {

        priorityL.checked = true;

    }
}


// ============================================================
// 언젠가 할 일 수정 모달 닫기
// ============================================================

function closeSomedayEditModal() {

    const Modal = document.getElementById(
        'somedayEditModal'
    );


    if (!Modal) {

        return;

    }


    Modal.classList.add(
        'hidden'
    );

    Modal.classList.remove(
        'flex'
    );

}


// ============================================================
// 언젠가 할 일 수정 비동기 처리
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        console.log(
            '언젠가 수정 Form 이벤트 연결 시작'
        );


        const Form =
            document.getElementById(
                'somedayEditForm'
            );


        if (!Form) {

            console.warn(
                'somedayEditForm을 찾을 수 없습니다.'
            );

            return;

        }


        console.log(
            'somedayEditForm 발견'
        );


        Form.addEventListener(
            'submit',
            async function (Event) {

                // 기본 Form 제출 방지
                Event.preventDefault();


                console.log(
                    '언젠가 수정 submit 가로챔'
                );


                const Action =
                    Form.action;


                console.log(
                    '수정 요청 URL:',
                    Action
                );


                try {

                    const FormDataObject =
                        new FormData(
                            Form
                        );


                    const Response =
                        await fetch(
                            Action,
                            {
                                method: 'POST',

                                headers: {
                                    'X-CSRFToken':
                                        getCsrfToken(),

                                    'X-Requested-With':
                                        'XMLHttpRequest'
                                },

                                body:
                                    FormDataObject
                            }
                        );


                    const ResponseText =
                        await Response.text();


                    console.log(
                        '수정 응답:',
                        Response.status,
                        ResponseText
                    );


                    const ContentType =
                        Response.headers.get(
                            'content-type'
                        ) || '';


                    if (
                        !ContentType.includes(
                            'application/json'
                        )
                    ) {

                        throw new Error(
                            '서버가 JSON이 아닌 응답을 반환했습니다.'
                        );

                    }


                    const Data =
                        JSON.parse(
                            ResponseText
                        );


                    if (
                        !Response.ok ||
                        Data.status !== 'success'
                    ) {

                        throw new Error(
                            Data.message ||
                            '언젠가 할 일 수정에 실패했습니다.'
                        );

                    }


                    // ==================================================
                    // 수정된 데이터
                    // ==================================================

                    const SomedayTodo =
                        Data.todo_someday;


                    const SomedayId =
                        SomedayTodo.id;


                    console.log(
                        '수정된 언젠가 Todo:',
                        SomedayTodo
                    );


                    const DesktopItem =
                        document.querySelector(
                            `[data-desktop-someday-id="${SomedayId}"]`
                        );


                    if (DesktopItem) {


                        // ------------------------------------------
                        // 정렬용 데이터
                        // ------------------------------------------

                        DesktopItem.dataset.completed =
                            SomedayTodo.is_completed
                                ? '1'
                                : '0';


                        DesktopItem.dataset.priority =
                            SomedayTodo.priority;



                        // ------------------------------------------
                        // 제목
                        // ------------------------------------------

                        const TitleElement =
                            DesktopItem.querySelector(
                                `#desktop-someday-title-${SomedayId}`
                            );


                        if (TitleElement) {

                            TitleElement.textContent =
                                SomedayTodo.title;

                        }



                        // ------------------------------------------
                        // 태그
                        // ------------------------------------------

                        const TagElements =
                            DesktopItem.querySelectorAll(
                                '.border.border-gray-200.text-gray-500'
                            );


                        if (
                            TagElements.length > 0
                        ) {

                            TagElements[0].textContent =
                                SomedayTodo.tag.name;

                        }



                        // ------------------------------------------
                        // 우선순위
                        // ------------------------------------------

                        const PriorityElement =
                            DesktopItem.querySelector(
                                '.px-2.py-0\\.5.text-xs.font-bold.rounded-full'
                            );


                        if (PriorityElement) {


                            PriorityElement.classList.remove(
                                'bg-red-100',
                                'text-red-600',
                                'border-red-200',

                                'bg-amber-100',
                                'text-amber-600',
                                'border-amber-200',

                                'bg-green-100',
                                'text-green-600',
                                'border-green-200'
                            );


                            if (
                                SomedayTodo.priority ===
                                'H'
                            ) {

                                PriorityElement.textContent =
                                    '높음';


                                PriorityElement.classList.add(
                                    'bg-red-100',
                                    'text-red-600',
                                    'border-red-200'
                                );

                            }

                            else if (
                                SomedayTodo.priority ===
                                'M'
                            ) {

                                PriorityElement.textContent =
                                    '보통';


                                PriorityElement.classList.add(
                                    'bg-amber-100',
                                    'text-amber-600',
                                    'border-amber-200'
                                );

                            }

                            else {

                                PriorityElement.textContent =
                                    '낮음';


                                PriorityElement.classList.add(
                                    'bg-green-100',
                                    'text-green-600',
                                    'border-green-200'
                                );

                            }

                        }



                        // ------------------------------------------
                        // 우선순위 왼쪽 막대
                        // ------------------------------------------

                        const PriorityBar =
                            DesktopItem.querySelector(
                                '.w-1.h-5.rounded-full'
                            );


                        if (PriorityBar) {

                            PriorityBar.classList.remove(
                                'bg-red-500',
                                'bg-amber-500',
                                'bg-green-500'
                            );


                            if (
                                SomedayTodo.priority ===
                                'H'
                            ) {

                                PriorityBar.classList.add(
                                    'bg-red-500'
                                );

                            }

                            else if (
                                SomedayTodo.priority ===
                                'M'
                            ) {

                                PriorityBar.classList.add(
                                    'bg-amber-500'
                                );

                            }

                            else {

                                PriorityBar.classList.add(
                                    'bg-green-500'
                                );

                            }

                        }

                    

                        const EditButton =
                            DesktopItem.querySelector(
                                '[data-someday-edit]'
                            );

                        if (EditButton) {

                            EditButton.dataset.title =
                                SomedayTodo.title;

                            EditButton.dataset.tag =
                                SomedayTodo.tag.id;

                            EditButton.dataset.priority =
                                SomedayTodo.priority;

                        }


                        const DeleteButton =
                            DesktopItem.querySelector(
                                '[data-someday-delete]'
                            );


                        if (DeleteButton) {

                            DeleteButton.dataset.title =
                                SomedayTodo.title;

                        }

                    }

                    const MobileItem =
                        document.querySelector(
                            `[data-mobile-someday-id="${SomedayId}"]`
                        );


                    if (MobileItem) {

                        // 제목
                        const TitleElement =
                            MobileItem.querySelector(
                                `#someday-title-${SomedayId}`
                            );


                        if (TitleElement) {

                            TitleElement.textContent =
                                SomedayTodo.title;

                        }


                        // 태그
                        const TagElement =
                            MobileItem.querySelector(
                                '.text-\\[10px\\].text-gray-600'
                            );


                        if (TagElement) {

                            TagElement.textContent =
                                SomedayTodo.tag &&
                                SomedayTodo.tag.name
                                    ? SomedayTodo.tag.name
                                    : '기타';

                        }


                        // 우선순위 데이터
                        MobileItem.dataset.priority =
                            SomedayTodo.priority;


                        // 우선순위 막대
                        const PriorityBar =
                            MobileItem.querySelector(
                                '.w-1.h-7.rounded-full'
                            );


                        if (PriorityBar) {

                            PriorityBar.classList.remove(
                                'bg-red-500',
                                'bg-orange-400',
                                'bg-green-500'
                            );


                            if (
                                SomedayTodo.priority === 'H'
                            ) {

                                PriorityBar.classList.add(
                                    'bg-red-500'
                                );

                            }

                            else if (
                                SomedayTodo.priority === 'M'
                            ) {

                                PriorityBar.classList.add(
                                    'bg-orange-400'
                                );

                            }

                            else {

                                PriorityBar.classList.add(
                                    'bg-green-500'
                                );

                            }

                        }


                        // 우선순위 배지
                        const PriorityBadge =
                            MobileItem.querySelector(
                                '.rounded-full.text-xs.font-bold'
                            );


                        if (PriorityBadge) {

                            PriorityBadge.classList.remove(
                                'bg-red-100',
                                'text-red-500',
                                'bg-orange-100',
                                'text-orange-500',
                                'bg-green-100',
                                'text-green-500'
                            );


                            if (
                                SomedayTodo.priority === 'H'
                            ) {

                                PriorityBadge.textContent =
                                    '높음';

                                PriorityBadge.classList.add(
                                    'bg-red-100',
                                    'text-red-500'
                                );

                            }

                            else if (
                                SomedayTodo.priority === 'M'
                            ) {

                                PriorityBadge.textContent =
                                    '보통';

                                PriorityBadge.classList.add(
                                    'bg-orange-100',
                                    'text-orange-500'
                                );

                            }

                            else {

                                PriorityBadge.textContent =
                                    '낮음';

                                PriorityBadge.classList.add(
                                    'bg-green-100',
                                    'text-green-500'
                                );

                            }

                        }


                        // 수정 버튼의 최신 데이터
                        const EditButton =
                            MobileItem.querySelector(
                                '[data-someday-edit]'
                            );


                        if (EditButton) {

                            EditButton.dataset.title =
                                SomedayTodo.title;

                            EditButton.dataset.tag =
                                SomedayTodo.tag &&
                                SomedayTodo.tag.id
                                    ? SomedayTodo.tag.id
                                    : '';

                            EditButton.dataset.priority =
                                SomedayTodo.priority;

                        }


                        // 삭제 버튼의 최신 제목
                        const DeleteButton =
                            MobileItem.querySelector(
                                '[data-someday-delete]'
                            );


                        if (DeleteButton) {

                            DeleteButton.dataset.title =
                                SomedayTodo.title;

                        }

                    }

                    
                    // ==================================================
                    // 통계 갱신
                    // ==================================================

                    if (
                        typeof updateSomedayStats ===
                        'function'
                    ) {

                        updateSomedayStats(
                            Data
                        );

                    }



                    // ==================================================
                    // 모달 닫기
                    // ==================================================

                    closeSomedayEditModal();



                    // ==================================================
                    // 정렬
                    // ==================================================

                    setTimeout(
                        function () {

                            if (
                                typeof sortSomedayTodoList ===
                                'function'
                            ) {

                                sortSomedayTodoList();

                            }

                        },
                        50
                    );


                }

                catch (Error) {

                    console.error(
                        '언젠가 할 일 수정 오류:',
                        Error
                    );


                    alert(
                        Error.message
                    );

                }

            }
        );

    }
);


// ============================================================
// 배경 클릭으로 닫기
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const Modal = document.getElementById(
            'somedayEditModal'
        );


        if (!Modal) {

            return;

        }


        Modal.addEventListener(
            'click',
            function (Event) {

                if (Event.target === Modal) {

                    closeSomedayEditModal();

                }

            }
        );

    }
);


// ============================================================
// ESC 키로 닫기
// ============================================================

document.addEventListener(
    'keydown',
    function (Event) {

        if (Event.key !== 'Escape') {

            return;

        }


        const Modal = document.getElementById(
            'somedayEditModal'
        );


        if (
            Modal &&
            !Modal.classList.contains('hidden')
        ) {

            closeSomedayEditModal();

        }

    }
);