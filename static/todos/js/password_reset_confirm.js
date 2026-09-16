// ============================================================
// 비밀번호 재설정 확인
// ============================================================


const passwordResetConfirmForm =
    document.getElementById(
        'passwordResetConfirmForm'
    );


const newPasswordInput =
    document.getElementById(
        'newPassword'
    );


const newPasswordConfirmInput =
    document.getElementById(
        'newPasswordConfirm'
    );


const passwordMatchMessage =
    document.getElementById(
        'passwordMatchMessage'
    );


const passwordResetConfirmMessage =
    document.getElementById(
        'passwordResetConfirmMessage'
    );


const passwordResetConfirmButton =
    document.getElementById(
        'passwordResetConfirmButton'
    );


// ============================================================
// 메시지 표시
// ============================================================

function setPasswordResetConfirmMessage(
    message,
    type
) {

    if (!passwordResetConfirmMessage) {

        return;

    }


    passwordResetConfirmMessage.textContent =
        message;


    passwordResetConfirmMessage.classList.remove(
        'text-red-500',
        'text-green-600',
        'text-gray-500'
    );


    if (type === 'success') {

        passwordResetConfirmMessage.classList.add(
            'text-green-600'
        );

    } else if (type === 'error') {

        passwordResetConfirmMessage.classList.add(
            'text-red-500'
        );

    } else if (type === 'info') {

        passwordResetConfirmMessage.classList.add(
            'text-gray-500'
        );

    }

}


// ============================================================
// 비밀번호 일치 확인
// ============================================================

function checkPasswordMatch() {

    if (
        !newPasswordInput ||
        !newPasswordConfirmInput ||
        !passwordMatchMessage
    ) {

        return false;

    }


    const newPassword =
        newPasswordInput.value;


    const newPasswordConfirm =
        newPasswordConfirmInput.value;


    passwordMatchMessage.textContent = '';


    passwordMatchMessage.classList.remove(
        'text-red-500',
        'text-green-600'
    );


    if (!newPasswordConfirm) {

        return false;

    }


    if (
        newPassword ===
        newPasswordConfirm
    ) {

        passwordMatchMessage.textContent =
            '비밀번호가 일치합니다.';

        passwordMatchMessage.classList.add(
            'text-green-600'
        );

        return true;

    }


    passwordMatchMessage.textContent =
        '비밀번호가 일치하지 않습니다.';

    passwordMatchMessage.classList.add(
        'text-red-500'
    );


    return false;

}


// ============================================================
// 버튼 상태
// ============================================================

function setPasswordResetConfirmButton(
    disabled,
    text
) {

    if (!passwordResetConfirmButton) {

        return;

    }


    passwordResetConfirmButton.disabled =
        disabled;


    passwordResetConfirmButton.textContent =
        text;

}


// ============================================================
// 비밀번호 변경
// ============================================================

async function updatePassword(
    event
) {

    event.preventDefault();


    if (
        !newPasswordInput ||
        !newPasswordConfirmInput
    ) {

        return;

    }


    const newPassword =
        newPasswordInput.value;


    const newPasswordConfirm =
        newPasswordConfirmInput.value;


    setPasswordResetConfirmMessage(
        '',
        ''
    );


    // ========================================================
    // 비밀번호 길이
    // ========================================================

    if (
        newPassword.length < 6
    ) {

        setPasswordResetConfirmMessage(
            '비밀번호는 6자 이상 입력해주세요.',
            'error'
        );

        newPasswordInput.focus();

        return;

    }


    // ========================================================
    // 비밀번호 확인
    // ========================================================

    if (
        newPassword !==
        newPasswordConfirm
    ) {

        setPasswordResetConfirmMessage(
            '비밀번호가 일치하지 않습니다.',
            'error'
        );

        newPasswordConfirmInput.focus();

        return;

    }


    // ========================================================
    // Supabase Client 확인
    // ========================================================

    if (
        typeof supabaseClient === 'undefined'
        ||
        !supabaseClient
        ||
        !supabaseClient.auth
    ) {

        console.error(
            'Supabase Client가 초기화되지 않았습니다.'
        );


        setPasswordResetConfirmMessage(
            'Supabase 연결을 초기화하지 못했습니다.',
            'error'
        );

        return;

    }


    try {

        setPasswordResetConfirmButton(
            true,
            '변경 중...'
        );


        setPasswordResetConfirmMessage(
            '비밀번호를 변경하고 있습니다.',
            'info'
        );


        // ====================================================
        // 현재 Recovery Session 확인
        // ====================================================

        const {
            data: sessionData,
            error: sessionError
        } = await supabaseClient.auth.getSession();


        if (sessionError) {

            throw sessionError;

        }


        const session =
            sessionData.session;


        if (!session) {

            throw new Error(
                '비밀번호 재설정 인증이 만료되었습니다. 다시 비밀번호 재설정을 요청해주세요.'
            );

        }


        // ====================================================
        // 비밀번호 변경
        // ====================================================

        const {
            data,
            error
        } = await supabaseClient.auth.updateUser(
            {
                password:
                    newPassword
            }
        );


        if (error) {

            throw error;

        }


        console.log(
            '비밀번호 변경 완료:',
            data
        );


        setPasswordResetConfirmMessage(
            '비밀번호가 성공적으로 변경되었습니다.',
            'success'
        );


        setPasswordResetConfirmButton(
            true,
            '변경 완료'
        );


        // ====================================================
        // 기존 Recovery Session 종료
        // ====================================================

        await supabaseClient.auth.signOut();


        // ====================================================
        // 로그인 화면 이동
        // ====================================================

        setTimeout(
            function () {

                window.location.href =
                    '/login/';

            },
            1500
        );


    } catch (error) {

        console.error(
            '비밀번호 변경 오류:',
            error
        );


        setPasswordResetConfirmMessage(
            error.message ||
            '비밀번호 변경 중 오류가 발생했습니다.',
            'error'
        );


        setPasswordResetConfirmButton(
            false,
            '비밀번호 변경'
        );

    }

}


// ============================================================
// 비밀번호 입력 변경 이벤트
// ============================================================

if (newPasswordInput) {

    newPasswordInput.addEventListener(
        'input',
        function () {

            if (
                newPasswordConfirmInput &&
                newPasswordConfirmInput.value
            ) {

                checkPasswordMatch();

            }

        }
    );

}


// ============================================================
// 비밀번호 확인 입력 이벤트
// ============================================================

if (newPasswordConfirmInput) {

    newPasswordConfirmInput.addEventListener(
        'input',
        checkPasswordMatch
    );

}


// ============================================================
// 폼 이벤트
// ============================================================

if (passwordResetConfirmForm) {

    passwordResetConfirmForm.addEventListener(
        'submit',
        updatePassword
    );

}


// ============================================================
// 페이지 로드 시 Recovery Session 확인
// ============================================================

async function initializePasswordResetConfirm() {

    if (
        typeof supabaseClient === 'undefined'
        ||
        !supabaseClient
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            throw error;

        }


        if (!data.session) {

            setPasswordResetConfirmMessage(
                '비밀번호 재설정 인증이 만료되었거나 유효하지 않습니다. 다시 요청해주세요.',
                'error'
            );


            setPasswordResetConfirmButton(
                true,
                '인증 만료'
            );


            return;

        }


        console.log(
            '비밀번호 재설정 Recovery Session 확인 완료'
        );

    } catch (error) {

        console.error(
            'Recovery Session 확인 오류:',
            error
        );


        setPasswordResetConfirmMessage(
            '비밀번호 재설정 인증을 확인하지 못했습니다.',
            'error'
        );


        setPasswordResetConfirmButton(
            true,
            '사용할 수 없음'
        );

    }

}


initializePasswordResetConfirm();