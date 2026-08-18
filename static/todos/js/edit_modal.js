console.log('edit_modal.js 로드됨');

/*
============================================================
Todo 수정 모달
============================================================
*/

/*
============================================================
수정 모달 열기
============================================================
*/

window.openEditModal = function(button) {

    const modal =
        document.getElementById(
            'editModal'
        );


    const form =
        document.getElementById(
            'editForm'
        );


    if (!modal || !form) {

        console.error(
            '수정 모달 요소를 찾을 수 없습니다.'
        );

        return;

    }


    // ========================================================
    // data-* 값
    // ========================================================

    const id =
        button.dataset.id;


    const title =
        button.dataset.title;


    // 중요:
    // data-tag에는 Tag 이름이 아니라 Tag.id가 들어와야 함
    const tagId =
        button.dataset.tag;


    const priority =
        button.dataset.priority;


    const dueDate =
        button.dataset.date;


    const endDate =
        button.dataset.endDate;


    const scheduleType =
        button.dataset.scheduleType;


    // ========================================================
    // Form Action
    // ========================================================

    form.action =
        `/edit/${id}/`;


    // ========================================================
    // 기본 값
    // ========================================================

    document.getElementById(
        'edit-title'
    ).value =
        title || '';


    document.getElementById(
        'edit-tag'
    ).value =
        tagId || '';


    document.getElementById(
        'edit-priority'
    ).value =
        priority || 'M';


    document.getElementById(
        'edit-due_date'
    ).value =
        dueDate || '';


    document.getElementById(
        'edit-end_date'
    ).value =
        endDate || '';


    // ========================================================
    // 일정 유형
    // ========================================================

    const singleRadio =
        document.getElementById(
            'edit-schedule-single'
        );


    const rangeRadio =
        document.getElementById(
            'edit-schedule-range'
        );


    if (scheduleType === 'range') {

        if (rangeRadio) {

            rangeRadio.checked =
                true;

        }

    } else {

        if (singleRadio) {

            singleRadio.checked =
                true;

        }

    }


    // ========================================================
    // 종료일 표시
    // ========================================================

    toggleEditEndDate();


    // ========================================================
    // 모달 표시
    // ========================================================

    modal.classList.remove(
        'hidden'
    );


    modal.classList.add(
        'flex'
    );

};


/*
============================================================
수정 모달 닫기
============================================================
*/

window.closeEditModal = function() {

    const modal =
        document.getElementById(
            'editModal'
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

};


/*
============================================================
수정 모달 일정 유형 변경
============================================================
*/

window.toggleEditEndDate = function() {

    const rangeRadio =
        document.getElementById(
            'edit-schedule-range'
        );


    const endDateWrapper =
        document.getElementById(
            'edit-endDateWrapper'
        );


    const endDateInput =
        document.getElementById(
            'edit-end_date'
        );


    const dueDateInput =
        document.getElementById(
            'edit-due_date'
        );


    if (
        !rangeRadio ||
        !endDateWrapper ||
        !endDateInput ||
        !dueDateInput
    ) {

        return;

    }


    if (rangeRadio.checked) {

        // 기간 표시

        endDateWrapper.classList.remove(
            'hidden'
        );


        // 종료일 필수

        endDateInput.required =
            true;


        // 시작일 이전 선택 방지

        endDateInput.min =
            dueDateInput.value;


    } else {

        // 기간 숨김

        endDateWrapper.classList.add(
            'hidden'
        );


        // 종료일 필수 해제

        endDateInput.required =
            false;


        // 하루 Todo에서는 종료일 제거

        endDateInput.value =
            '';

    }

};


/*
============================================================
수정 모달 시작일 변경
→ 종료일 최소 날짜 변경
============================================================
*/

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const dueDateInput =
            document.getElementById(
                'edit-due_date'
            );


        if (!dueDateInput) {

            return;

        }


        dueDateInput.addEventListener(
            'change',
            function () {

                const endDateInput =
                    document.getElementById(
                        'edit-end_date'
                    );


                if (endDateInput) {

                    endDateInput.min =
                        this.value;

                }

            }
        );

    }
);