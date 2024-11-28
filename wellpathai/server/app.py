from flask import Flask, request, jsonify
from flaskcors import CORS
from firebase import auth
from register.register import registerblueprint
from login.login import loginblueprint
from forgetpw.forgetpw import forgetpwblueprint
from recommendation import recommendationblueprint


app = Flask(_name)
CORS(app)  # Enable CORS for all routes

app.register_blueprint(register_blueprint)
app.register_blueprint(login_blueprint)
app.register_blueprint(forgetpw_blueprint)
app.register_blueprint(recommendation_blueprint)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to WellPath AI!"})

if __name == '__main':
    app.run(port=5002, debug=True)