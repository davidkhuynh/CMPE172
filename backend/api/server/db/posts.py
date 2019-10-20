from typing import List
from server.db import rds

def get_post(id: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Posts WHERE id=%s;", (id))
        post_data = cur.fetchone()

    return {
        "id" : post_data[0],
        "username" : post_data[1],
        "picture" : post_data[2],
        "text" : post_data[3],
        "postedOn"   : post_data[4],
        "editedOn" : post_data[5]
    } if post_data else {}

def edit_post(id: str, request_data):
    picture = request_data["picture"] # in case new picture is a different format
    text = request_data["text"]
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("UPDATE Posts SET text=%s WHERE id=%s;" (id, picture, text))

    return get_post(id)
