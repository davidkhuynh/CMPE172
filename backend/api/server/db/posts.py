from server.db import rds
from server.utils.db_utils import QueryConstraints, SORT_ORDERS


def post_from_row(row):
    return {
        "id": row[0],
        "username": row[1],
        "picture": row[2],
        "text": row[3],
        "postedOn": row[4],
        "editedOn": row[5]
    } if row else {}


def get_post(post_id: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Posts WHERE id=%s;", (post_id))
        row = cur.fetchone()

    return post_from_row(row)


def edit_post(post_id: str, request_data):
    picture = request_data["picture"]  # in case new picture is a different format
    text = request_data["text"]
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("UPDATE Posts SET text=%s WHERE id=%s;", (post_id, picture, text))

    return get_post(post_id)


def user_posts(constraints: QueryConstraints, username: str):
    posts = []
    total_items = constraints.last - constraints.first
    order = SORT_ORDERS[constraints.sort_by]

    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Posts WHERE username=%s ORDER BY {order} LIMIT {total_items}, {constraints.first};",
                    (username))
        query_result = cur.fetchall()
        for row in query_result:
            posts.append(post_from_row(row))

    return posts


def create_post(request_data):
    return None


def search_posts():
    return None


def feed_posts():
    return None
