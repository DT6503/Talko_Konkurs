// Глобальные переменные для управления роботами
let robotAudio = null;
let activeRobot = null;

function activateRobot(robotId = 'robot') {
    if (activeRobot) return;
    
    const robot = document.getElementById(robotId);
    if (!robot) return;
    
    // Находим секцию и активатор
    const section = robot.closest('section');
    let activator = null;
    
    // Для печеньки в hero секции
    if (robotId === 'robot') {
        activator = document.querySelector('.cookie-trigger');
    } else {
        // Для остальных роботов
        activator = section ? section.querySelector('.activator') : null;
    }
    
    // 🎵 Получаем аудио для КОНКРЕТНОЙ секции
    let sectionName = 'home'; // по умолчанию
    
    if (section) {
        sectionName = section.id.replace('-section', '') || 'home';
    } else if (robotId === 'robot') {
        sectionName = 'home'; // печенька в hero секции
    }
    
    robotAudio = document.getElementById(`robotAudio-${sectionName}`);
    
    // Если не нашли аудио для секции, пробуем общее
    if (!robotAudio) {
        robotAudio = document.getElementById('robotAudio-home');
    }
    
    activeRobot = robotId;
    
    // Показываем робота
    robot.classList.add('active');
    if (activator) {
        activator.style.opacity = '0.5';
        activator.style.pointerEvents = 'none';
    }
    
    // Анимация появления
    robot.style.animation = 'appearGigachat 0.8s ease-out forwards';
    
    // 🎵 Запускаем аудио для этой секции
    if (robotAudio) {
        robotAudio.play().catch(e => {
            console.log('Автовоспроизведение заблокировано:', e);
        });
        
        robotAudio.onended = function() {
            console.log("Аудио закончилось само");
            deactivateRobot(false);
        };
    }
    
    // Добавляем обработчики
    robot.addEventListener('click', handleRobotClick);
    
    // Для секции добавляем обработчик клика вне робота
    if (section) {
        section.addEventListener('click', handleSectionClick);
    } else {
        // Для печеньки в hero секции
        document.addEventListener('click', handleDocumentClick);
    }
    
    // Сохраняем ссылки для деактивации
    robot._section = section;
    robot._activator = activator;
    robot._documentHandler = !section; // флаг для печеньки
}

function handleRobotClick(e) {
    e.stopPropagation();
    console.log("Клик на робота");
    deactivateRobot(true);
}

function handleSectionClick(e) {
    if (!e.target.closest('.robot-gigachat') && !e.target.closest('.activator-container') && !e.target.closest('.cookie-trigger')) {
        console.log("Клик вне робота в секции");
        deactivateRobot(true);
    }
}

function handleDocumentClick(e) {
    // Для печеньки - клик в любом месте документа вне робота
    if (!e.target.closest('.robot-gigachat') && !e.target.closest('.cookie-trigger')) {
        console.log("Клик вне робота (документ)");
        deactivateRobot(true);
    }
}

function deactivateRobot(playOuch = false) {
    if (!activeRobot) return;
    
    const robot = document.getElementById(activeRobot);
    if (!robot) return;
    
    console.log("Деактивация, playOuch:", playOuch);
    
    // Останавливаем аудио робота
    if (robotAudio) {
        robotAudio.pause();
        robotAudio.currentTime = 0;
        robotAudio.onended = null;
    }
    
    // ВОСПРОИЗВОДИМ "ОЙ" ДО того как убираем обработчики
    if (playOuch) {
        playOuchSound();
    }
    
    // Убираем обработчики
    robot.removeEventListener('click', handleRobotClick);
    
    if (robot._section) {
        robot._section.removeEventListener('click', handleSectionClick);
    }
    
    if (robot._documentHandler) {
        document.removeEventListener('click', handleDocumentClick);
    }
    
    // Анимация исчезновения
    robot.classList.add('disappearing');
    robot.classList.remove('active');
    
    setTimeout(() => {
        robot.classList.remove('disappearing');
        robot.style.animation = '';
        if (robot._activator) {
            robot._activator.style.opacity = '1';
            robot._activator.style.pointerEvents = 'all';
        }
        activeRobot = null;
        robotAudio = null;
    }, 1200);
}

// Остальные функции без изменений
function playOuchSound() {
    console.log("Пытаемся воспроизвести звук ой");
    
    const ouchAudio = document.getElementById('ouchAudio');
    if (ouchAudio) {
        console.log("Используем существующий аудио элемент");
        ouchAudio.currentTime = 0;
        ouchAudio.play().then(() => {
            console.log("Звук ой воспроизведён успешно");
        }).catch(e => {
            console.log('Ошибка воспроизведения:', e);
            playFallbackOuch();
        });
        return;
    }
    
    console.log("Создаём новый аудио элемент");
    const newOuchAudio = new Audio();
    newOuchAudio.src = 'zagruzau_ser.mp3';
    newOuchAudio.volume = 0.7;
    newOuchAudio.preload = 'auto';
    
    newOuchAudio.play().then(() => {
        console.log("Звук ой воспроизведён успешно (новый элемент)");
    }).catch(e => {
        console.log('Ошибка воспроизведения (новый элемент):', e);
        playFallbackOuch();
    });
}

function playFallbackOuch() {
    console.log("Используем резервный звук");
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.4);
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        
        console.log("Резервный звук воспроизведён");
    } catch (e) {
        console.log('Web Audio API не поддерживается');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем наличие аудио файлов
    const audioElements = document.querySelectorAll('audio[src*="zagruzau_ser"]');
    if (audioElements.length === 0) {
        console.log('🎵 Добавь аудиофайлы zagruzau_ser.wav и zagruzau_ser.mp3');
    }
    
    // Создаём и предзагружаем аудио для "ой"
    preloadOuchSound();
    
    // Обработчик Escape для всех роботов
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && activeRobot) {
            console.log("Escape нажат");
            deactivateRobot(true);
        }
    });
});

// Предзагрузка звука "ой"
function preloadOuchSound() {
    // Проверяем, не создан ли уже элемент
    if (!document.getElementById('ouchAudio')) {
        const ouchAudio = document.createElement('audio');
        ouchAudio.id = 'ouchAudio';
        ouchAudio.src = 'zagruzau_ser.mp3';
        ouchAudio.preload = 'auto';
        ouchAudio.style.display = 'none';
        document.body.appendChild(ouchAudio);
        
        console.log("Аудио элемент для 'ой' создан и предзагружен");
    }
}



// Функция для бургер-меню
function initBurgerMenu() {
    const burgerMenu = document.getElementById('burgerMenu');
    const navList = document.querySelector('.nav-list');
    const body = document.body;

    // Проверяем, существуют ли элементы
    if (!burgerMenu || !navList) {
        console.log('Элементы меню не найдены');
        return;
    }

    console.log('Бургер-меню инициализировано'); // Для отладки

    // Функция переключения меню
    function toggleMenu() {
        burgerMenu.classList.toggle('active');
        navList.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        console.log('Меню переключено'); // Для отладки
    }

    // Функция закрытия меню
    function closeMenu() {
        burgerMenu.classList.remove('active');
        navList.classList.remove('active');
        body.classList.remove('menu-open');
    }

    // Обработчик клика по бургер-меню
    burgerMenu.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Закрытие меню при клике на ссылку
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Закрытие меню при клике вне его области
    document.addEventListener('click', function(e) {
        if (navList.classList.contains('active') && 
            !navList.contains(e.target) && 
            !burgerMenu.contains(e.target)) {
            closeMenu();
        }
    });

    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navList.classList.contains('active')) {
            closeMenu();
        }
    });

    // Автоматическое закрытие меню при изменении размера окна
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен'); // Для отладки
    initBurgerMenu();
});




//Формы
