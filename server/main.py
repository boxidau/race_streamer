from flask import Flask
app = Flask(__name__)
from server_api import ServerAPI

api = ServerAPI()

@app.route('/')
def hello_world():
    return api.get_rules_config()
    return 'Hello, World!'

@app.route('/rtmp_settings')
def rtmp_settings():
    return api.rtmp_settings()

@app.route('/rules')
def get_rules():
    return api.get_rules_config()

@app.route('/reload')
def reload_config():
    # config_data = api.get_rules_config()
    # config_data["SyncResponse"]["Aliases"]["hash"] = "0"
    # response = api.update_rules_config(config_data)

    response = api.reset_rules_config()
    
    return "OK" if response else "failure"