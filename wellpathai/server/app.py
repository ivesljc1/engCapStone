from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase import auth
from register.register import register_blueprint
from login.login import login_blueprint
from forgetpw.forgetpw import forgetpw_blueprint

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(register_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(forgetpw_blueprint)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to WellPath AI!"})

if __name__ == '__main__':
    app.run(port=5002, debug=True)