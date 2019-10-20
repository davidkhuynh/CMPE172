from typing import List
from server.db import rds
from server.utils import QueryConstraints


def post_from_row(row):
    return {
        "id" : post_data[0],
        "username" : post_data[1],
        "picture" : post_data[2],
        "text" : post_data[3],
        "postedOn"   : post_data[4],
        "editedOn" : post_data[5]
    } if post_data else {}

def get_post(id: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Posts WHERE id=%s;", (id))
        post_data = cur.fetchone()

    return post_from_row(post_data)


def edit_post(id: str, request_data):
    picture = request_data["picture"] # in case new picture is a different format
    text = request_data["text"]
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("UPDATE Posts SET text=%s WHERE id=%s;", (id, picture, text))

    return get_post(id)

ORDERS = {
    "mostRecent" : "DESC",
    "leastRecent" : "ASC"
}


def user_posts(constraints: QueryConstraints, username: str):
    posts = []
    total_items = constraints.last - constraints.first
    order = ORDERS[constraints.sort_by]

    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Posts WHERE username=%s ORDER BY {order} LIMIT {total_items}, {constraints.first};", (username))
        query_result = cur.fetchall()
        for row in query_result:
            posts.append(post_from_row(row))

    return posts

