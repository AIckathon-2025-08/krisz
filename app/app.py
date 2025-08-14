from flask import Flask, request, jsonify, render_template, url_for
from werkzeug.utils import secure_filename
import os

app = Flask(__name__, static_url_path='/static')

# Define the folder for uploads and create it if it doesn't exist
UPLOAD_FOLDER = 'static/uploads'
# Ensure the path is correct for both local and Docker environments
upload_path = os.path.join(os.getcwd(), UPLOAD_FOLDER)
if not os.path.exists(upload_path):
    os.makedirs(upload_path)
app.config['UPLOAD_FOLDER'] = upload_path

# Data structure to hold game information
game_data = {
    "player_name": None,
    "player_image_url": None,
    "statements": [
        {"id": 1, "text": "", "is_lie": False},
        {"id": 2, "text": "", "is_lie": False},
        {"id": 3, "text": "", "is_lie": False}
    ],
    "votes": {},
    "lie_id": None
}

# API endpoint to get game data
@app.route('/api/game', methods=['GET'])
def get_game_data():
    return jsonify({
        "player_name": game_data["player_name"],
        "player_image_url": game_data["player_image_url"],
        "statements": [s["text"] for s in game_data["statements"]],
        "lie_revealed": game_data["lie_id"] is not None
    })

# API endpoint to submit a vote
@app.route('/api/vote', methods=['POST'])
def submit_vote():
    data = request.json
    username = data.get('username')
    vote_id = data.get('vote_id')
    if username and vote_id:
        game_data["votes"][username] = vote_id
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid data"}), 400

# Admin API endpoint to set up the game
@app.route('/api/admin/setup', methods=['POST'])
def setup_game():
    name = request.form.get('name')
    statements = [
        request.form.get('statement-1'),
        request.form.get('statement-2'),
        request.form.get('statement-3')
    ]
    if 'image' not in request.files:
        return jsonify({"success": False, "message": "No file part"}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "message": "No selected file"}), 400
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        image_url = url_for('static', filename=f'uploads/{filename}')
        game_data["player_name"] = name
        game_data["player_image_url"] = image_url
        for i, statement_text in enumerate(statements):
            game_data["statements"][i]["text"] = statement_text
        game_data["votes"] = {}
        game_data["lie_id"] = None
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Failed to upload file"}), 400

# Admin API endpoint to reveal the lie
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

# API endpoint to get voting results
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

# Frontend page for voters
@app.route('/')
def index():
    return render_template('index.html')

# Frontend page for admin
@app.route('/admin')
def admin_page():
    return render_template('admin.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
