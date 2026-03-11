let tg = window.Telegram.WebApp;
let selectedClass = null;

// Инициализация
tg.ready();
tg.expand();

const DEVELOPER_USERNAME = 'ruby_apathy';

// Получение данных от бота
tg.onEvent('webAppData', function(event) {
    console.log('📥 Данные в settings:', event);
    try {
        const userData = JSON.parse(event.data);
        selectedClass = userData.selected_class;
        renderClasses();
    } catch (e) {
        console.error('❌ Ошибка парсинга:', e);
    }
});

// Создание сетки классов
function renderClasses() {
    const grid = document.getElementById('classesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let classNum = 4; classNum <= 11; classNum++) {
        const btn = document.createElement('button');
        btn.className = `class-btn ${selectedClass === classNum ? 'selected' : ''}`;
        btn.textContent = classNum;
        btn.onclick = () => selectClass(classNum);
        grid.appendChild(btn);
    }
}

// Выбор класса
function selectClass(classNum) {
    selectedClass = classNum;
    
    document.querySelectorAll('.class-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (parseInt(btn.textContent) === classNum) {
            btn.classList.add('selected');
        }
    });
    
    saveClass();
}

// Сохранение класса
function saveClass() {
    if (!selectedClass) return;
    
    const statusEl = document.getElementById('saveStatus');
    statusEl.textContent = 'Сохранение...';
    statusEl.className = 'save-status';
    
    tg.sendData(JSON.stringify({
        action: 'save_class',
        class: selectedClass
    }));
    
    statusEl.textContent = '✅ Класс сохранен!';
    statusEl.className = 'save-status success';
    
    setTimeout(() => {
        tg.close();
    }, 2000);
}

// Связь с разработчиком
function contactDeveloper() {
    tg.openTelegramLink(`https://t.me/${DEVELOPER_USERNAME}`);
    tg.showAlert('👨‍💻 Переход в чат с разработчиком...');
}

// Кнопка назад
document.getElementById('backBtn')?.addEventListener('click', () => {
    tg.close();
});

// Кнопка разработчика
document.getElementById('developerBtn')?.addEventListener('click', contactDeveloper);

// Начальная отрисовка
renderClasses();

// Запрос данных пользователя
tg.sendData(JSON.stringify({ action: 'get_user_data' }));