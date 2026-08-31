// ============================================================
// 비밀번호 재설정 모달
// ============================================================

const passwordResetModal = document.getElementById(
    'passwordResetModal'
);

const passwordResetForm = document.getElementById(
    'passwordResetForm'
);

const passwordResetEmailInput = document.getElementById(
    'passwordResetEmail'
);

const passwordResetSubmitButton = document.getElementById(
    'passwordResetSubmitButton'
);

const passwordResetMessage = document.getElementById(
    'passwordResetMessage'
);


// ============================================================
// CSRF 토큰 가져오기
// ============================================================

function getCookie(name) {

    const CookieValue = document.cookie
        .split('; ')
        .find(
            Row =>
                Row.startsWith(
                    name + '='
                )
        );


    if (!CookieValue) {
        return '';
    }


    return decodeURIComponent(
        CookieValue.split('=')[1]
    );

}


// ============================================================
// 모달 열기
// ============================================================

function openPasswordResetModal() {

    if (!passwordResetModal) {
        return;
    }


    passwordResetModal.classList.remove(
        'hidden'
    );

    passwordResetModal.classList.add(
        'flex'
    );


    passwordResetModal.setAttribute(
        'aria-hidden',
        'false'
    );


    clearPasswordResetForm();


    setTimeout(
        function () {

            if (passwordResetEmailInput) {

                passwordResetEmailInput.focus();

            }

        },
        100
    );

}


// ============================================================
// 모달 닫기
// ============================================================

function closePasswordResetModal() {

    if (!passwordResetModal) {
        return;
    }


    passwordResetModal.classList.add(
        'hidden'
    );

    passwordResetModal.classList.remove(
        'flex'
    );


    passwordResetModal.setAttribute(
        'aria-hidden',
        'true'
    );


    clearPasswordResetForm();

}


// ============================================================
// 비밀번호 재설정 폼 초기화
// ============================================================

function clearPasswordResetForm() {

    if (passwordResetForm) {

        passwordResetForm.reset();

    }


    setPasswordResetMessage(
        '',
        ''
    );


    setPasswordResetSubmitButton(
        false,
        '재설정 이메일 보내기'
    );

}


// ============================================================
// 메시지 표시
// ============================================================

function setPasswordResetMessage(
    message,
    type
) {

    if (!passwordResetMessage) {
        return;
    }


    passwordResetMessage.textContent =
        message;


    passwordResetMessage.classList.remove(
        'text-red-500',
        'text-green-600',
        'text-gray-500'
    );


    if (type === 'success') {

        passwordResetMessage.classList.add(
            'text-green-600'
        );

    } else if (type === 'error') {

        passwordResetMessage.classList.add(
            'text-red-500'
        );

    } else if (type === 'info') {

        passwordResetMessage.classList.add(
            'text-gray-500'
        );

    }

}


// ============================================================
// 버튼 상태 변경
// ============================================================

function setPasswordResetSubmitButton(
    disabled,
    text
) {

    if (!passwordResetSubmitButton) {
        return;
    }


    passwordResetSubmitButton.disabled =
        disabled;


    passwordResetSubmitButton.textContent =
        text;

}


// ============================================================
// 비밀번호 재설정 이메일 전송
// ============================================================

async function sendPasswordResetEmail(
    event
) {

    event.preventDefault();


    if (
        !passwordResetEmailInput ||
        !passwordResetSubmitButton
    ) {

        console.error(
            '비밀번호 재설정 모달 요소를 찾을 수 없습니다.'
        );

        return;

    }


    const email = passwordResetEmailInput.value
        .trim()
        .toLowerCase();


    if (!email) {

        setPasswordResetMessage(
            '이메일 ID를 입력해주세요.',
            'error'
        );

        return;

    }


    setPasswordResetSubmitButton(
        true,
        '전송 중...'
    );


    setPasswordResetMessage(
        '',
        ''
    );


    try {

        const response = await fetch(
            '/password-reset/send/',
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json',

                    'X-CSRFToken':
                        getCookie(
                            'csrftoken'
                        )
                },

                body: JSON.stringify(
                    {
                        email: email
                    }
                )
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.'
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.'
            );

        }


        setPasswordResetMessage(
            data.message ||
            '비밀번호 재설정 이메일을 보냈습니다. 이메일을 확인해주세요.',
            'success'
        );


        console.log(
            '비밀번호 재설정 이메일 전송 완료:',
            email
        );


        setTimeout(
            function () {

                closePasswordResetModal();

            },
            2000
        );


    } catch (error) {

        console.error(
            '비밀번호 재설정 이메일 전송 오류:',
            error
        );


        setPasswordResetMessage(
            error.message ||
            '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.',
            'error'
        );


    } finally {

        setPasswordResetSubmitButton(
            false,
            '재설정 이메일 보내기'
        );

    }

}


// ============================================================
// 이벤트 등록
// ============================================================

if (passwordResetForm) {

    passwordResetForm.addEventListener(
        'submit',
        sendPasswordResetEmail
    );

}


// ============================================================
// ESC 키로 모달 닫기
// ============================================================

document.addEventListener(
    'keydown',
    function (event) {

        if (
            event.key === 'Escape' &&
            passwordResetModal &&
            !passwordResetModal.classList.contains(
                'hidden'
            )
        ) {

            closePasswordResetModal();

        }

    }
);