console.log('someday_delete_modal.js 로드됨');
// ============================================================
// 언젠가 할 일 삭제 모달
// ============================================================

function openSomedayDeleteModal(button){


    const id =
        button.dataset.id;


    const title =
        button.dataset.title;



    console.log(
        '삭제 데이터:',
        id,
        title
    );



    document.getElementById(
        'somedayDeleteTodoTitle'
    ).innerText =
        title;



    const form =
        document.getElementById(
            'somedayDeleteForm'
        );


    form.action =
        `/someday/delete/${id}/`;


    
    const Modal =
        document
            .getElementById(
                'somedayDeleteModal'
            );

    Modal.classList.remove(
        'hidden'
    );
    Modal.classList.add(
        'flex'
    );

}


// ============================================================
// 언젠가 할 일 삭제 모달 닫기
// ============================================================

function closeSomedayDeleteModal() {

    const Modal = document.getElementById(
        'somedayDeleteModal'
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
// 모달 배경 클릭 닫기
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        const Modal = document.getElementById(
            'somedayDeleteModal'
        );


        if (!Modal) {

            return;

        }


        Modal.addEventListener(
            'click',
            function (Event) {

                if (Event.target === Modal) {

                    closeSomedayDeleteModal();

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
            'somedayDeleteModal'
        );


        if (
            Modal &&
            !Modal.classList.contains('hidden')
        ) {

            closeSomedayDeleteModal();

        }

    }
);