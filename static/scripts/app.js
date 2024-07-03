document.addEventListener('DOMContentLoaded', function() {
    // Получаем информацию о веб-приложении Telegram
    const tgWebApp = window.Telegram.WebApp;

    // Автоматически разворачиваем веб-приложение
    tgWebApp.expand();

    // Ваши остальные настройки и обработчики событий
    const input = document.getElementById('artistName');
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchArtist();
        }
    });

    input.addEventListener('input', function(event) {
        showSuggestions(event.target.value);
    });

    const searchContainer = document.querySelector('.container.full-width');
    searchContainer.classList.remove('hidden');
});

function searchArtist() {
    clearResults();
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
    if (popularity >= 80) return 'SUPER STAR';
    if (popularity >= 50) return 'STAR';
    if (popularity >= 20) return 'ARTIST';
    return 'FRESHMAN';
}

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
    const spotifyPlayer = `
        <iframe src="https://open.spotify.com/embed/artist/${data.id}" 
            width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media" 
            style="margin-top: 16px; margin-bottom: -12px;">
        </iframe>
    `;

    resultsDiv.innerHTML = `
        <div class="image-container">
            <img src="${data.image}" alt="${data.name}">
            <div class="corner-badge hidden">
                <span>${levelText}</span>
            </div>
        </div>
        <h2>${data.name}</h2>
        <div class="level-bar-container">
            <div class="level-bar" style="--bar-width: ${levelBarWidth};">
                <span class="level-text" data-popularity="${data.popularity}">0</span>
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

    animateFollowerCount(document.querySelector('.follower-count'), data.followers);
    animatePopularityCount(document.querySelector('.level-text'), data.popularity);

    const cornerBadge = document.querySelector('.corner-badge');
    if (cornerBadge) {
        cornerBadge.textContent = levelText;
        cornerBadge.classList.remove('hidden');
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
        element.textContent = Math.floor(count);
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
    resultsDiv.classList.add('hidden');
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
    searchArtist();
}