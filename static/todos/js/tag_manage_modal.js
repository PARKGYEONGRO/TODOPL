/* ============================================================
   태그 관리 모달
   ============================================================ */


/* ============================================================
   공통 요소 가져오기
   ============================================================ */

function Get_Tag_Element(ElementId) {

    return document.getElementById(
        ElementId
    );

}


/* ============================================================
   CSRF Token 가져오기
   ============================================================ */

function Get_Csrf_Token(Form = null) {

    /*
        전달받은 Form 안에서 먼저 찾음
    */

    if (Form) {

        const CsrfInput =
            Form.querySelector(
                'input[name="csrfmiddlewaretoken"]'
            );


        if (CsrfInput) {

            return CsrfInput.value;

        }

    }


    /*
        Form이 없거나
        Form 안에서 찾지 못한 경우
        전체 문서에서 검색
    */

    const CsrfInput =
        document.querySelector(
            'input[name="csrfmiddlewaretoken"]'
        );


    if (!CsrfInput) {

        return '';

    }


    return CsrfInput.value;

}


/* ============================================================
   모달 표시
   ============================================================ */

function Show_Tag_Modal(Modal) {

    if (!Modal) {

        return;

    }


    Modal.classList.remove(
        'hidden'
    );


    Modal.classList.add(
        'flex'
    );

}


/* ============================================================
   모달 숨김
   ============================================================ */

function Hide_Tag_Modal(Modal) {

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


/* ============================================================
   태그 관리 모달 열기
   ============================================================ */

function openTagManagementModal() {

    const TagManagementModal =
        Get_Tag_Element(
            'tagManagementModal'
        );


    if (!TagManagementModal) {

        console.error(
            'tagManagementModal을 찾을 수 없습니다.'
        );

        return;

    }


    Show_Tag_Modal(
        TagManagementModal
    );


    document.body.classList.add(
        'overflow-hidden'
    );

}


/* ============================================================
   태그 관리 모달 닫기
   ============================================================ */

function closeTagManagementModal() {

    const TagManagementModal =
        Get_Tag_Element(
            'tagManagementModal'
        );


    if (!TagManagementModal) {

        return;

    }


    /*
        하위 모달 먼저 닫기
    */

    closeTagEditModal();

    closeTagDeleteModal();


    /*
        태그 관리 모달 닫기
    */

    Hide_Tag_Modal(
        TagManagementModal
    );


    document.body.classList.remove(
        'overflow-hidden'
    );


    /*
        현재 페이지 상태를
        서버 데이터와 동기화하기 위해 새로고침
    */

    window.location.reload();

}


/* ============================================================
   태그 수정 모달 열기
   ============================================================ */

function openTagEditModal(
    TagId,
    TagName,
    TagColor
) {

    const Modal =
        Get_Tag_Element(
            'tagEditModal'
        );


    const Form =
        Get_Tag_Element(
            'tagEditForm'
        );


    const NameInput =
        Get_Tag_Element(
            'tag-edit-name'
        );


    if (

        !Modal

        ||

        !Form

        ||

        !NameInput

    ) {

        console.error(
            '태그 수정 모달 요소를 찾을 수 없습니다.'
        );

        return;

    }


    /*
        수정 URL
    */

    Form.action =
        '/tag/update/'
        +
        TagId
        +
        '/';


    /*
        태그 이름
    */

    NameInput.value =
        TagName || '';


    /*
        기존 색상 선택
    */

    const ColorInputs =
        Form.querySelectorAll(
            '.tag-edit-color'
        );


    let IsColorSelected =
        false;


    ColorInputs.forEach(
        function(ColorInput) {

            const IsSelected =
                String(
                    ColorInput.value
                ) ===
                String(
                    TagColor || ''
                );


            ColorInput.checked =
                IsSelected;


            if (IsSelected) {

                IsColorSelected =
                    true;

            }

        }
    );


    /*
        기존 색상이 없으면
        gray를 기본값으로 선택
    */

    if (!IsColorSelected) {

        const GrayInput =
            Form.querySelector(
                '.tag-edit-color[value="gray"]'
            );


        if (GrayInput) {

            GrayInput.checked =
                true;

        }

    }


    Show_Tag_Modal(
        Modal
    );


    document.body.classList.add(
        'overflow-hidden'
    );

}


/* ============================================================
   태그 수정 모달 닫기
   ============================================================ */

function closeTagEditModal() {

    const Modal =
        Get_Tag_Element(
            'tagEditModal'
        );


    Hide_Tag_Modal(
        Modal
    );

}


/* ============================================================
   태그 삭제 확인 모달 열기
   ============================================================ */

function openTagDeleteModal(
    TagId,
    TagName
) {

    const Modal =
        Get_Tag_Element(
            'tagDeleteModal'
        );


    const Form =
        Get_Tag_Element(
            'tagDeleteForm'
        );


    const NameElement =
        Get_Tag_Element(
            'tag-delete-name'
        );


    if (

        !Modal

        ||

        !Form

        ||

        !NameElement

    ) {

        console.error(
            '태그 삭제 모달 요소를 찾을 수 없습니다.'
        );

        return;

    }


    /*
        삭제 URL
    */

    Form.action =
        '/tag/delete/'
        +
        TagId
        +
        '/';


    /*
        태그 이름
    */

    NameElement.textContent =
        TagName || '';


    Show_Tag_Modal(
        Modal
    );


    document.body.classList.add(
        'overflow-hidden'
    );

}


/* ============================================================
   태그 삭제 확인 모달 닫기
   ============================================================ */

function closeTagDeleteModal() {

    const Modal =
        Get_Tag_Element(
            'tagDeleteModal'
        );


    Hide_Tag_Modal(
        Modal
    );

}


/* ============================================================
   서버 응답 JSON 안전하게 읽기
   ============================================================ */

async function Read_Json_Response(
    Response
) {

    const ContentType =
        Response.headers.get(
            'content-type'
        ) || '';


    /*
        JSON 응답
    */

    if (
        ContentType.includes(
            'application/json'
        )
    ) {

        return await Response.json();

    }


    /*
        JSON이 아닌 경우
        서버에서 반환한 내용을 확인
    */

    const Text =
        await Response.text();


    console.error(
        'JSON이 아닌 서버 응답:',
        Text
    );


    return {

        success: false,

        message:
            '서버에서 JSON 응답을 반환하지 않았습니다.'

    };

}


/* ============================================================
   태그 목록 갱신
   ============================================================ */

async function Refresh_Tag_List() {

    const Modal =
        Get_Tag_Element(
            'tagManagementModal'
        );


    if (!Modal) {

        return;

    }


    try {

        const Response =
            await fetch(
                window.location.href,
                {
                    method: 'GET',

                    headers: {

                        'X-Requested-With':
                            'XMLHttpRequest',

                        'Accept':
                            'text/html'

                    },

                    cache:
                        'no-store'

                }
            );


        if (!Response.ok) {

            throw new Error(
                '태그 목록을 가져오지 못했습니다.'
            );

        }


        const Html =
            await Response.text();


        const Parser =
            new DOMParser();


        const NewDocument =
            Parser.parseFromString(
                Html,
                'text/html'
            );


        const NewModal =
            NewDocument.getElementById(
                'tagManagementModal'
            );


        if (!NewModal) {

            throw new Error(
                '새 태그 관리 모달을 찾을 수 없습니다.'
            );

        }


        /*
            현재 태그 관리 모달 내용 교체

            중요:
            tagManagementModal 자체를 교체하지 않고
            내부 내용만 교체한다.
        */

        Modal.innerHTML =
            NewModal.innerHTML;


        /*
            모달 열린 상태 유지
        */

        Show_Tag_Modal(
            Modal
        );


        /*
            배경 스크롤 잠금 유지
        */

        document.body.classList.add(
            'overflow-hidden'
        );


    } catch (Error) {

        console.error(
            '태그 목록 새로고침 오류:',
            Error
        );


        alert(
            '태그 목록을 새로고침하지 못했습니다.'
        );

    }

}


/* ============================================================
   태그 추가
   ============================================================ */

async function Submit_Tag_Create(Form) {

    if (!Form) {

        return;

    }


    const FormDataObject =
        new FormData(
            Form
        );


    const CsrfToken =
        Get_Csrf_Token(
            Form
        );


    if (!CsrfToken) {

        console.error(
            'CSRF Token을 찾을 수 없습니다.'
        );

        alert(
            '보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.'
        );

        return;

    }


    try {

        const Response =
            await fetch(
                Form.action,
                {
                    method: 'POST',

                    headers: {

                        'X-CSRFToken':
                            CsrfToken,

                        'X-Requested-With':
                            'XMLHttpRequest',

                        'Accept':
                            'application/json'

                    },

                    body:
                        FormDataObject

                }
            );


        const Data =
            await Read_Json_Response(
                Response
            );


        if (

            !Response.ok

            ||

            !Data.success

        ) {

            alert(

                Data.message

                ||

                '태그 추가에 실패했습니다.'

            );

            return;

        }


        /*
            입력값 초기화
        */

        Form.reset();


        /*
            gray 기본 선택
        */

        const GrayInput =
            Form.querySelector(
                'input[name="color"][value="gray"]'
            );


        if (GrayInput) {

            GrayInput.checked =
                true;

        }


        /*
            태그 목록 갱신
        */

        await Refresh_Tag_List();


    } catch (Error) {

        console.error(
            '태그 추가 오류:',
            Error
        );


        alert(
            '태그 추가 중 오류가 발생했습니다.'
        );

    }

}


/* ============================================================
   태그 수정
   ============================================================ */

async function Submit_Tag_Update(Form) {

    if (!Form) {

        return;

    }


    const FormDataObject =
        new FormData(
            Form
        );


    const CsrfToken =
        Get_Csrf_Token(
            Form
        );


    if (!CsrfToken) {

        console.error(
            'CSRF Token을 찾을 수 없습니다.'
        );

        alert(
            '보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.'
        );

        return;

    }


    try {

        const Response =
            await fetch(
                Form.action,
                {
                    method: 'POST',

                    headers: {

                        'X-CSRFToken':
                            CsrfToken,

                        'X-Requested-With':
                            'XMLHttpRequest',

                        'Accept':
                            'application/json'

                    },

                    body:
                        FormDataObject

                }
            );


        const Data =
            await Read_Json_Response(
                Response
            );


        if (

            !Response.ok

            ||

            !Data.success

        ) {

            alert(

                Data.message

                ||

                '태그 수정에 실패했습니다.'

            );

            return;

        }


        /*
            수정 모달 닫기
        */

        closeTagEditModal();


        /*
            태그 관리 모달은 유지
        */

        await Refresh_Tag_List();


    } catch (Error) {

        console.error(
            '태그 수정 오류:',
            Error
        );


        alert(
            '태그 수정 중 오류가 발생했습니다.'
        );

    }

}


/* ============================================================
   태그 삭제
   ============================================================ */

async function Submit_Tag_Delete(Form) {

    if (!Form) {

        return;

    }


    const FormDataObject =
        new FormData(
            Form
        );


    const CsrfToken =
        Get_Csrf_Token(
            Form
        );


    if (!CsrfToken) {

        console.error(
            'CSRF Token을 찾을 수 없습니다.'
        );

        alert(
            '보안 토큰을 찾을 수 없습니다. 페이지를 새로고침해 주세요.'
        );

        return;

    }


    try {

        const Response =
            await fetch(
                Form.action,
                {
                    method: 'POST',

                    headers: {

                        'X-CSRFToken':
                            CsrfToken,

                        'X-Requested-With':
                            'XMLHttpRequest',

                        'Accept':
                            'application/json'

                    },

                    body:
                        FormDataObject

                }
            );


        const Data =
            await Read_Json_Response(
                Response
            );


        if (

            !Response.ok

            ||

            !Data.success

        ) {

            alert(

                Data.message

                ||

                '태그 삭제에 실패했습니다.'

            );

            return;

        }


        /*
            삭제 모달 닫기
        */

        closeTagDeleteModal();


        /*
            태그 목록 갱신
        */

        await Refresh_Tag_List();


    } catch (Error) {

        console.error(
            '태그 삭제 오류:',
            Error
        );


        alert(
            '태그 삭제 중 오류가 발생했습니다.'
        );

    }

}


/* ============================================================
   Form Submit 통합 처리
   ============================================================ */

document.addEventListener(
    'submit',
    function(Event) {

        const Form =
            Event.target;


        if (!Form) {

            return;

        }


        /*
            태그 추가
        */

        if (
            Form.matches(
                '#tagManagementModal form[action*="/tag/create/"]'
            )
        ) {

            Event.preventDefault();


            Submit_Tag_Create(
                Form
            );


            return;

        }


        /*
            태그 수정
        */

        if (
            Form.id ===
            'tagEditForm'
        ) {

            Event.preventDefault();


            Submit_Tag_Update(
                Form
            );


            return;

        }


        /*
            태그 삭제
        */

        if (
            Form.id ===
            'tagDeleteForm'
        ) {

            Event.preventDefault();


            Submit_Tag_Delete(
                Form
            );


            return;

        }

    }
);


/* ============================================================
   모달 바깥쪽 클릭
   ============================================================ */

document.addEventListener(
    'click',
    function(Event) {

        const ManagementModal =
            Get_Tag_Element(
                'tagManagementModal'
            );


        const EditModal =
            Get_Tag_Element(
                'tagEditModal'
            );


        const DeleteModal =
            Get_Tag_Element(
                'tagDeleteModal'
            );


        /*
            태그 관리 모달
        */

        if (

            ManagementModal

            &&

            Event.target ===
            ManagementModal

        ) {

            closeTagManagementModal();

            return;

        }


        /*
            태그 수정 모달
        */

        if (

            EditModal

            &&

            Event.target ===
            EditModal

        ) {

            closeTagEditModal();

            return;

        }


        /*
            태그 삭제 모달
        */

        if (

            DeleteModal

            &&

            Event.target ===
            DeleteModal

        ) {

            closeTagDeleteModal();

        }

    }
);


/* ============================================================
   ESC 키
   ============================================================ */

document.addEventListener(
    'keydown',
    function(Event) {

        if (
            Event.key !==
            'Escape'
        ) {

            return;

        }


        const DeleteModal =
            Get_Tag_Element(
                'tagDeleteModal'
            );


        const EditModal =
            Get_Tag_Element(
                'tagEditModal'
            );


        const ManagementModal =
            Get_Tag_Element(
                'tagManagementModal'
            );


        /*
            삭제 모달 우선
        */

        if (

            DeleteModal

            &&

            !DeleteModal.classList.contains(
                'hidden'
            )

        ) {

            closeTagDeleteModal();

            return;

        }


        /*
            수정 모달
        */

        if (

            EditModal

            &&

            !EditModal.classList.contains(
                'hidden'
            )

        ) {

            closeTagEditModal();

            return;

        }


        /*
            태그 관리 모달
        */

        if (

            ManagementModal

            &&

            !ManagementModal.classList.contains(
                'hidden'
            )

        ) {

            closeTagManagementModal();

        }

    }
);


/* ============================================================
   태그 관리 모달 자동 열기
   ============================================================ */

document.addEventListener(
    'DOMContentLoaded',
    function() {

        const UrlParams =
            new URLSearchParams(
                window.location.search
            );


        const IsTagManagementOpen =
            UrlParams.get(
                'tag_management'
            );


        if (
            IsTagManagementOpen ===
            '1'
        ) {

            openTagManagementModal();

        }

    }
);