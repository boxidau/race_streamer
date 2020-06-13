from functools import wraps
from flask import Flask, request
from server_api import ServerAPI
from flask_cors import CORS
from collections import defaultdict
from uuid import uuid4

import hmac_auth

from typing import List


app = Flask(__name__)
app.config.from_envvar('CONFIG_FILE')
CORS(app)
hmac = hmac_auth.Hmac(app)

api = ServerAPI()


def idx(data: any, path: List[str], default: any = None):
    n = data
    for i in path:
        try:
            n = n[i]
        except (KeyError, IndexError):
            return default

        if not n:
            return default
    return n

@app.route("/")
@hmac.auth()
def connection_check():
    return {"connection": True}


@app.route("/status")
@hmac.auth()
def status():
    return api.server_status()


@app.route("/listener", methods=['GET', 'POST'])
@hmac.auth()
def rtmp_settings():
    if request.method == "POST":
        data = request.get_json()
        port = idx(data, ["StreamEndpoint", "port"])
        if port and isinstance(port, int):
            api.update_rtmp_port(port)


    rtmp_settings = api.rtmp_settings()
    return {
        "StreamEndpoint": {
            "port": idx(rtmp_settings, ["RtmpSettings", "interfaces", 0, "port"], 0),
            "path": idx(rtmp_settings, ["RtmpSettings", "apps", 0, "app"], ""),
            "proto": "rtmps" if idx(rtmp_settings, ["RtmpSettings", "interfaces", 0, "ssl"], False) else "rtmp",
        }
    }

@app.route('/rtmp_publish_settings', methods=["GET", "POST"])
@hmac.auth()
def rtmp_publish_settings():
    if request.method == "POST":
        data = request.get_json()
    
    rtmp_rules = defaultdict(list)
    for rule in api.rtmp_publish_settings():
        rtmp_rules[rule["src_stream"]].append(rule)
    return rtmp_rules

@app.route('/streams')
@hmac.auth()
def stream_info():
    flat_data = {}
    for rule in api.rtmp_publish_settings():
        flat_data[rule["id"]] = {"rule": rule, "stats": None}

    for stream in api.republisher_status()["stats"]:
        flat_data[stream["rule_id"]]["stats"] = stream

    output_data = {}
    for rule_id, data in flat_data.items():
        if data["rule"]["src_stream"] not in output_data:
            output_data[data["rule"]["src_stream"]] = {
                "republish_streams": {},
                "incoming_stream_stats": None
            }
        output_data[data["rule"]["src_stream"]]["republish_streams"][rule_id] = data

    incoming_streams_raw = api.rtmp_status()
    if len(incoming_streams_raw) != 0:
        app = incoming_streams_raw[0]["app"]
        for stream in incoming_streams_raw[0]["streams"]:
            stream["app"] = app
            stream["bandwidth"] = int(stream["bandwidth"])
            stream["publish_time"] = int(stream["publish_time"])
            stream["protocol"] = stream["protocol"].lower()
            if stream["strm"] in output_data:
                output_data[stream["strm"]]["incoming_stream_stats"] = stream

    return output_data

@app.route("/streams/<string:stream_key>", methods=["GET", "DELETE", "POST"])
@hmac.auth()
def stream(stream_key):
    if request.method == "GET":
        data = stream_info()
        return data[stream_key]

    if request.method == "POST":
        data = request.get_json()
        required_fields = [
            ("dest_addr", str),
            ("dest_port", int),
            ("dest_app", str),
            ("dest_stream", str),
            ("dest_login", str),
            ("dest_password", str),
            ("ssl", bool),
        ]
        rtmp_settings = api.rtmp_settings()
        stream = {
            "id": uuid4().hex,
            "auth_schema": "NONE",
            "dest_app_params": "",
            "dest_stream_params": "",
            "keep_src_stream_params": False,
            "src_app": idx(rtmp_settings, ["RtmpSettings", "apps", 0, "app"], ""),
            "src_stream": stream_key,
        }

        for field in required_fields:
            if field[0] not in data:
                return {"error": f"Missing field {field[0]}"}
            if not isinstance(data[field[0]], field[1]):
                return {"error": f"Field {field[0]} should be a {field[1]}"}
            stream[field[0]] = data[field[0]]
        
        if api.create_republish_rule(stream):
            return stream
        return {"error": "Unable to save rule"}

    if request.method == "DELETE":
        return {"OK": api.delete_republish_rules_for_stream(stream_key)}

    return stream_key

@app.route("/streams/<string:stream_key>/<string:rule_key>", methods=["DELETE"])
@hmac.auth()
def stream_rule_delete(stream_key, rule_key):
    return {"OK": api.delete_republish_rule(stream_key, rule_key)}



@app.route("/rules")
@hmac.auth()
def rules():
    return api.rules_config()


@app.route("/reload")
def reload_config():
    return {"status": "OK" if api.reload_config() else "FAILURE"}


@app.route("/config", methods=["DELETE"])
def reset():
    response = api.reset_rules_config()
    return "OK" if response else "failure"
