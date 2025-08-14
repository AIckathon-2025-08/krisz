from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Adatstruktúra a játék adatainak tárolására
game_data = {
    "candidate_name": None,
    "candidate_image_url": None,
    "statements": [
        {"id": 1, "text": "", "is_lie": False},
        {"id": 2, "text": "", "is_lie": False},
        {"id": 3, "text": "", "is_lie": False}
    ],
    "votes": {}, # A szavazatokat tároljuk itt: {"username": vote_id}
    "lie_id": None
}

# API a játék állapotának lekéréséhez
@app.route('/api/game', methods=['GET'])
def get_game_data():
    return jsonify({
        "candidate_name": game_data["candidate_name"],
        "candidate_image_url": game_data["candidate_image_url"],
        "statements": [s["text"] for s in game_data["statements"]],
        "lie_revealed": game_data["lie_id"] is not None
    })

# API a szavazatok leadásához
@app.route('/api/vote', methods=['POST'])
def submit_vote():
    data = request.json
    username = data.get('username')
    vote_id = data.get('vote_id')
    if username and vote_id:
        game_data["votes"][username] = vote_id
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid data"}), 400

# Admin API a játék beállításához
@app.route('/api/admin/setup', methods=['POST'])
def setup_game():
    data = request.json
    game_data["candidate_name"] = data.get('name')
    game_data["candidate_image_url"] = data.get('image_url')
    for i, statement_text in enumerate(data.get('statements', [])):
        game_data["statements"][i]["text"] = statement_text
        game_data["statements"][i]["is_lie"] = False
    game_data["votes"] = {}
    game_data["lie_id"] = None
    return jsonify({"success": True})

# Admin API a hazugság kijelöléséhez
@app.route('/api/admin/reveal', methods=['POST'])
def reveal_lie():
    data = request.json
    lie_id = data.get('lie_id')
    if lie_id and 1 <= lie_id <= 3:
        for s in game_data["statements"]:
            s["is_lie"] = (s["id"] == lie_id)
        game_data["lie_id"] = lie_id
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid lie ID"}), 400

# API a szavazatok eredményének lekéréséhez
@app.route('/api/results', methods=['GET'])
def get_results():
    results = {}
    for vote_id in range(1, 4):
        results[vote_id] = 0

    for vote in game_data["votes"].values():
        results[vote] += 1

    return jsonify({
        "results": results,
        "lie_id": game_data["lie_id"]
    })

# Frontend oldalak
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin_page():
    return render_template('admin.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
