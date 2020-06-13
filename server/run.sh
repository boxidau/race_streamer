#!/bin/bash

. venv/bin/activate

export FLASK_APP=main.py
export FLASK_ENV=development
export CONFIG_FILE=server.cfg
flask run --host=0.0.0.0
