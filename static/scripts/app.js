document.addEventListener('DOMContentLoaded', function() {
    if (window.Telegram.WebApp) {
        Telegram.WebApp.ready();  // Сообщаем, что веб-приложение готово
        Telegram.WebApp.expand(); // Расширяем веб-приложение на весь экран
    }

    const form = document.getElementById('searchForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Предотвращаем перезагрузку страницы
        searchArtist();
        input.blur(); // Скрываем клавиатуру
    });

    const input = document.getElementById('artistName');
    input.addEventListener('input', function(event) {
        showSuggestions(event.target.value);
    });

    // Плавное появление строки поиска при загрузке страницы
    const searchContainer = document.querySelector('.container.full-width');
    searchContainer.classList.remove('hidden');
});

function searchArtist() {
    clearResults(); // Очищаем результаты перед новым поиском
    const artistName = document.getElementById('artistName').value;
    fetch(`/api/search_artist?name=${artistName}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                displayError(data.error);
            } else {
                displayArtist(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displayError('An error occurred while fetching the artist data.');
        });
}

function getLevelText(popularity) {
    if (popularity >= 80) return '💎';
    if (popularity >= 50) return '⭐️';
    if (popularity >= 20) return '😎';
    return '🎧';
}

function getRankingText(popularity) {
    if (popularity >= 95) return { text: 'TOP 1% IN THE WORLD', class: 'top-1' };
    if (popularity >= 90) return { text: 'TOP 2% IN THE WORLD', class: 'top-2' };
    if (popularity >= 86) return { text: 'TOP 3% IN THE WORLD', class: 'top-3' };
    if (popularity >= 80) return { text: 'TOP 5% IN THE WORLD', class: 'top-5' };
    if (popularity >= 70) return { text: 'TOP 10% IN THE WORLD', class: 'top-10' };
    if (popularity >= 60) return { text: 'TOP 20% IN THE WORLD', class: 'top-20' };
    if (popularity >= 50) return { text: 'TOP 30% IN THE WORLD', class: 'top-30' };
    if (popularity >= 41) return { text: 'TOP 40% IN THE WORLD', class: 'top-40' };
    if (popularity >= 31) return { text: 'TOP 50% IN THE WORLD', class: 'top-50' };
    if (popularity >= 21) return { text: 'TOP 60% IN THE WORLD', class: 'top-60' };
    if (popularity >= 16) return { text: 'TOP 70% IN THE WORLD', class: 'top-70' };
    if (popularity >= 10) return { text: 'TOP 80% IN THE WORLD', class: 'top-80' };
    return { text: 'TOP 90% IN THE WORLD', class: 'top-90' };
}

// Добавил эту функцию
function animateFollowerCount(element, target) {
    let count = 0;
    const step = target / 100;
    const interval = setInterval(() => {
        count += step;
        if (count >= target) {
            count = target;
            clearInterval(interval);
        }
        element.textContent = Math.floor(count).toLocaleString();
    }, 20);
}

function displayArtist(data) {
    const resultsDiv = document.getElementById('results');
    const levelBarWidth = `${data.popularity}%`;
    const levelText = getLevelText(data.popularity);
    const rankingData = getRankingText(data.popularity); // Получаем текст и класс ранжирования

    const spotifyPlayer = `
        <iframe src="https://open.spotify.com/embed/artist/${data.id}" 
            width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media" 
            style="margin-top: 16px; margin-bottom: -12px;">
        </iframe>
    `;

    resultsDiv.innerHTML = `
        <div class="left-badge hidden">
            <span class="left-text">${levelText}</span>
        </div>
        <div class="right-badge hidden ${rankingData.class}">
            <div class="ranking-text">
                <span class="top-percentage">${rankingData.text.split(' ')[0]} ${rankingData.text.split(' ')[1]}</span>
                <br>
                <span class="in-the-world">${rankingData.text.split(' ').slice(2).join(' ')}</span>
            </div>
        </div>
        <img src="${data.image}" alt="${data.name}">
        <h2>${data.name}</h2>
        <div class="level-bar-container">
            <div class="level-bar" style="--bar-width: ${levelBarWidth};">
                <span class="level-text" data-popularity="${data.popularity}">${data.popularity} lvl</span>
            </div>
        </div>
        <p class="followers"><span class="emoji">👤</span> <span class="follower-count" data-followers="${data.followers}">0</span></p>
        <button class="listen" onclick="window.open('https://open.spotify.com/artist/${data.id}', '_blank')">Listen</button>
        <h3 id="top-tracks">Top Tracks</h3>
        <table id="top-tracks-table">
            ${data.top_tracks.map(track => `
                <tr>
                    <td>${track.name}</td>
                    <td>${track.popularity}</td>
                </tr>
            `).join('')}
        </table>
        <div class="spotify-player">${spotifyPlayer}</div>
    `;
    resultsDiv.classList.remove('hidden');

    // Анимируем число подписчиков
    animateFollowerCount(document.querySelector('.follower-count'), data.followers);

    // Анимируем число популярности
    animatePopularityCount(document.querySelector('.level-text'), data.popularity);

    // Показываем иконки уровня
    const leftIcon = document.querySelector('.result-badge.left');
    const rightIcon = document.querySelector('.result-badge.right');
    if (leftIcon && rightIcon) {
        leftIcon.classList.remove('hidden');
        rightIcon.classList.remove('hidden');
    }
}

function animatePopularityCount(element, target) {
    let count = 0;
    const step = target / 100;
    const interval = setInterval(() => {
        count += step;
        if (count >= target) {
            count = target;
            clearInterval(interval);
        }
        element.textContent = `${Math.floor(count)} lvl`;
    }, 20);
}

function displayError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-message">
            <span class="sad-face">▶︎ •၊၊||၊|။||||| 0:10</span>
            <p>звуки марса</p>
        </div>
    `;
    resultsDiv.classList.remove('hidden');
}

function clearResults() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    resultsDiv.classList.add('hidden'); // Скрываем блок с результатами
}

function showSuggestions(query) {
    if (query.length < 2) {
        clearSuggestions();
        return;
    }

    fetch(`/api/search_suggestions?query=${query}`)
        .then(response => response.json())
        .then(data => {
            const suggestions = document.getElementById('suggestions');
            suggestions.innerHTML = data.map(item => `
                <li class="autocomplete-item" onclick="selectSuggestion('${item.name}')">${item.name}</li>
            `).join('');
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function clearSuggestions() {
    document.getElementById('suggestions').innerHTML = '';
}

function selectSuggestion(name) {
    document.getElementById('artistName').value = name;
    clearSuggestions();
    searchArtist();  // Автоматический поиск при выборе подсказки
}