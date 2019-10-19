from server import app

@app.route("/test")
def test():
    return {
        "data": "test"
    }
