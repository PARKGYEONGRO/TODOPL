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
// 언젠가 할 일 삭제 비동기 처리
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        console.log(
            '언젠가 삭제 Form 이벤트 연결 시작'
        );


        const Form =
            document.getElementById(
                'somedayDeleteForm'
            );


        if (!Form) {

            console.warn(
                'somedayDeleteForm을 찾을 수 없습니다.'
            );

            return;

        }


        console.log(
            'somedayDeleteForm 발견'
        );


        Form.addEventListener(
            'submit',
            async function (Event) {

                // ★★★ 가장 중요
                Event.preventDefault();


                console.log(
                    '언젠가 삭제 submit 가로챔'
                );


                const Action =
                    Form.action;


                console.log(
                    '삭제 요청 URL:',
                    Action
                );


                try {

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
                                }
                            }
                        );


                    const ResponseText =
                        await Response.text();


                    console.log(
                        '삭제 응답:',
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
                            '언젠가 할 일 삭제에 실패했습니다.'
                        );

                    }


                    // ==================================================
                    // 삭제된 Todo ID
                    // ==================================================

                    const SomedayId =
                        Data.someday_id;


                    console.log(
                        '삭제된 언젠가 Todo ID:',
                        SomedayId
                    );


                    // ==================================================
                    // PC 목록에서 제거
                    // ==================================================

                    const DesktopItem =
                        document.querySelector(
                            `[data-desktop-someday-id="${SomedayId}"]`
                        );


                    if (DesktopItem) {

                        DesktopItem.remove();

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

                    closeSomedayDeleteModal();


                    // ==================================================
                    // 목록이 비었을 경우
                    // ==================================================

                    const DesktopList =
                        document.getElementById(
                            'desktopSomedayTodoList'
                        );


                    if (
                        DesktopList &&
                        !DesktopList.querySelector(
                            '[data-desktop-someday-id]'
                        )
                    ) {

                        DesktopList.innerHTML =
                            `
                            <div
                                class="text-center py-8 text-gray-400">

                                등록된 언젠가 할 일이 없습니다.

                                오른쪽 위

                                <b class="text-black">
                                    + 할 일 추가
                                </b>

                                버튼을 눌러보세요! 🚀

                            </div>
                            `;

                    }


                }

                catch (Error) {

                    console.error(
                        '언젠가 할 일 삭제 오류:',
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

