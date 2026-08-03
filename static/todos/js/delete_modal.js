console.log('delete_modal.js 로드됨');


/*
    ============================================================
    Todo 삭제 모달
    ============================================================
*/


/*
    ============================================================
    삭제 모달 열기
    ============================================================
*/

window.openDeleteModal = function(button) {

    const modal =
        document.getElementById(
            'deleteModal'
        );


    const form =
        document.getElementById(
            'deleteForm'
        );


    const titleElement =
        document.getElementById(
            'deleteTodoTitle'
        );


    if (!modal || !form) {

        console.error(
            '삭제 모달 요소를 찾을 수 없습니다.'
        );

        return;

    }


    /*
        ========================================================
        data-* 값
        ========================================================
    */

    const id =
        button.dataset.id;


    const title =
        button.dataset.title;


    /*
        ========================================================
        Form Action
        ========================================================
    */

    form.action =
        `/delete/${id}/`;


    /*
        ========================================================
        삭제할 Todo 제목 표시
        ========================================================
    */

    if (titleElement) {

        titleElement.textContent =
            title || '';

    }


    /*
        ========================================================
        모달 표시
        ========================================================
    */

    modal.classList.remove(
        'hidden'
    );


    modal.classList.add(
        'flex'
    );

};


/*
    ============================================================
    삭제 모달 닫기
    ============================================================
*/

window.closeDeleteModal = function() {

    const modal =
        document.getElementById(
            'deleteModal'
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