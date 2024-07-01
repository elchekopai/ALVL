document.addEventListener('DOMContentLoaded', function() {
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

function displayArtist(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <img src="${data.image}" alt="${data.name}">
        <h2>${data.name} <span class="popularity">(${data.popularity})</span></h2>
        <button class="listen" onclick="window.open('https://open.spotify.com/artist/${data.id}', '_blank')">Listen</button>
        <p class="followers">Followers: ${data.followers.toLocaleString()}</p>
        <h3 id="top-tracks">Top Tracks</h3>
        <table>
            ${data.top_tracks.map(track => `
                <tr>
                    <td>${track.name}</td>
                    <td>${track.popularity}</td>
                </tr>
            `).join('')}
        </table>
    `;
    resultsDiv.classList.remove('hidden'); // Показываем блок с результатами
}

function displayError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="error-message">
            <span class="sad-face">😢</span>
            <p>пукпук-среньк</p>
        </div>
    `;
    resultsDiv.classList.remove('hidden'); // Показываем блок с ошибкой
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