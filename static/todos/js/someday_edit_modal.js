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