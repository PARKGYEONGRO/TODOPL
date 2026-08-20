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


    closeTagEditModal();

    closeTagDeleteModal();


    Hide_Tag_Modal(
        TagManagementModal
    );


    document.body.classList.remove(
        'overflow-hidden'
    );

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
            새로 생성된 태그를
            태그 필터에도 즉시 반영
        */
        const CreatedTag =
            Data.tag;

        if (CreatedTag) {

            Update_Tag_Filter_Dom(
                CreatedTag
            );

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


/*
============================================================
태그 수정
============================================================
*/
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
            태그 수정 성공

            현재 페이지의
            Todo / Someday / 태그 필터를
            전부 즉시 갱신
        */

        if (Data.tag) {

            Update_Tag_Usage_Dom(
                Data.tag
            );

        }


        closeTagEditModal();


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


        const DeletedTagId =
            String(
                Data.tag_id
                ||
                ''
            );


        /*
            Todo / Someday Todo
            삭제된 태그 → 기타
        */

        if (DeletedTagId) {

            Update_Tag_Usage_After_Delete(
                DeletedTagId
            );

        }


        /*
            태그 필터에서 삭제된 태그 제거
        */

        if (DeletedTagId) {

            Remove_Tag_Filter_Dom(
                DeletedTagId
            );

        }


        closeTagDeleteModal();


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


/*
============================================================
태그 변경 후 Todo / Someday / 태그 필터 즉시 갱신
============================================================
*/
function Update_Tag_Usage_Dom(TagData) {

    if (!TagData) {

        return;

    }


    const TagId =
        String(
            TagData.id
        );


    const TagName =
        TagData.name
        ||
        '기본';


    /*
    ========================================================
    Todo / Someday Todo 태그 이름 갱신
    ========================================================
    */

    document
        .querySelectorAll(
            '[data-todo-tag], [data-someday-tag]'
        )
        .forEach(
            function(TagElement) {

                const ElementTagId =
                    String(
                        TagElement.dataset.tagId
                        ||
                        ''
                    );


                if (
                    ElementTagId !==
                    TagId
                ) {

                    return;

                }


                TagElement.textContent =
                    TagName;

            }
        );


    /*
    ========================================================
    태그 필터 이름 갱신
    ========================================================
    */

    document
        .querySelectorAll(
            '[data-tag-filter-item]'
        )
        .forEach(
            function(FilterElement) {

                const FilterTagId =
                    String(
                        FilterElement.dataset.tagFilterId
                        ||
                        ''
                    );


                if (
                    FilterTagId !==
                    TagId
                ) {

                    return;

                }


                const FilterNameElement =
                    FilterElement.querySelector(
                        '[data-tag-filter-name]'
                    );


                if (!FilterNameElement) {

                    return;

                }


                FilterNameElement.textContent =
                    TagName;

            }
        );

}

/*
============================================================
태그 삭제 후 Todo / Someday Todo 갱신
============================================================
*/
function Update_Tag_Usage_After_Delete(
    DeletedTagId
) {

    if (!DeletedTagId) {

        return;

    }


    const TagId =
        String(
            DeletedTagId
        );


    document
        .querySelectorAll(
            '[data-todo-tag], [data-someday-tag]'
        )
        .forEach(
            function(TagElement) {

                const ElementTagId =
                    String(
                        TagElement.dataset.tagId
                        ||
                        ''
                    );


                if (
                    ElementTagId !==
                    TagId
                ) {

                    return;

                }


                /*
                    삭제된 태그를
                    기본 태그 '기타'로 표시
                */

                TagElement.textContent =
                    '기타';


                /*
                    이제 이 요소는
                    삭제된 태그 ID를 더 이상
                    가지고 있지 않도록 초기화
                */

                TagElement.dataset.tagId =
                    '';

            }
        );

}


// ============================================================
// 태그 필터 DOM 즉시 갱신
// ============================================================
function Update_Tag_Filter_Dom(TagData) {

    if (!TagData) {

        return;

    }


    const TagId =
        String(
            TagData.id
        );


    const TagName =
        TagData.name
        ||
        '기타';


    const FilterList =
        document.querySelector(
            '[data-tag-filter-list]'
        );


    if (!FilterList) {

        return;

    }


    /*
        이미 존재하는 태그인지 확인
    */

    const ExistingTag =
        FilterList.querySelector(
            `[data-tag-filter-item][data-tag-filter-id="${TagId}"]`
        );


    if (ExistingTag) {

        ExistingTag.textContent =
            TagName;

        return;

    }


    /*
        현재 URL을 기준으로
        새 태그 필터 링크 생성
    */

    const Url =
        new URL(
            window.location.href
        );


    Url.searchParams.set(
        'tag',
        TagId
    );


    /*
        새 태그 필터 생성
    */

    const TagElement =
        document.createElement(
            'a'
        );


    TagElement.href =
        Url.toString();


    TagElement.setAttribute(
        'data-tag-filter-item',
        ''
    );


    TagElement.setAttribute(
        'data-tag-filter-id',
        TagId
    );


    TagElement.className =
        'px-2.5 py-1 rounded text-sm font-medium transition-colors ' +
        'bg-gray-100 text-gray-600 hover:bg-gray-200';


    TagElement.textContent =
        TagName;


    FilterList.appendChild(
        TagElement
    );

}


// ============================================================
// 태그 필터에서 태그 제거
// ============================================================
function Remove_Tag_Filter_Dom(TagId) {

    if (!TagId) {

        return;

    }


    const FilterElement =
        document.querySelector(
            `[data-tag-filter-item][data-tag-filter-id="${TagId}"]`
        );


    if (!FilterElement) {

        return;

    }


    FilterElement.remove();

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