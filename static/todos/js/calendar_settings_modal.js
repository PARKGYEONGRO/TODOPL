/* ============================================================
   캘린더 설정 모달
   ============================================================ */


/* ============================================================
   캘린더 설정 저장 키
   ============================================================ */

const Calendar_Settings_Storage_Key =
    'calendarSettings';


/* ============================================================
   기본 캘린더 설정
   ============================================================ */

const Default_Calendar_Settings = {

    Calendar_Start_Day:
        'sunday',

    Statistics_Period:
        'monthly',

    Time_Format:
        '24'

};


/* ============================================================
   공통 요소 가져오기
   ============================================================ */

function Get_Calendar_Settings_Element(
    ElementId
) {

    return document.getElementById(
        ElementId
    );

}


/* ============================================================
   캘린더 설정 가져오기
   ============================================================ */

function Get_Calendar_Settings() {

    const Saved_Settings =
        localStorage.getItem(
            Calendar_Settings_Storage_Key
        );


    if (!Saved_Settings) {

        return {
            ...Default_Calendar_Settings
        };

    }


    try {

        const Parsed_Settings =
            JSON.parse(
                Saved_Settings
            );


        return {

            ...Default_Calendar_Settings,

            ...Parsed_Settings

        };

    } catch (Error) {

        console.error(
            '캘린더 설정을 불러오는 중 오류가 발생했습니다.',
            Error
        );


        return {
            ...Default_Calendar_Settings
        };

    }

}


/* ============================================================
   캘린더 설정 저장
   ============================================================ */

function Save_Calendar_Settings(
    CalendarSettings
) {

    localStorage.setItem(

        Calendar_Settings_Storage_Key,

        JSON.stringify(
            CalendarSettings
        )

    );


    /* ========================================================
       Django 서버 전달용 쿠키
       ======================================================== */

    document.cookie =

        'calendar_start_day='
        +
        CalendarSettings.Calendar_Start_Day
        +
        '; path=/; max-age=31536000; SameSite=Lax';

    document.cookie = 

        'statistics_period='
        +
        CalendarSettings.Statistics_Period
        +
        '; path=/; max-age=31536000; SameSite=Lax';


    console.log(
        '캘린더 설정 저장 완료:',
        CalendarSettings
    );

}


/* ============================================================
   현재 라디오 버튼 선택값 가져오기
   ============================================================ */

function Get_Selected_Calendar_Settings() {

    const CalendarStartDay =
        document.querySelector(
            'input[name="calendarStartDay"]:checked'
        );


    const StatisticsPeriod =
        document.querySelector(
            'input[name="statisticsPeriod"]:checked'
        );


    const TimeFormat =
        document.querySelector(
            'input[name="timeFormat"]:checked'
        );


    return {

        Calendar_Start_Day:
            CalendarStartDay
                ? CalendarStartDay.value
                : Default_Calendar_Settings.Calendar_Start_Day,


        Statistics_Period:
            StatisticsPeriod
                ? StatisticsPeriod.value
                : Default_Calendar_Settings.Statistics_Period,


        Time_Format:
            TimeFormat
                ? TimeFormat.value
                : Default_Calendar_Settings.Time_Format

    };

}


/* ============================================================
   라디오 버튼 선택값 적용
   ============================================================ */

function Apply_Calendar_Settings_To_Modal(
    CalendarSettings
) {

    const CalendarStartDay =
        document.querySelector(
            `input[name="calendarStartDay"][value="${CalendarSettings.Calendar_Start_Day}"]`
        );


    const StatisticsPeriod =
        document.querySelector(
            `input[name="statisticsPeriod"][value="${CalendarSettings.Statistics_Period}"]`
        );


    const TimeFormat =
        document.querySelector(
            `input[name="timeFormat"][value="${CalendarSettings.Time_Format}"]`
        );


    if (CalendarStartDay) {

        CalendarStartDay.checked =
            true;

    }


    if (StatisticsPeriod) {

        StatisticsPeriod.checked =
            true;

    }


    if (TimeFormat) {

        TimeFormat.checked =
            true;

    }

}


/* ============================================================
   캘린더 설정 저장
   ============================================================ */

function Save_Current_Calendar_Settings() {

    const CalendarSettings =
        Get_Selected_Calendar_Settings();


    /* ========================================================
       설정 저장
       ======================================================== */

    Save_Calendar_Settings(
        CalendarSettings
    );


    /* ========================================================
       설정 적용
       ======================================================== */

    Apply_Calendar_Settings(
        CalendarSettings
    );


    /* ========================================================
       모달 숨김
       ======================================================== */

    const CalendarSettingsModal =
        Get_Calendar_Settings_Element(
            'calendarSettingsModal'
        );


    if (CalendarSettingsModal) {

        Hide_Calendar_Settings_Modal(
            CalendarSettingsModal
        );

    }


    /* ========================================================
       스크롤 잠금 해제
       ======================================================== */

    document.body.classList.remove(
        'overflow-hidden'
    );


    /* ========================================================
       페이지 새로고침
       ======================================================== */

    window.location.reload();

}


/* ============================================================
   실제 화면에 캘린더 설정 적용
   ============================================================ */

function Apply_Calendar_Settings(
    CalendarSettings
) {

    console.log(
        '캘린더 설정 적용:',
        CalendarSettings
    );


    if (
        typeof window.Apply_Statistics_Period
        ===
        'function'
    ) {

        window.Apply_Statistics_Period(
            CalendarSettings.Statistics_Period
        );

    }


    if (
        typeof window.Apply_Time_Format
        ===
        'function'
    ) {

        window.Apply_Time_Format(
            CalendarSettings.Time_Format
        );

    }

}


/* ============================================================
   모달 표시
   ============================================================ */

function Show_Calendar_Settings_Modal(
    Modal
) {

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

function Hide_Calendar_Settings_Modal(
    Modal
) {

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
   캘린더 설정 모달 열기
   ============================================================ */

function openCalendarSettingsModal() {

    const CalendarSettingsModal =
        Get_Calendar_Settings_Element(
            'calendarSettingsModal'
        );


    if (!CalendarSettingsModal) {

        console.error(
            'calendarSettingsModal을 찾을 수 없습니다.'
        );

        return;

    }


    const CalendarSettings =
        Get_Calendar_Settings();


    Apply_Calendar_Settings_To_Modal(
        CalendarSettings
    );


    Show_Calendar_Settings_Modal(
        CalendarSettingsModal
    );


    document.body.classList.add(
        'overflow-hidden'
    );

}


/* ============================================================
   캘린더 설정 모달 닫기
   ============================================================ */

function closeCalendarSettingsModal() {

    const CalendarSettingsModal =
        Get_Calendar_Settings_Element(
            'calendarSettingsModal'
        );


    if (!CalendarSettingsModal) {

        return;

    }


    /* ========================================================
       모달 숨김
       ======================================================== */

    Hide_Calendar_Settings_Modal(
        CalendarSettingsModal
    );


    /* ========================================================
       스크롤 잠금 해제
       ======================================================== */

    document.body.classList.remove(
        'overflow-hidden'
    );

}


/* ============================================================
   배경 클릭으로 모달 닫기
   ============================================================ */

function Calendar_Settings_Modal_Backdrop_Click(
    Event
) {

    if (
        Event.target
        !==
        Event.currentTarget
    ) {

        return;

    }


    closeCalendarSettingsModal();

}


/* ============================================================
   ESC 키로 모달 닫기
   ============================================================ */

document.addEventListener(

    'keydown',

    function(Event) {

        if (
            Event.key
            !==
            'Escape'
        ) {

            return;

        }


        const CalendarSettingsModal =
            Get_Calendar_Settings_Element(
                'calendarSettingsModal'
            );


        if (
            !CalendarSettingsModal
            ||
            CalendarSettingsModal.classList.contains(
                'hidden'
            )
        ) {

            return;

        }


        closeCalendarSettingsModal();

    }

);



/* ============================================================
   페이지 시작 시 설정 불러오기
   ============================================================ */

document.addEventListener(

    'DOMContentLoaded',

    function() {

        const CalendarSettings =
            Get_Calendar_Settings();


        Apply_Calendar_Settings(
            CalendarSettings
        );

    }

);