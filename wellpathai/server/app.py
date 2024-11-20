from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase import auth
from register.register import register_blueprint
from login.login import login_blueprint

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(register_blueprint)
app.register_blueprint(login_blueprint)

# OAuth login (GitHub, Google)
# @app.route('/oauth/login/<provider>', methods=['GET'])
# def oauth_login(provider):
#     if provider not in ["github", "google"]:
#         return jsonify({"error": "Unsupported provider"}), 400

#     # Simulated OAuth URL redirection
#     redirect_url = f"https://{provider}.com/oauth/login"
#     return jsonify({"redirect_url": redirect_url})

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to WellPath AI!"})

if __name__ == '__main__':
    app.run(port=5002, debug=True)