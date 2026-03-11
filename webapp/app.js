let tg = window.Telegram.WebApp;
let userData = null;
let currentDay = 1;

// Инициализация приложения
tg.ready();
tg.expand();

// Полные названия дней
const weekdaysFull = {
    1: 'Понедельник',
    2: 'Вторник',
    3: 'Среда',
    4: 'Четверг',
    5: 'Пятница',
    6: 'Суббота'
};

// Функция загрузки данных пользователя
function loadUserData() {
    console.log('📤 Отправляем запрос данных боту...');
    tg.sendData(JSON.stringify({ action: 'get_user_data' }));
}

// Получение данных от бота
tg.onEvent('webAppData', function(event) {
    console.log('📥 Получены данные от бота:', event);
    
    try {
        const data = JSON.parse(event.data);
        console.log('📥 Распарсенные данные:', data);
        
        if (data && data.user_id) {
            userData = {
                selected_class: data.selected_class,
                schedule: data.schedule,
                weekdays: data.weekdays
            };
            
            console.log('✅ Данные загружены! Класс:', userData.selected_class);
            
            initDayButtons();
            updateUI();
        } else {
            console.log('❌ В данных нет user_id');
            setTimeout(loadUserData, 1000);
        }
    } catch (error) {
        console.error('❌ Ошибка парсинга данных:', error);
        setTimeout(loadUserData, 1000);
    }
});

// Инициализация кнопок дней
function initDayButtons() {
    document.querySelectorAll('.day-btn, .day-btn-footer').forEach(btn => {
        btn.removeEventListener('click', changeDayHandler);
        btn.addEventListener('click', changeDayHandler);
    });
}

// Обработчик смены дня
function changeDayHandler(e) {
    const day = parseInt(e.currentTarget.dataset.day);
    changeDay(day);
}

// Смена дня
function changeDay(day) {
    if (day === currentDay) return;
    console.log('📅 Смена дня на:', day);
    
    const container = document.getElementById('scheduleContainer');
    container.classList.add('loading');
    
    currentDay = day;
    
    updateActiveButtons();
    updateDayHeader();
    
    setTimeout(() => {
        loadScheduleForDay(currentDay);
        container.classList.remove('loading');
    }, 200);
}

// Обновление активных кнопок
function updateActiveButtons() {
    document.querySelectorAll('.day-btn, .day-btn-footer').forEach(btn => {
        const btnDay = parseInt(btn.dataset.day);
        if (btnDay === currentDay) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Обновление заголовка с днем
function updateDayHeader() {
    const header = document.getElementById('selectedDayHeader');
    if (header) {
        const h2 = header.querySelector('h2') || document.createElement('h2');
        h2.textContent = weekdaysFull[currentDay] || 'День недели';
        if (!header.querySelector('h2')) {
            header.appendChild(h2);
        }
    }
}

// Обновление интерфейса
function updateUI() {
    console.log('🔄 Обновление UI, userData:', userData);
    
    if (!userData) {
        document.getElementById('selectedClass').textContent = '❌ класс';
        return;
    }
    
    const selectedClassEl = document.getElementById('selectedClass');
    if (selectedClassEl) {
        selectedClassEl.textContent = userData.selected_class ? 
            `${userData.selected_class} класс` : '❌ класс';
    }
    
    updateActiveButtons();
    updateDayHeader();
    loadScheduleForDay(currentDay);
}

// Загрузка расписания на выбранный день
function loadScheduleForDay(day) {
    const container = document.getElementById('scheduleContainer');
    if (!container) return;
    
    console.log('📚 Загрузка расписания для дня:', day);
    
    if (!userData) {
        container.innerHTML = `
            <div class="empty-day">
                <span class="icon-loading">⏳</span>
                <p>Загрузка данных...</p>
            </div>
        `;
        return;
    }
    
    if (!userData.selected_class) {
        container.innerHTML = `
            <div class="empty-day">
                <span class="icon-settings">⚙️</span>
                <p>Выберите класс в настройках</p>
                <small>(кнопка ⚙️ в правом углу)</small>
            </div>
        `;
        return;
    }
    
    if (!userData.schedule) {
        container.innerHTML = `
            <div class="empty-day">
                <span class="icon-empty">📅</span>
                <p>Нет данных расписания</p>
            </div>
        `;
        return;
    }
    
    const schedule = userData.schedule?.[userData.selected_class]?.[day];
    console.log(`📚 Расписание для ${userData.selected_class} класса, день ${day}:`, schedule);
    
    if (!schedule || schedule.length === 0) {
        container.innerHTML = `
            <div class="empty-day">
                <span class="icon-no-lessons">📅</span>
                <p>В этот день уроков нет</p>
                <small>${weekdaysFull[day]}</small>
            </div>
        `;
        return;
    }
    
    let html = '<div class="schedule-grid">';
    
    schedule.forEach((lesson, index) => {
        // Определяем иконку в зависимости от предмета (для разнообразия)
        let subjectIcon = '📘'; // Книга по умолчанию
        
        // Пример: разные иконки для разных предметов
        const subject = lesson.subject.toLowerCase();
        if (subject.includes('математик') || subject.includes('алгебр') || subject.includes('геометри')) {
            subjectIcon = '📐'; // Линейка/треугольник
        } else if (subject.includes('русский') || subject.includes('литератур')) {
            subjectIcon = '📖'; // Открытая книга
        } else if (subject.includes('физик')) {
            subjectIcon = '⚡'; // Молния
        } else if (subject.includes('хими')) {
            subjectIcon = '🧪'; // Пробирка
        } else if (subject.includes('информат')) {
            subjectIcon = '💻'; // Компьютер
        } else if (subject.includes('истори')) {
            subjectIcon = '🏛️'; // Здание
        } else if (subject.includes('биологи')) {
            subjectIcon = '🧬'; // ДНК
        } else if (subject.includes('физкульт')) {
            subjectIcon = '⚽'; // Мяч
        } else if (subject.includes('английс')) {
            subjectIcon = '🇬🇧'; // Флаг
        }
        
        html += `
            <div class="lesson-card">
                <div class="lesson-number">
                    <span class="icon-lesson">${subjectIcon}</span> УРОК ${index + 1}
                </div>
                <div class="lesson-subject">${lesson.subject}</div>
                <div class="lesson-details">
                    <div class="lesson-teacher">
                        <span class="icon-teacher">👨‍🏫</span> ${lesson.teacher}
                    </div>
                    <div class="lesson-time">
                        <span class="icon-time">⏱️</span> ${lesson.start} — ${lesson.end}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    html += `
        <div class="lessons-total">
            <span class="icon-total">📊</span> Всего уроков: ${schedule.length}
        </div>
    `;
    
    container.innerHTML = html;
}

// Обработчик кнопки настроек
document.getElementById('settingsBtn')?.addEventListener('click', () => {
    console.log('⚙️ Открытие настроек');
    tg.openTelegramLink('https://t.me/scheduleZabolotye_bot');
});

// Запуск загрузки данных
console.log('🚀 Приложение запущено');
loadUserData();

function updateConnectionStatus() {
    const startTime = Data.now();

    tg.sendData(JSON.stringify({ action: 'ping' }));

    tg.onEvent('webAppData', function pong(event){
        const latency = Data.now() - startTime;
        console.log(`Пинг: ${latency} мс`);

        if (latency > 500) {
            showWarning('Соединение нестабильно. Данные могут загружаться дольше.');
        }
    });
}

// Повторный запрос через 3 секунды, если данных нет
setTimeout(() => {
    if (!userData) {
        console.log('⏰ Таймаут, повторный запрос...');
        loadUserData();
    }
}, 3000);