from server.data import _process_rows
from server.utils.db_utils import QueryConstraints


def _post_from_row(row):
    return {
        "id": row[0],
        "username": row[1],
        "picture": row[2],
        "text": row[3],
        "postedOn": row[4],
        "editedOn": row[5]
    } if row else {}


def _posts_from_rows(rows):
    return _process_rows(rows, _post_from_row)

class Posts(object):
    def __init__(self, conn):
        self._conn = conn

    def get_post(self, post_id: str):
        with self._conn.cursor() as cur:
            cur.execute("SELECT * FROM Posts WHERE id=%s;", (post_id,))
            row = cur.fetchone()

        return _post_from_row(row)

    def edit_post(self, post_id: str, picture, text):
        with self._conn.cursor() as cur:
            cur.execute("UPDATE Posts SET text=%s, picture=%s WHERE id=%s;",
                        (text, picture, post_id))
        self._conn.commit()

        return self.get_post(post_id)

    def user_posts(self, constraints: QueryConstraints, username: str):
        with self._conn.cursor() as cur:
            cur.execute(f"SELECT * FROM Posts "
                        f"WHERE username=%s "
                        f"ORDER BY postedOn {constraints.sort_by} "
                        f"LIMIT {constraints.total} "
                        f"OFFSET {constraints.first};",
                        (username,))
            posts = _posts_from_rows(cur)

        return posts

    def create_post(self, username: str, picture: str, text: str):
        # add post to secrets
        with self._conn.cursor() as cur:
            cur.execute("INSERT INTO Posts "
                        "(username, picture, text) "
                        "VALUES (%s, %s, %s);",
                        (username, picture, text))
        self._conn.commit()

        # created post is the latest post
        return self._get_latest_post_from_user(self._conn, username)

    def search_posts(self, constraints: QueryConstraints, search_string: str):
        with self._conn.cursor() as cur:
            cur.execute(f"SELECT * FROM Posts"
                        f" WHERE text LIKE '%%s%' "
                        f"ORDER BY postedOn {constraints.sort_by} "
                        f"LIMIT {constraints.total} "
                        f"OFFSET {constraints.first};",
                        (search_string,))

            posts = _posts_from_rows(cur)

        return posts

    def all_posts(self, constraints: QueryConstraints):
        with self._conn.cursor() as cur:
            cur.execute(f"SELECT * FROM Posts "
                        f"ORDER BY postedOn {constraints.sort_by} "
                        f"LIMIT {constraints.total} "
                        f"OFFSET {constraints.first};")

            posts = _posts_from_rows(cur)

        return posts

    def feed_posts(self, constraints: QueryConstraints, username: str):
        with self._conn.cursor() as cur:
            cur.execute(f"SELECT * FROM Posts "
                        f"WHERE username IN "
                        f"(SELECT following FROM Follows WHERE follower=%s) "
                        f"ORDER BY postedOn DESC "
                        f"LIMIT {constraints.total} "
                        f"OFFSET {constraints.first};",
                        (username,))

            posts = _posts_from_rows(cur)

        return posts

    def delete_post(self, post_id: str):
        with self._conn.cursor() as cur:
            cur.execute("DELETE FROM Posts WHERE id=%s", (post_id,))
        self._conn.commit()

    def _get_latest_post_from_user(self, username):
        with self._conn.cursor() as cur:
            cur.execute("SELECT * FROM Posts "
                        "WHERE username=%s "
                        "ORDER BY editedOn DESC LIMIT 1", (username))
            row = cur.fetchone()

        return _post_from_row(row)


