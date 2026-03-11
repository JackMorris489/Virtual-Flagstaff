import json

def load_json(filepath: str):
    with open(filepath) as file:
        return json.load(file)