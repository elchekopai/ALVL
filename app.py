import os
import requests
from flask import Flask, request, jsonify, send_from_directory
import base64

app = Flask(__name__, static_folder='static', static_url_path='')

SPOTIFY_CLIENT_ID = "3bfdc521069843d08644baa66d7ee220"
SPOTIFY_CLIENT_SECRET = "0bf61d3329dd4292aa9b702b14762c52"

def get_spotify_token():
    url = "https://accounts.spotify.com/api/token"
    auth_header = base64.b64encode(f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}".encode()).decode('utf-8')
    headers = {
        "Authorization": f"Basic {auth_header}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "client_credentials"
    }
    response = requests.post(url, headers=headers, data=data)
    response.raise_for_status()
    return response.json().get("access_token")

@app.route('/api/search_artist', methods=['GET'])
def search_artist():
    artist_name = request.args.get('name')
    try:
        token = get_spotify_token()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        params = {
            "q": artist_name,
            "type": "artist"
        }
        response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
        response.raise_for_status()

        artist_items = response.json().get('artists', {}).get('items', [])
        if not artist_items:
            app.logger.info(f"Artist '{artist_name}' not found.")
            return jsonify({"error": "Artist not found"}), 404

        artist_data = artist_items[0]

        artist_id = artist_data['id']
        response = requests.get(f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks?market=US", headers=headers)
        response.raise_for_status()

        top_tracks = response.json().get('tracks', [])[:5]

        result = {
            "name": artist_data['name'],
            "followers": artist_data['followers']['total'],
            "popularity": artist_data['popularity'],
            "image": artist_data['images'][0]['url'] if artist_data['images'] else '',
            "top_tracks": [{"name": track['name'], "popularity": track['popularity']} for track in top_tracks]
        }

        return jsonify(result)

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Request failed: {e}")
        return jsonify({"error": "Failed to fetch data from Spotify"}), 500
    except Exception as e:
        app.logger.error(f"Error occurred: {e}")
        return jsonify({"error": "An error occurred"}), 500

@app.route('/api/search_suggestions', methods=['GET'])
def search_suggestions():
    query = request.args.get('query')
    if not query:
        return jsonify([])

    try:
        token = get_spotify_token()
        headers = {
            "Authorization": f"Bearer {token}"
        }
        params = {
            "q": query,
            "type": "artist",
            "limit": 5
        }
        response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
        response.raise_for_status()

        artist_items = response.json().get('artists', {}).get('items', [])
        suggestions = [{"name": artist['name'], "id": artist['id']} for artist in artist_items]

        return jsonify(suggestions)

    except requests.exceptions.RequestException as e:
        app.logger.error(f"Request failed: {e}")
        return jsonify([]), 500

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True, port=5001)