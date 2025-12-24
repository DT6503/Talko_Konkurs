// game.js - Игра "Собери код"
$(document).ready(function() {
    console.log("🎮 Игра 'Собери код' загружена");
    
    // ========== ПЕРЕМЕННЫЕ ==========
    let draggedBlock = null;
    let draggedClone = null;
    let placedBlocks = [];
    const correctOrder = [1, 2, 3, 4, 5, 6];
    
    // ========== ПЕРЕТАСКИВАНИЕ ==========
    // Начало перетаскивания
    $('.code-block').on('mousedown', function(e) {
        e.preventDefault();
        startDragging($(this));
    });
    
    // ДВОЙНОЙ КЛИК ДЛЯ ДОБАВЛЕНИЯ
    $('.code-block').on('dblclick', function() {
        const $block = $(this);
        const order = $block.data('order');
        const text = $block.text();
        
        // Проверяем, не добавлен ли уже блок
        if (!placedBlocks.includes(order)) {
            addToEditor(order, text);
            
            // Анимация для обратной связи
            $block.css('opacity', '0.4');
            setTimeout(() => {
                $block.css('opacity', '1');
            }, 200);
        } else {
            showMessage('Этот блок уже добавлен');
        }
    });
    
    function startDragging($block) {
        draggedBlock = $block;
        
        // Клонируем блок для перетаскивания
        draggedClone = draggedBlock.clone();
        draggedClone.addClass('dragging');
        draggedClone.css({
            position: 'fixed',
            zIndex: '10000',
            pointerEvents: 'none',
            width: draggedBlock.outerWidth() + 'px',
            opacity: '0.9',
            transform: 'rotate(2deg)'
        });
        
        $('body').append(draggedClone);
        
        // Делаем оригинал полупрозрачным
        draggedBlock.css('opacity', '0.4');
    }
    
    // Перемещение
    $(document).on('mousemove', function(e) {
        if (!draggedBlock || !draggedClone) return;
        updatePosition(e);
    });
    
    // Отпускание
    $(document).on('mouseup', function(e) {
        if (!draggedBlock || !draggedClone) return;
        
        const editor = $('#codeEditor');
        const rect = editor[0].getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // Проверяем, попал ли блок в редактор
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            const order = draggedBlock.data('order');
            const text = draggedBlock.text();
            
            // Проверяем, не добавлен ли уже блок
            if (!placedBlocks.includes(order)) {
                addToEditor(order, text);
            } else {
                showMessage('Этот блок уже добавлен');
            }
        }
        
        // Удаляем клон и восстанавливаем оригинал
        endDragging();
    });
    
    function updatePosition(e) {
        if (draggedClone) {
            draggedClone.css({
                left: e.pageX - 40 + 'px',
                top: e.pageY - 15 + 'px'
            });
        }
    }
    
    function endDragging() {
        if (draggedClone) {
            draggedClone.remove();
            draggedClone = null;
        }
        if (draggedBlock) {
            draggedBlock.css('opacity', '1');
            draggedBlock = null;
        }
    }
    
    // ========== ДОБАВЛЕНИЕ В РЕДАКТОР ==========
    function addToEditor(order, text) {
        // Проверяем, нет ли уже этого блока
        if (placedBlocks.includes(order)) {
            showMessage('Этот блок уже добавлен');
            return;
        }
        
        // Добавляем блок
        placedBlocks.push(order);
        
        const $editor = $('#codeEditor');
        
        // Убираем placeholder если он есть
        $editor.find('.placeholder').remove();
        
        // Экранируем HTML символы для корректного отображения
        const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Создаем строку кода с анимацией
        const $line = $(`
            <div class="editor-line" data-order="${order}" style="opacity:0;transform:translateY(10px);">
                <span class="line-number">${placedBlocks.length}.</span>
                <span class="line-code">${safeText}</span>
                <button class="remove-line" data-order="${order}" title="Удалить">×</button>
            </div>
        `);
        
        $editor.append($line);
        
        // Анимация появления строки
        setTimeout(() => {
            $line.css({
                opacity: '1',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease'
            });
        }, 10);
        
        // Обновляем счетчик
        updateCounter();
        
        // Автопроверка при заполнении всех блоков
        if (placedBlocks.length === correctOrder.length) {
            setTimeout(() => {
                checkSolution();
            }, 500);
        }
    }
    
    // ========== УДАЛЕНИЕ СТРОКИ ==========
    $('#codeEditor').on('click', '.remove-line', function() {
        const order = parseInt($(this).data('order'));
        removeLine(order);
    });
    
    function removeLine(order) {
        // Находим строку
        const $line = $(`.editor-line[data-order="${order}"]`);
        
        // Анимация удаления
        $line.css({
            opacity: '0',
            transform: 'translateX(-10px)',
            transition: 'all 0.3s ease'
        });
        
        setTimeout(() => {
            // Удаляем строку
            $line.remove();
            
            // Обновляем placedBlocks
            placedBlocks = placedBlocks.filter(o => o !== order);
            
            // Обновляем номера строк
            updateLineNumbers();
            
            // Обновляем счетчик
            updateCounter();
            
            // Если редактор пуст, показываем placeholder
            if (placedBlocks.length === 0) {
                $('#codeEditor').html('<div class="placeholder">Перетащите блоки сюда</div>');
            }
        }, 300);
    }
    
    function updateLineNumbers() {
        $('.editor-line').each(function(index) {
            $(this).find('.line-number').text((index + 1) + '.');
        });
    }
    
    function updateCounter() {
        $('#blocksCount').text(placedBlocks.length);
    }
    
    // ========== ПРОВЕРКА ==========
    $('#checkCode').click(function() {
        checkSolution();
    });
    
    function checkSolution() {
        const $result = $('#gameResult');
        
        // Проверяем пустой ли редактор
        if (placedBlocks.length === 0) {
            $result.html('<div class="result-content">❌ Добавьте блоки кода</div>')
                   .addClass('error')
                   .css({opacity: 0})
                   .show()
                   .animate({opacity: 1}, 300);
            return;
        }
        
        // Проверяем все ли блоки
        if (placedBlocks.length !== correctOrder.length) {
            $result.html(`<div class="result-content">📝 Добавлено ${placedBlocks.length} из ${correctOrder.length} блоков</div>`)
                   .addClass('warning')
                   .css({opacity: 0})
                   .show()
                   .animate({opacity: 1}, 300);
            return;
        }
        
        // Проверяем правильность
        let isCorrect = true;
        let correctPositions = 0;
        
        for (let i = 0; i < correctOrder.length; i++) {
            if (placedBlocks[i] === correctOrder[i]) {
                correctPositions++;
            } else {
                isCorrect = false;
            }
        }
        
        // Показываем результат с анимацией
        if (isCorrect) {
            $result.html('<div class="result-content">✅ Отлично! Программа собрана верно</div>')
                   .addClass('success')
                   .css({opacity: 0, transform: 'scale(0.9)'})
                   .show()
                   .animate({opacity: 1, transform: 'scale(1)'}, 400);
            
            // Подсвечиваем правильные блоки с анимацией
            $('.code-block').each(function(index) {
                const $block = $(this);
                setTimeout(() => {
                    $block.addClass('correct');
                }, index * 100);
            });
        } else {
            $result.html(`<div class="result-content">⚠️ Правильно расположено: ${correctPositions} из ${correctOrder.length} блоков</div>`)
                   .addClass('warning')
                   .css({opacity: 0})
                   .show()
                   .animate({opacity: 1}, 300);
        }
    }
    
    // ========== СБРОС ==========
    $('#resetGame').click(function() {
        resetGame();
    });
    
    // Сброс по двойному клику на редакторе
    $('#codeEditor').on('dblclick', function(e) {
        if (!$(e.target).hasClass('remove-line') && !$(e.target).hasClass('line-code') && !$(e.target).hasClass('line-number')) {
            resetGame();
        }
    });
    
    // Сброс по двойному клику на любом блоке кода (добавляем альтернативный способ сброса)
    $('.code-blocks-container').on('dblclick', function(e) {
        if ($(e.target).hasClass('code-block')) {
            // Если кликнули по блоку - добавление уже обрабатывается выше
            return;
        }
        // Если кликнули по пустой области контейнера блоков
        resetGame();
    });
    
    function resetGame() {
        // Анимация удаления всех строк
        $('.editor-line').each(function(index) {
            const $line = $(this);
            setTimeout(() => {
                $line.css({
                    opacity: '0',
                    transform: 'translateX(20px)',
                    transition: 'all 0.3s ease'
                });
            }, index * 50);
        });
        
        setTimeout(() => {
            // Очищаем массив
            placedBlocks = [];
            
            // Очищаем редактор
            $('#codeEditor').html('<div class="placeholder">Перетащите блоки сюда</div>');
            
            // Скрываем результат
            $('#gameResult').hide().removeClass('success warning error');
            
            // Обновляем счетчик
            updateCounter();
            
            // Снимаем подсветку с блоков
            $('.code-block').removeClass('correct').css('opacity', '1');
            
            // Анимация восстановления блоков
            $('.code-block').css('opacity', '0.7');
            setTimeout(() => {
                $('.code-block').css('opacity', '1');
            }, 300);
            
            showMessage('Игра сброшена');
        }, 300);
    }
    
    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
    function showMessage(text) {
        // Временное сообщение на экране
        const $msg = $(`<div class="temp-message">${text}</div>`);
        $msg.css({
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(126, 73, 250, 0.9)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            zIndex: '10001',
            opacity: '0',
            transform: 'translateX(100px)'
        });
        
        $('body').append($msg);
        
        // Анимация появления и исчезновения
        $msg.animate({
            opacity: 1,
            transform: 'translateX(0)'
        }, 300);
        
        setTimeout(() => {
            $msg.animate({
                opacity: 0,
                transform: 'translateX(100px)'
            }, 300, function() {
                $(this).remove();
            });
        }, 2000);
    }
    
    // Добавляем стили для временных сообщений
    $('head').append(`
        <style>
            .temp-message {
                font-family: 'Inter', sans-serif;
                font-weight: 500;
                box-shadow: 0 4px 15px rgba(126, 73, 250, 0.3);
                backdrop-filter: blur(10px);
            }
        </style>
    `);
    
    console.log("✅ Игра готова! (двойной клик для добавления блоков)");
});