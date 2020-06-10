from flask import Flask, request
from server_api import ServerAPI
from flask_cors import CORS
from collections import defaultdict

from typing import List

app = Flask(__name__)
api = ServerAPI()
CORS(app)

def idx(data: any, path: List[str], default: any = None):
    n = data
    for i in path:
        n = n.get(i)
        if not n:
            return default
    return n

@app.route("/")
def connection_check():
    return {"connection": True}


@app.route("/status")
def status():
    return api.server_status()


@app.route("/stream_endpoint", methods=['GET', 'POST'])
def rtmp_settings():
    if request.method == "POST":
        data = request.get_json()
        port = idx(data, ["StreamEndpoint", "port"])
        if port and isinstance(port, int):
            api.update_rtmp_port(port)


    rtmp_settings = api.rtmp_settings()
    return {
        "StreamEndpoint": {
            "port": rtmp_settings["RtmpSettings"]["interfaces"][0]["port"],
            "path": rtmp_settings["RtmpSettings"]["apps"][0]["app"],
            "proto": "rtmps" if rtmp_settings["RtmpSettings"]["interfaces"][0]["ssl"] else "rtmp",
        }
    }

@app.route('/rtmp_publish_settings', methods=["GET", "POST"])
def rtmp_publish_settings():
    if request.method == "POST":
        data = request.get_json()
    
    rtmp_rules = defaultdict(list)
    for rule in api.rtmp_publish_settings():
        rtmp_rules[rule["src_stream"]].append(rule)
    return rtmp_rules

@app.route('/rtmp_publisher')
def rtmp_publisher():
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

@app.route("/rules")
def rules():
    return api.rules_config()


@app.route("/reload")
def reload_config():
    return {"status": "OK" if api.reload_config() else "FAILURE"}


@app.route("/config", methods=["DELETE"])
def reset():
    response = api.reset_rules_config()
    return "OK" if response else "failure"
