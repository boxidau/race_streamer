#!/bin/bash

. venv/bin/activate

if [[ $1 == "DEV" ]]
then
    export FLASK_ENV=development
fi

export FLASK_APP=main.py
export CONFIG_FILE=server.cfg
flask run --host=0.0.0.0
