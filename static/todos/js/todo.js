console.log('todo.js 로드됨');




//할 일 추가 모달
function openModal() {

    document
        .getElementById('createModal')
        .classList
        .remove('hidden');

}

function closeModal() {

    document
        .getElementById('createModal')
        .classList
        .add('hidden');

}


// 언젠가 할 일 추가 모달
function openSomedayCreateModal() {

    document
        .getElementById('somedayCreateModal')
        .classList
        .remove('hidden');

}


function closeSomedayCreateModal() {

    document
        .getElementById('somedayCreateModal')
        .classList
        .add('hidden');

}


// Todo 완료 상태 변경
const csrfToken = document.body.dataset.csrf;

// Todo 완료 상태 변경

function toggleTodo(
    todoId,
    selectedTag,
    selectedDate
) {

    const csrfToken =
        document.body.dataset.csrf;


    fetch(
        `/toggle/${todoId}/`,
        {
            method: 'POST',

            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({

                tag: selectedTag,

                date: selectedDate

            })

        }
    )

    .then(response => {

        if (!response.ok) {

            return response.json()
            .then(data => {

                throw new Error(
                    data.message ||
                    '서버 오류'
                );

            });

        }


        return response.json();

    })


    .then(data => {


        if (
            data.status !== 'success'
        ) {

            throw new Error(
                data.message ||
                '변경 실패'
            );

        }



        /*
            제목 변경
        */

        const titleElement =
            document.getElementById(
                `todo-title-${todoId}`
            );


        if(titleElement){


            if(data.is_completed){


                titleElement.classList.add(
                    'line-through',
                    'text-gray-400'
                );


                titleElement.classList.remove(
                    'text-gray-900'
                );


            }
            else{


                titleElement.classList.remove(
                    'line-through',
                    'text-gray-400'
                );


                titleElement.classList.add(
                    'text-gray-900'
                );


            }


        }




        /*
            모바일 버튼 변경
        */

        const button =
            document.querySelector(
                `[data-todo-id="${todoId}"]`
            );


        if(button){


            if(data.is_completed){


                button.classList.remove(
                    'border-2',
                    'border-gray-300',
                    'bg-white'
                );


                button.classList.add(
                    'bg-black',
                    'text-white'
                );


                button.innerHTML =
                    `
                    <i class="fa-solid fa-check text-[10px]"></i>
                    `;


            }
            else{


                button.classList.remove(
                    'bg-black',
                    'text-white'
                );


                button.classList.add(
                    'border-2',
                    'border-gray-300',
                    'bg-white'
                );


                button.innerHTML =
                    '';

            }


        }



        //통계 갱신
        updatePcStats(data);
        updateMobileStats(data);


    })


    .catch(error => {


        console.error(
            'Todo 변경 오류:',
            error
        );


        alert(
            error.message
        );


    });


}


//PC 통계 즉시 갱신
function updatePcStats(data) {
    
    console.log(
        '=============================='
    );
    
    console.log(
        'updatePcStats 실행'
    );
    
    console.log(
        '응답 데이터:',
        data
    );
    
    
    // ==================================================
    // 중앙 완료 현황
    // ==================================================
    
    const todoProgress =
    document.getElementById(
        'todo-progress'
    );
    
    
    if (todoProgress) {
        
        todoProgress.textContent =
        `${data.selected_completed_count}/${data.selected_total_count} 완료`;
        
    }
    
    
    // ==================================================
    // 우측 이번달 기본 통계
    // ==================================================
    
    const totalCount =
    document.getElementById(
        'pc-total-count'
    );
    
    
    const completedCount =
    document.getElementById(
        'pc-completed-count'
    );
    
    
    const completionRate =
    document.getElementById(
        'pc-completion-rate'
    );
    
    
    const completionBar =
    document.getElementById(
        'pc-completion-bar'
    );
    
    
    if (totalCount) {
        
        totalCount.textContent =
        data.monthly_total_count;
        
    }
    
    
    if (completedCount) {
        
        completedCount.textContent =
        data.monthly_completed_count;
        
    }
    
    
    if (completionRate) {
        
        completionRate.textContent =
        `${data.monthly_completion_rate}%`;
        
    }
    
    
    if (completionBar) {
        
        completionBar.style.width =
        `${data.monthly_completion_rate}%`;
        
    }
    
    
    // ==================================================
    // 태그별 현황
    // ==================================================
    
    if (
        Array.isArray(
            data.monthly_tag_stats
        )
    ) {
        
        data.monthly_tag_stats.forEach(
            tag => {
                
                const countElement =
                document.getElementById(
                    `pc-tag-${tag.code}-count`
                );
                
                
                const barElement =
                document.getElementById(
                    `pc-tag-${tag.code}-bar`
                );
                
                
                if (countElement) {
                    
                    countElement.textContent =
                    `${tag.completed}/${tag.total}`;
                    
                }
                
                
                if (barElement) {
                    
                    barElement.style.width =
                    `${tag.rate}%`;
                    
                }
                
            }
        );
        
    }
    
    
    // ==================================================
    // 우선순위별 현황
    // ==================================================
    
    if (
        Array.isArray(
            data.monthly_priority_stats
        )
    ) {
        
        data.monthly_priority_stats.forEach(
            priority => {
                
                const totalElement =
                document.getElementById(
                    `pc-priority-${priority.code}-total`
                );
                
                
                const completedElement =
                document.getElementById(
                    `pc-priority-${priority.code}-completed`
                );
                
                
                if (totalElement) {
                    
                    totalElement.textContent =
                    priority.total;
                    
                }
                
                
                if (completedElement) {
                    
                    completedElement.textContent =
                    `${priority.completed}완료`;
                    
                }
                
            }
        );
        
    }
    
    
    console.log(
        '중앙 완료:',
        `${data.selected_completed_count}/${data.selected_total_count}`
    );
    
    
    console.log(
        '이번달 완료:',
        `${data.monthly_completed_count}/${data.monthly_total_count}`
    );
    
    
    console.log(
        'updatePcStats 종료'
    );
    
    console.log(
        '=============================='
    );
    
}

//Mobile 즉시 갱신
function updateMobileStats(data) {

    const mobileProgress =
        document.getElementById(
            'mobile-progress'
        );


    if (mobileProgress) {

        mobileProgress.textContent =
            `${data.selected_completed_count}/${data.selected_total_count}`;

    }

}


//PC 월 선택
const bodyElement =
    document.body;


let pcPickerYear =
    Number(
        bodyElement.dataset.year
    );

//월 선택창 열기
function openPcMonthPicker() {

    const picker =
        document.getElementById(
            'pcMonthPicker'
        );


    picker.classList.remove(
        'hidden'
    );


    updatePcMonthButton();

}


//월 선택창 닫기
function closePcMonthPicker() {

    const picker =
        document.getElementById(
            'pcMonthPicker'
        );


    picker.classList.add(
        'hidden'
    );

}



//연도 변경
function changePcPickerYear(
    direction
) {

    pcPickerYear += direction;


    document.getElementById(
        'pcPickerYear'
    ).textContent =
        `${pcPickerYear}년`;

}


//현재 월 강조
function updatePcMonthButton() {

    const currentMonth =
        Number(
            document.body.dataset.month
        );


    document
        .querySelectorAll(
            '.pc-month-button'
        )
        .forEach(
            button => {

                const buttonMonth =
                    Number(
                        button.dataset.month
                    );


                if (
                    buttonMonth === currentMonth
                ) {

                    button.classList.add(
                        'bg-black',
                        'text-white'
                    );

                    button.classList.remove(
                        'bg-gray-100',
                        'text-gray-700'
                    );

                } else {

                    button.classList.add(
                        'bg-gray-100',
                        'text-gray-700'
                    );

                    button.classList.remove(
                        'bg-black',
                        'text-white'
                    );

                }

            }
        );

}


//월 선택
function selectPcMonth(
    month
) {

    const monthString =
        String(month)
            .padStart(2, '0');


    const date =
        `${pcPickerYear}-${monthString}-01`;


    window.location.href =
        `/?year=${pcPickerYear}&month=${monthString}&date=${date}`;

}


//기간 할 일
function toggleEndDate() {

    const rangeRadio =
        document.querySelector(
            'input[name="schedule_type"][value="range"]'
        );


    const endDateWrapper =
        document.getElementById(
            'endDateWrapper'
        );


    const endDateInput =
        document.getElementById(
            'endDateInput'
        );


    const dueDateInput =
        document.getElementById(
            'dueDateInput'
        );


    if (
        !rangeRadio ||
        !endDateWrapper
    ) {

        return;

    }


    if (rangeRadio.checked) {

        endDateWrapper.classList.remove(
            'hidden'
        );


        endDateInput.required =
            true;


        endDateInput.min =
            dueDateInput.value;

    } else {

        endDateWrapper.classList.add(
            'hidden'
        );


        endDateInput.required =
            false;


        endDateInput.value =
            '';

    }

}


//시작일 변경 시 종료일 최소 날짜 변경
const dueDateInput =
    document.getElementById(
        'dueDateInput'
    );


if (dueDateInput) {

    dueDateInput.addEventListener(
        'change',
        function () {

            const endDateInput =
                document.getElementById(
                    'endDateInput'
                );


            if (endDateInput) {

                endDateInput.min =
                    this.value;

            }

        }
    );

}


//날짜 선택창 열기
function openDatePicker(
    inputId
) {

    const input =
        document.getElementById(
            inputId
        );


    if (!input) {

        return;

    }


    /*
        Chrome 등 showPicker 지원 브라우저
    */

    if (
        typeof input.showPicker === 'function'
    ) {

        try {

            input.showPicker();

            return;

        } catch (error) {

            console.warn(
                'showPicker 실행 실패:',
                error
            );

        }

    }


    /*
        showPicker를 지원하지 않는 경우
        input 자체에 focus
    */

    input.focus();

}

