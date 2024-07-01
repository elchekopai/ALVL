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
        <h2>${data.name}</h2>
        <button class="listen" onclick="window.open('https://open.spotify.com/artist/${data.id}', '_blank')">LISTEN</button>
        <p class="followers">Followers: ${data.followers.toLocaleString()}</p>
        <p class="popularity">Popularity: ${data.popularity}</p>
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
}

function displayError(message) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `<p class="error">${message}</p>`;
}

function getPopularityClass(popularity) {
    if (popularity < 10) return 'white';
    if (popularity < 20) return 'light-red';
    if (popularity < 50) return 'light-yellow';
    if (popularity < 80) return 'light-blue';
    return 'light-green';
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
    searchArtist();  // Добавлено для автоматического поиска при выборе подсказки
}