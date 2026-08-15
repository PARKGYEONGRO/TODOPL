/*
    ============================================================
    회원가입 모달
    ============================================================
*/


/*
    ============================================================
    회원가입 모달 열기
    ============================================================
*/

function openSignupModal() {

    const modal =
        document.getElementById(
            'signupModal'
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        'is-open'
    );


    modal.setAttribute(
        'aria-hidden',
        'false'
    );


    document.body.style.overflow =
        'hidden';


    const emailInput =
        document.getElementById(
            'signupEmail'
        );


    if (emailInput) {

        setTimeout(
            function() {

                emailInput.focus();

            },
            100
        );

    }

}


/*
    ============================================================
    회원가입 모달 닫기
    ============================================================
*/

function closeSignupModal() {

    const modal =
        document.getElementById(
            'signupModal'
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        'is-open'
    );


    modal.setAttribute(
        'aria-hidden',
        'true'
    );


    document.body.style.overflow =
        '';


    resetSignupForm();

}


/*
    ============================================================
    회원가입 폼 초기화
    ============================================================
*/

function resetSignupForm() {

    const form =
        document.getElementById(
            'signupForm'
        );


    if (form) {

        form.reset();

    }


    const message =
        document.getElementById(
            'signupPasswordMessage'
        );


    if (message) {

        message.textContent =
            '';

        message.style.color =
            '';

    }


    const submitButton =
        document.getElementById(
            'signupSubmitButton'
        );


    if (submitButton) {

        submitButton.disabled =
            false;

        submitButton.textContent =
            '회원가입';

    }

}


/*
    ============================================================
    메시지 출력
    ============================================================
*/

function ShowSignupMessage(
    message,
    type = 'error'
) {

    const messageElement =
        document.getElementById(
            'signupPasswordMessage'
        );


    if (!messageElement) {

        return;

    }


    messageElement.textContent =
        message;


    if (
        type === 'success'
    ) {

        messageElement.style.color =
            '#16a34a';

    }

    else {

        messageElement.style.color =
            '#e53935';

    }

}


/*
    ============================================================
    비밀번호 확인
    ============================================================
*/

function ValidateSignupPassword() {

    const password =
        document.getElementById(
            'signupPassword'
        );


    const passwordConfirm =
        document.getElementById(
            'signupPasswordConfirm'
        );


    const message =
        document.getElementById(
            'signupPasswordMessage'
        );


    if (
        !password ||
        !passwordConfirm ||
        !message
    ) {

        return false;

    }


    if (
        !passwordConfirm.value
    ) {

        message.textContent =
            '';

        return false;

    }


    if (
        password.value !==
        passwordConfirm.value
    ) {

        message.textContent =
            '비밀번호가 일치하지 않습니다.';

        message.style.color =
            '#e53935';

        return false;

    }


    message.textContent =
        '비밀번호가 일치합니다.';


    message.style.color =
        '#16a34a';


    return true;

}


/*
    ============================================================
    회원가입 처리
    ============================================================
*/

async function SubmitSignup() {

    const emailInput =
        document.getElementById(
            'signupEmail'
        );


    const passwordInput =
        document.getElementById(
            'signupPassword'
        );


    const passwordConfirmInput =
        document.getElementById(
            'signupPasswordConfirm'
        );


    const submitButton =
        document.getElementById(
            'signupSubmitButton'
        );


    if (
        !emailInput ||
        !passwordInput ||
        !passwordConfirmInput ||
        !submitButton
    ) {

        return;

    }


    const email =
        emailInput.value
            .trim();


    const password =
        passwordInput.value;


    const passwordConfirm =
        passwordConfirmInput.value;


    /*
        ========================================================
        기본 검증
        ========================================================
    */

    if (!email) {

        ShowSignupMessage(
            '이메일을 입력해주세요.'
        );

        emailInput.focus();

        return;

    }


    if (!emailInput.checkValidity()) {

        ShowSignupMessage(
            '올바른 이메일 주소를 입력해주세요.'
        );

        emailInput.focus();

        return;

    }


    if (!password) {

        ShowSignupMessage(
            '비밀번호를 입력해주세요.'
        );

        passwordInput.focus();

        return;

    }


    if (password !== passwordConfirm) {

        ShowSignupMessage(
            '비밀번호가 일치하지 않습니다.'
        );

        passwordConfirmInput.focus();

        return;

    }


    /*
        ========================================================
        회원가입 버튼 비활성화
        ========================================================
    */

    submitButton.disabled =
        true;


    submitButton.textContent =
        '가입 중...';


    try {

        /*
            ====================================================
            Supabase Auth 회원가입
            ====================================================
        */

        const {
            data,
            error
        } =
            await SupabaseClient.auth.signUp({

                email:
                    email,

                password:
                    password

            });


        /*
            ====================================================
            오류 처리
            ====================================================
        */

        if (error) {

            console.error(
                'Supabase 회원가입 오류:',
                error
            );


            ShowSignupMessage(
                GetSignupErrorMessage(
                    error
                )
            );


            return;

        }


        /*
            ====================================================
            회원가입 성공
            ====================================================
        */

        console.log(
            'Supabase 회원가입 성공:',
            data
        );


        ShowSignupMessage(
            '회원가입이 완료되었습니다.',
            'success'
        );


        /*
            이메일 인증이 필요한 경우
        */

        if (
            data.user &&
            !data.session
        ) {

            ShowSignupMessage(
                '회원가입이 완료되었습니다. 이메일을 확인하여 인증해주세요.',
                'success'
            );


            submitButton.textContent =
                '가입 완료';


            setTimeout(
                function() {

                    closeSignupModal();

                },
                2000
            );


            return;

        }


        /*
            이메일 인증 없이
            바로 로그인된 경우
        */

        submitButton.textContent =
            '가입 완료';


        setTimeout(
            function() {

                closeSignupModal();

            },
            1200
        );

    }

    catch (error) {

        console.error(
            '회원가입 처리 오류:',
            error
        );


        ShowSignupMessage(
            '회원가입 중 오류가 발생했습니다.'
        );

    }

    finally {

        if (
            submitButton.textContent ===
            '가입 중...'
        ) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                '회원가입';

        }

    }

}


/*
    ============================================================
    Supabase 오류 메시지 변환
    ============================================================
*/

function GetSignupErrorMessage(
    error
) {

    if (!error) {

        return '회원가입에 실패했습니다.';

    }


    const errorMessage =
        error.message ||
        '';


    const lowerMessage =
        errorMessage.toLowerCase();


    /*
        이미 가입된 이메일
    */

    if (
        lowerMessage.includes(
            'already registered'
        ) ||
        lowerMessage.includes(
            'user already registered'
        )
    ) {

        return (
            '이미 가입된 이메일입니다.'
        );

    }


    /*
        비밀번호가 너무 짧은 경우
    */

    if (
        lowerMessage.includes(
            'password should be at least'
        )
    ) {

        return (
            '비밀번호가 너무 짧습니다.'
        );

    }


    /*
        이메일 형식
    */

    if (
        lowerMessage.includes(
            'invalid email'
        )
    ) {

        return (
            '올바른 이메일 주소를 입력해주세요.'
        );

    }


    return (
        '회원가입에 실패했습니다. 다시 시도해주세요.'
    );

}


/*
    ============================================================
    DOM 초기화
    ============================================================
*/

document.addEventListener(
    'DOMContentLoaded',
    function() {

        const password =
            document.getElementById(
                'signupPassword'
            );


        const passwordConfirm =
            document.getElementById(
                'signupPasswordConfirm'
            );


        const signupForm =
            document.getElementById(
                'signupForm'
            );


        /*
            ====================================================
            비밀번호 확인 입력
            ====================================================
        */

        if (
            passwordConfirm
        ) {

            passwordConfirm.addEventListener(
                'input',
                function() {

                    ValidateSignupPassword();

                }
            );

        }


        if (
            password
        ) {

            password.addEventListener(
                'input',
                function() {

                    if (
                        passwordConfirm &&
                        passwordConfirm.value
                    ) {

                        ValidateSignupPassword();

                    }

                }
            );

        }


        /*
            ====================================================
            회원가입 제출
            ====================================================
        */

        if (signupForm) {

            signupForm.addEventListener(
                'submit',
                async function(event) {

                    event.preventDefault();


                    await SubmitSignup();

                }
            );

        }


        /*
            ====================================================
            ESC로 모달 닫기
            ====================================================
        */

        document.addEventListener(
            'keydown',
            function(event) {

                if (
                    event.key ===
                    'Escape'
                ) {

                    const modal =
                        document.getElementById(
                            'signupModal'
                        );


                    if (
                        modal &&
                        modal.classList.contains(
                            'is-open'
                        )
                    ) {

                        closeSignupModal();

                    }

                }

            }
        );


        /*
            ====================================================
            바깥 영역 클릭으로 닫기
            ====================================================
        */

        const signupModal =
            document.getElementById(
                'signupModal'
            );


        if (signupModal) {

            signupModal.addEventListener(
                'click',
                function(event) {

                    if (
                        event.target ===
                        signupModal
                    ) {

                        closeSignupModal();

                    }

                }
            );

        }

    }
);