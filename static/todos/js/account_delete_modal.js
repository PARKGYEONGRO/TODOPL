// ============================================================
// 회원 탈퇴 버튼 활성화 검사
// ============================================================

function UpdateWithdrawalButton() {

    const Reason =
        document.getElementById(
            'withdrawalReason'
        );


    const Detail =
        document.getElementById(
            'withdrawalDetail'
        );


    const Confirm =
        document.getElementById(
            'withdrawalConfirm'
        );


    const Identity =
        document.getElementById(
            'withdrawalIdentity'
        );


    const SubmitButton =
        document.getElementById(
            'withdrawalSubmitButton'
        );


    if (
        !Reason ||
        !Detail ||
        !Confirm ||
        !Identity ||
        !SubmitButton
    ) {

        return;

    }


    // 탈퇴 사유
    const IsReasonValid =
        Reason.value.trim() !== '';


    // 상세 사유
    const DetailValue =
        Detail.value.trim();


    const IsDetailValid =
        DetailValue.length >= 10 &&
        DetailValue.length <= 500;


    // 복구 불가 확인
    const IsConfirmValid =
        Confirm.checked;


    // 확인 문구
    const ExpectedIdentity =
        (
            Identity.dataset.expectedIdentity ||
            ''
        ).trim();


    const IdentityValue =
        Identity.value.trim();


    const IsIdentityValid =
        ExpectedIdentity !== '' &&
        IdentityValue !== '' &&
        IdentityValue === ExpectedIdentity;


    // 최종 조건
    const IsValid =
        IsReasonValid &&
        IsDetailValid &&
        IsConfirmValid &&
        IsIdentityValid;


    SubmitButton.disabled =
        !IsValid;

}


// ============================================================
// 회원 탈퇴 모달 열기
// ============================================================

function openAccountDeleteModal() {

    const Modal =
        document.getElementById(
            'accountDeleteModal'
        );


    if (!Modal) {

        return;

    }


    Modal.classList.remove(
        'hidden'
    );


    Modal.classList.add(
        'flex'
    );


    UpdateWithdrawalButton();

}


// ============================================================
// 회원 탈퇴 모달 닫기
// ============================================================

function closeAccountDeleteModal() {

    const Modal =
        document.getElementById(
            'accountDeleteModal'
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
// DOM 로드
// ============================================================
document.addEventListener(
    'DOMContentLoaded',
    function () {

        const Modal =
            document.getElementById(
                'accountDeleteModal'
            );


        const Form =
            document.getElementById(
                'withdrawalForm'
            );


        const Reason =
            document.getElementById(
                'withdrawalReason'
            );


        const Detail =
            document.getElementById(
                'withdrawalDetail'
            );


        const DetailCount =
            document.getElementById(
                'withdrawalDetailCount'
            );


        const Confirm =
            document.getElementById(
                'withdrawalConfirm'
            );


        const Identity =
            document.getElementById(
                'withdrawalIdentity'
            );


        const WithdrawalConfirmText =
            document.getElementById(
                'withdrawalConfirmText'
            );


        // ====================================================
        // Form 존재 여부
        // ====================================================

        if (!Form) {

            return;

        }


        // ====================================================
        // 복구 불가 확인
        // ====================================================

        if (Confirm) {

            Confirm.addEventListener(
                'change',
                function () {

                    if (WithdrawalConfirmText) {

                        if (Confirm.checked) {

                            WithdrawalConfirmText.classList.remove(
                                'text-red-500',
                                'font-medium'
                            );

                            WithdrawalConfirmText.classList.add(
                                'text-gray-500',
                                'font-normal'
                            );

                        }

                        else {

                            WithdrawalConfirmText.classList.remove(
                                'text-gray-500',
                                'font-normal'
                            );

                            WithdrawalConfirmText.classList.add(
                                'text-red-500',
                                'font-medium'
                            );

                        }

                    }


                    UpdateWithdrawalButton();

                }
            );

        }


        // ====================================================
        // 상세 사유 글자 수
        // ====================================================

        if (Detail) {

            Detail.addEventListener(
                'input',
                function () {

                    if (DetailCount) {

                        DetailCount.textContent =
                            `${Detail.value.length} / 500`;

                    }


                    UpdateWithdrawalButton();

                }
            );

        }


        // ====================================================
        // 탈퇴 사유
        // ====================================================

        if (Reason) {

            Reason.addEventListener(
                'change',
                UpdateWithdrawalButton
            );

        }


        // ====================================================
        // 확인 문구
        // ====================================================

        if (Identity) {

            Identity.addEventListener(
                'input',
                UpdateWithdrawalButton
            );

        }


        // ====================================================
        // 배경 클릭
        // ====================================================

        if (Modal) {

            Modal.addEventListener(
                'click',
                function (Event) {

                    if (
                        Event.target === Modal
                    ) {

                        closeAccountDeleteModal();

                    }

                }
            );

        }


        // ====================================================
        // ESC
        // ====================================================

        document.addEventListener(
            'keydown',
            function (Event) {

                if (
                    Event.key !== 'Escape'
                ) {

                    return;

                }


                if (
                    Modal &&
                    !Modal.classList.contains(
                        'hidden'
                    )
                ) {

                    closeAccountDeleteModal();

                }

            }
        );


        // ====================================================
        // 최초 상태 검사
        // ====================================================

        UpdateWithdrawalButton();


        // ====================================================
        // 회원 탈퇴 제출
        // ====================================================

        Form.addEventListener(
            'submit',
            async function (Event) {

                Event.preventDefault();


                try {

                    const Response =
                        await fetch(
                            Form.action,
                            {
                                method: 'POST',

                                body:
                                    new FormData(
                                        Form
                                    ),

                                headers: {
                                    'X-Requested-With':
                                        'XMLHttpRequest'
                                }
                            }
                        );


                    const Data =
                        await Response.json();


                    if (
                        !Response.ok ||
                        !Data.success
                    ) {

                        throw new Error(
                            Data.message ||
                            '회원탈퇴에 실패했습니다.'
                        );

                    }


                    alert(
                        Data.message
                    );


                    window.location.href =
                        Data.redirect_url ||
                        '/login/';

                }

                catch (Error) {

                    console.error(
                        '회원탈퇴 오류:',
                        Error
                    );


                    alert(
                        Error.message ||
                        '회원탈퇴 처리 중 오류가 발생했습니다.'
                    );

                }

            }
        );

    }
);