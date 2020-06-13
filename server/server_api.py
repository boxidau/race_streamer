import requests
import config as system_config
import json


class ServerAPI:
    @property
    def api_base_url(self):
        return f"http://{system_config.API_HOST}:{system_config.API_PORT}/manage"

    def server_status(self):
        return requests.get(f"{self.api_base_url}/server_status").json()

    def republisher_status(self):
        return requests.get(f"{self.api_base_url}/rtmp/republish/stats").json()

    def rtmp_settings(self):
        return requests.get(f"{self.api_base_url}/rtmp_settings").json()

    def rtmp_status(self):
        return requests.get(f"{self.api_base_url}/rtmp_status").json()

    def reload_config(self) -> bool:
        response = requests.post(f"{self.api_base_url}/reload_config").json()
        if response["status"] == "Ok":
            return True
        return False

    def update_rtmp_port(self, port) -> bool:
        config_data = self.rules_config()
        config_data["SyncResponse"]["RtmpSettings"]["interfaces"][0]["port"] = port
        return self.update_rules_config(config_data)

    def rtmp_publish_settings(self):
        config_data = self.rules_config()
        return config_data["SyncResponse"]["RtmpPublishSettings"]["settings"]

    def rules_config(self):
        with open(system_config.RULES_CONF_PATH, "r") as conf_fp:
            return json.loads(conf_fp.read())

    def create_republish_rule(self, rule) -> bool:
        config_data = self.rules_config()
        config_data["SyncResponse"]["RtmpPublishSettings"]["settings"].append(rule)
        return self.update_rules_config(config_data)

    def delete_republish_rules_for_stream(self, stream_key) -> bool:
        config_data = self.rules_config()
        config_data["SyncResponse"]["RtmpPublishSettings"]["settings"] = [
            rule
            for rule in config_data["SyncResponse"]["RtmpPublishSettings"]["settings"]
            if rule["src_stream"] != stream_key
        ]
        return self.update_rules_config(config_data)

    def delete_republish_rule(self, stream_key, rule_id) -> bool:
        config_data = self.rules_config()
        config_data["SyncResponse"]["RtmpPublishSettings"]["settings"] = [
            rule
            for rule in config_data["SyncResponse"]["RtmpPublishSettings"]["settings"]
            if not (rule["src_stream"] == stream_key and rule["id"] == rule_id)
        ]
        return self.update_rules_config(config_data)

    def update_rules_config(self, config_data):
        with open(system_config.RULES_CONF_PATH, "w") as conf_fp:
            conf_fp.write(json.dumps(config_data))
        return self.reload_config()

    def reset_rules_config(self):
        with open("base_config.json", "r") as base_config_fp:
            base_config = json.loads(base_config_fp.read())
            return self.update_rules_config(base_config)

    def get_external_ip(self):
        ipv4 = requests.get("https://ipv4.icanhazip.com/").text.strip("\n")
        ip = requests.get("https://icanhazip.com/").text.strip("\n")
        if ip != ipv4:
            return {
                "ipv6": ip,
                "ipv4": ipv4,
            }
        return {"ipv6": None, "ipv4": ipv4}
