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

    if (Form) {

        const FormCsrfInput =
            Form.querySelector(
                'input[name="csrfmiddlewaretoken"]'
            );


        if (FormCsrfInput) {

            return FormCsrfInput.value;

        }

    }


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
   모달 표시 / 숨김 공통 함수
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


    Form.action =
        '/tag/update/'
        +
        TagId
        +
        '/';


    NameInput.value =
        TagName || '';


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
                )
                ===
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


    Form.action =
        '/tag/delete/'
        +
        TagId
        +
        '/';


    NameElement.textContent =
        TagName || '';


    Show_Tag_Modal(
        Modal
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

async function Read_Json_Response(Response) {

    const ContentType =
        Response.headers.get(
            'content-type'
        ) || '';


    if (
        ContentType.includes(
            'application/json'
        )
    ) {

        return await Response.json();

    }


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
   태그 ID 문자열 변환
   ============================================================ */

function Get_Tag_Id(TagId) {

    return String(
        TagId
        ||
        ''
    );

}


/* ============================================================
   태그 필터 이름 요소 가져오기
   ============================================================ */

function Get_Tag_Filter_Name_Element(FilterElement) {

    if (!FilterElement) {

        return null;

    }


    return FilterElement.querySelector(
        '[data-tag-filter-name]'
    );

}


/* ============================================================
   태그 수정 DOM 공통 갱신

   모든 태그 표시 요소:
   data-tag-id="{{ todo.tag.id }}"

   모든 태그 필터:
   data-tag-filter-item
   data-tag-filter-id="{{ tag.id }}"
   data-tag-filter-name
   ============================================================ */

function Update_Tag_Dom(TagData) {

    if (!TagData) {

        return;

    }


    const TagId =
        Get_Tag_Id(
            TagData.id
        );


    const TagName =
        TagData.name
        ||
        '기타';


    if (!TagId) {

        return;

    }


    document
        .querySelectorAll(
            '[data-tag-id]'
        )
        .forEach(
            function(TagElement) {

                const ElementTagId =
                    Get_Tag_Id(
                        TagElement.dataset.tagId
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


    document
        .querySelectorAll(
            '[data-tag-filter-item]'
        )
        .forEach(
            function(FilterElement) {

                const FilterTagId =
                    Get_Tag_Id(
                        FilterElement.dataset.tagFilterId
                    );


                if (
                    FilterTagId !==
                    TagId
                ) {

                    return;

                }


                const NameElement =
                    Get_Tag_Filter_Name_Element(
                        FilterElement
                    );


                if (NameElement) {

                    NameElement.textContent =
                        TagName;

                    return;

                }


                FilterElement.textContent =
                    TagName;

            }
        );

}


/* ============================================================
   태그 필터 추가
   ============================================================ */

function Add_Tag_Filter_Dom(TagData) {

    if (!TagData) {

        return;

    }


    const TagId =
        Get_Tag_Id(
            TagData.id
        );


    const TagName =
        TagData.name
        ||
        '기타';


    if (!TagId) {

        return;

    }


    let IsAlreadyAdded =
        false;


    document
        .querySelectorAll(
            '[data-tag-filter-item]'
        )
        .forEach(
            function(FilterElement) {

                const FilterTagId =
                    Get_Tag_Id(
                        FilterElement.dataset.tagFilterId
                    );


                if (
                    FilterTagId !==
                    TagId
                ) {

                    return;

                }


                IsAlreadyAdded =
                    true;

            }
        );


    if (IsAlreadyAdded) {

        Update_Tag_Dom(
            TagData
        );

        return;

    }


    const ExistingFilter =
        document.querySelector(
            '[data-tag-filter-item]'
        );


    const FilterList =
        document.querySelector(
            '[data-tag-filter-list]'
        )
        ||
        (
            ExistingFilter
            ?
            ExistingFilter.parentElement
            :
            null
        );


    if (!FilterList) {

        return;

    }


    let NewFilter;


    if (ExistingFilter) {

        NewFilter =
            ExistingFilter.cloneNode(
                true
            );


        const Url =
            new URL(
                window.location.href
            );


        Url.searchParams.set(
            'tag',
            TagId
        );


        NewFilter.href =
            Url.toString();

    } else {

        NewFilter =
            document.createElement(
                'a'
            );


        const Url =
            new URL(
                window.location.href
            );


        Url.searchParams.set(
            'tag',
            TagId
        );


        NewFilter.href =
            Url.toString();


        NewFilter.className =
            'px-2.5 py-1 rounded text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200';

    }


    NewFilter.setAttribute(
        'data-tag-filter-item',
        ''
    );


    NewFilter.dataset.tagFilterId =
        TagId;


    const NameElement =
        Get_Tag_Filter_Name_Element(
            NewFilter
        );


    if (NameElement) {

        NameElement.textContent =
            TagName;

    } else {

        NewFilter.textContent =
            TagName;

    }


    FilterList.appendChild(
        NewFilter
    );

}


/* ============================================================
   태그 삭제 DOM 공통 갱신

   - 같은 data-tag-id를 가진 모든 표시 요소 → 기타
   - data-tag-id 제거
   - 수정 버튼 등에 남아 있는 data-tag 제거
   - 해당 태그 필터 제거
   ============================================================ */

function Remove_Tag_Dom(DeletedTagId) {

    const TagId =
        Get_Tag_Id(
            DeletedTagId
        );


    if (!TagId) {

        return;

    }


    document
        .querySelectorAll(
            '[data-tag-id]'
        )
        .forEach(
            function(TagElement) {

                const ElementTagId =
                    Get_Tag_Id(
                        TagElement.dataset.tagId
                    );


                if (
                    ElementTagId !==
                    TagId
                ) {

                    return;

                }


                TagElement.textContent =
                    '기타';


                TagElement.removeAttribute(
                    'data-tag-id'
                );

            }
        );


    document
        .querySelectorAll(
            '[data-tag]'
        )
        .forEach(
            function(TagElement) {

                const ElementTagId =
                    Get_Tag_Id(
                        TagElement.dataset.tag
                    );


                if (
                    ElementTagId !==
                    TagId
                ) {

                    return;

                }


                TagElement.removeAttribute(
                    'data-tag'
                );

            }
        );


    document
        .querySelectorAll(
            '[data-tag-filter-item]'
        )
        .forEach(
            function(FilterElement) {

                const FilterTagId =
                    Get_Tag_Id(
                        FilterElement.dataset.tagFilterId
                    );


                if (
                    FilterTagId !==
                    TagId
                ) {

                    return;

                }


                FilterElement.remove();

            }
        );

}


/* ============================================================
   태그 목록 갱신

   태그 관리 모달 내부 목록 갱신 전용
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


        Modal.innerHTML =
            NewModal.innerHTML;


        Show_Tag_Modal(
            Modal
        );


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


        if (Data.tag) {

            Add_Tag_Filter_Dom(
                Data.tag
            );

        }


        Form.reset();


        const GrayInput =
            Form.querySelector(
                'input[name="color"][value="gray"]'
            );


        if (GrayInput) {

            GrayInput.checked =
                true;

        }


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


        if (Data.tag) {

            Update_Tag_Dom(
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
            Get_Tag_Id(
                Data.tag_id
                ||
                Data.deleted_tag_id
            );


        if (DeletedTagId) {

            Remove_Tag_Dom(
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


/* ============================================================
   Form Submit 통합 처리
   ============================================================ */

document.addEventListener(
    'submit',
    function(Event) {

        const Form =
            Event.target;


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


        if (
            Form.id ===
            'tagDeleteForm'
        ) {

            Event.preventDefault();


            Submit_Tag_Delete(
                Form
            );

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


        if (

            ManagementModal

            &&

            Event.target ===
            ManagementModal

        ) {

            closeTagManagementModal();

            return;

        }


        if (

            EditModal

            &&

            Event.target ===
            EditModal

        ) {

            closeTagEditModal();

            return;

        }


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