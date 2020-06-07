import requests
import config
import json

class ServerAPI:

    @property
    def api_base_url(self):
        return f"http://{config.API_HOST}:{config.API_PORT}/manage"

    def server_status(self):
        return requests.get(f"{self.api_base_url}/server_status").json()

    def republisher_status(self):
        return requests.get(f"{self.api_base_url}/rtmp/republish/stats").json()

    def rtmp_settings(self):
        return requests.get(f"{self.api_base_url}/rtmp_settings").json()

    def reload_config(self):  
        response = requests.post(f"{self.api_base_url}/reload_config").json()
        if response["status"] == "Ok":
            return True
        return False

    def get_rules_config(self):
        with open(config.RULES_CONF_PATH, "r") as conf_fp:
            return json.loads(conf_fp.read())

    def update_rules_config(self, config_data):
        with open(config.RULES_CONF_PATH, "w") as conf_fp:
            conf_fp.write(json.dumps(config_data))
        return self.reload_config()

    def reset_rules_config(self):
        with open("base_config.json", "r") as base_config_fp:
            base_config = json.loads(base_config_fp.read())
            return self.update_rules_config(base_config)