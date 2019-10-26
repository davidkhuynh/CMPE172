from server.db import rds
from server.utils.db_utils import QueryConstraints


def get_post(post_id: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Posts WHERE id=%s;", (post_id,))
        row = cur.fetchone()

    return __post_from_row(row)


def edit_post(post_id: str, picture, text):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("UPDATE Posts SET text=%s, picture=%s WHERE id=%s;", (text, picture, post_id))
    conn.commit()

    return get_post(post_id)


def user_posts(constraints: QueryConstraints, username: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Posts "
                    f"WHERE username=%s "
                    f"ORDER BY postedOn {constraints.sort_by} "
                    f"LIMIT {constraints.total} "
                    f"OFFSET {constraints.first};",
                    (username,))
        posts = __posts_from_rows(cur)

    return posts


def create_post(username: str, picture: str, text: str):
    conn = rds.connect()

    # add post to db
    with conn.cursor() as cur:
        cur.execute("INSERT INTO Posts "
                    "(username, picture, text) "
                    "VALUES (%s, %s, %s);",
                    (username, picture, text))
    conn.commit()

    # created post is the latest post
    return __get_latest_post_from_user(conn, username)


def search_posts(constraints: QueryConstraints, search_string: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Posts"
                    f" WHERE text LIKE '%%s%' "
                    f"ORDER BY postedOn {constraints.sort_by} "
                    f"LIMIT {constraints.total} "
                    f"OFFSET {constraints.first};",
                    (search_string,))

        posts = __posts_from_rows(cur)

    return posts


def all_posts(constraints: QueryConstraints):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Posts "
                    f"ORDER BY postedOn {constraints.sort_by} "
                    f"LIMIT {constraints.total} "
                    f"OFFSET {constraints.first};")

        posts = __posts_from_rows(cur)

    return posts


def feed_posts(constraints: QueryConstraints, username: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Posts "
                    f"WHERE username IN "
                        f"(SELECT following FROM Follows WHERE follower=%s) "
                    f"ORDER BY postedOn DESC "
                    f"LIMIT {constraints.total} "
                    f"OFFSET {constraints.first};",
                    (username,))

        posts = __posts_from_rows(cur)

    return posts


def delete_post(post_id: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM Posts WHERE id=%s", (post_id,))
    conn.commit()


## private
def __get_latest_post_from_user(conn, username: str):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Posts "
                    "WHERE username=%s "
                    "ORDER BY editedOn DESC LIMIT 1", (username))
        row = cur.fetchone()

    return __post_from_row(row)


def __post_from_row(row):
    return {
        "id": row[0],
        "username": row[1],
        "picture": row[2],
        "text": row[3],
        "postedOn": row[4],
        "editedOn": row[5]
    } if row else {}


def __posts_from_rows(cur):
    posts = []
    query_result = cur.fetchall()
    for row in query_result:
        posts.append(__post_from_row(row))
    return posts

