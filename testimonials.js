// JavaScript для работы с отзывами
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const form = document.getElementById('testimonialForm');
    const authorNameInput = document.getElementById('authorName');
    const testimonialTextInput = document.getElementById('testimonialText');
    const ratingInput = document.getElementById('rating');
    const stars = document.querySelectorAll('.star');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const testimonialsContainer = document.getElementById('testimonialsContainer');
    const notification = document.getElementById('notification');
    
    let selectedRating = 0;
    
    // Инициализация рейтинга
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            ratingInput.value = selectedRating;
            
            // Обновление визуального отображения звезд
            stars.forEach((s, index) => {
                if (index < selectedRating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        });
        
        // Эффект при наведении
        star.addEventListener('mouseover', function() {
            const hoverRating = parseInt(this.dataset.rating);
            stars.forEach((s, index) => {
                if (index < hoverRating) {
                    s.classList.add('active');
                    s.textContent = '★';
                }
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach((s, index) => {
                if (index >= selectedRating) {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        });
    });
    
    // Загрузка отзывов из LocalStorage
    function loadTestimonials() {
        const testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
        testimonialsContainer.innerHTML = '';
        
        if (testimonials.length === 0) {
            testimonialsContainer.innerHTML = `
                <div class="empty-testimonials">
                    <p>Пока нет отзывов. Будьте первым!</p>
                    <p style="font-size: 0.9rem; opacity: 0.7;">Оставьте свой отзыв выше 👆</p>
                </div>
            `;
            return;
        }
        
        // Сортируем по дате (новые первые)
        testimonials.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        testimonials.forEach(testimonial => {
            const testimonialElement = document.createElement('div');
            testimonialElement.className = 'testimonial-item';
            
            // Создание строки рейтинга
            let starsHtml = '';
            if (testimonial.rating > 0) {
                for (let i = 1; i <= 5; i++) {
                    starsHtml += i <= testimonial.rating ? '★' : '☆';
                }
            }
            
            testimonialElement.innerHTML = `
                <div class="testimonial-header">
                    <div class="testimonial-author">${escapeHtml(testimonial.author)}</div>
                    <div class="testimonial-date">${formatDate(testimonial.date)}</div>
                </div>
                ${testimonial.rating > 0 ? `<div class="testimonial-rating">${starsHtml}</div>` : ''}
                <div class="testimonial-text">${escapeHtml(testimonial.text)}</div>
            `;
            
            testimonialsContainer.appendChild(testimonialElement);
        });
    }
    
    // Обработка отправки формы
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const author = authorNameInput.value.trim();
        const text = testimonialTextInput.value.trim();
        const rating = parseInt(ratingInput.value) || 0;
        
        if (!author || !text) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }
        
        if (author.length < 2) {
            showNotification('Имя должно содержать минимум 2 символа', 'error');
            return;
        }
        
        if (text.length < 10) {
            showNotification('Отзыв должен содержать минимум 10 символов', 'error');
            return;
        }
        
        // Показать загрузку
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        submitBtn.disabled = true;
        
        // Имитация задержки сети
        setTimeout(() => {
            // Создание нового отзыва
            const newTestimonial = {
                id: Date.now(),
                author: author,
                text: text,
                rating: rating,
                date: new Date().toISOString()
            };
            
            // Получение существующих отзывов
            const testimonials = JSON.parse(localStorage.getItem('testimonials')) || [];
            
            // Добавление нового отзыва
            testimonials.push(newTestimonial);
            
            // Сохранение в LocalStorage
            localStorage.setItem('testimonials', JSON.stringify(testimonials));
            
            // Очистка формы
            form.reset();
            ratingInput.value = 0;
            selectedRating = 0;
            
            // Сброс звезд
            stars.forEach(star => {
                star.classList.remove('active');
                star.textContent = '☆';
            });
            
            // Сброс лейблов формы
            const labels = form.querySelectorAll('.form-label');
            labels.forEach(label => {
                label.style.top = '1rem';
                label.style.left = '1rem';
                label.style.fontSize = '0.95rem';
                label.style.color = 'var(--gray)';
            });
            
            // Обновление списка отзывов
            loadTestimonials();
            
            // Показать уведомление
            showNotification('Отзыв успешно добавлен! ✨', 'success');
            
            // Скрыть загрузку
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            
            // Фокус на поле имени
            authorNameInput.focus();
            
        }, 1000); // Имитация задержки
    });
    
    // Функция показа уведомления
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = 'notification';
        
        if (type === 'error') {
            notification.style.background = '#dc2626';
            notification.style.color = 'white';
        } else {
            notification.style.background = 'var(--purple)';
            notification.style.color = 'white';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
    
    // Функция форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Сегодня';
        } else if (diffDays === 1) {
            return 'Вчера';
        } else if (diffDays < 7) {
            return `${diffDays} дня назад`;
        } else {
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        }
    }
    
    // Функция экранирования HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Загрузить отзывы при загрузке страницы
    loadTestimonials();
    
    // Фокус на поле имени
    authorNameInput.focus();
    
    // Анимация спиннера
    const spinner = btnLoader.querySelector('.spinner');
    if (spinner) {
        let rotation = 0;
        setInterval(() => {
            rotation += 10;
            spinner.style.transform = `rotate(${rotation}deg)`;
        }, 50);
    }
});