import datetime

from dataclasses import dataclass

from server.aws_tools.rekognition import get_labels
from server.data import _process_rows, SQLConfig, sql_connection
from server.utils.db_utils import QueryConstraints
from server.utils.general_utils import flatten


@dataclass
class Post(object):
    id: str
    username: str
    picture: str
    text: str
    posted_on: datetime.datetime
    edited_on: datetime.datetime
    profile_picture: str = ""
    tags: list = ()


def _post_from_row(row):
    return Post(
        id=row[0],
        username=row[1],
        picture=row[2],
        text=row[3],
        posted_on=row[4],
        edited_on=row[5]
    )


def _posts_from_rows(rows):
    return _process_rows(rows, _post_from_row)


class Posts(object):
    def __init__(self, config: SQLConfig):
        self._config = config

    def _attach_profile_picture(self, posts):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                for post in posts:
                    cur.execute("SELECT profilePicture FROM Users WHERE username=%s",
                                (post.username,))
                    row = cur.fetchone()
                    post.profile_picture = row[0]
        return posts

    def get_post(self, post_id: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                # get main post data
                cur.execute("SELECT * FROM Posts WHERE id=%s;", (post_id,))
                row = cur.fetchone()
                post = _post_from_row(row)

                # get profile pic for associated user
                cur.execute("SELECT profilePicture FROM Users WHERE username=%s", (post.username,))
                row = cur.fetchone()
                post.profile_picture = row[0]

                # get tags for image
                cur.execute("SELECT tag FROM PostTags WHERE postId=%s", (post_id,))
                post.tags = flatten(cur.fetchall())
        return post

    def edit_post(self, post_id: str, text: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE Posts SET text=%s WHERE id=%s;",
                            (text, post_id))

        return self.get_post(post_id)

    def update_post_picture(self, post_id: str, picture: str):
        image_labels = get_labels(picture)
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                # update post tags
                cur.execute("DELETE FROM PostTags WHERE postId=%s;", (post_id,))
                cur.executemany("INSERT INTO PostTags(postId, tag) VALUES (%s, %s);", [(post_id, tag) for tag in image_labels])
                # update posts table
                cur.execute("UPDATE Posts SET picture=%s WHERE id=%s;",
                            (picture, post_id))

        return self.get_post(post_id)

    def user_posts_default(self, username: str):
        return self.user_posts(QueryConstraints(), username)

    def user_posts(self, constraints: QueryConstraints, username: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM Posts "
                            f"WHERE username=%s "
                            f"ORDER BY postedOn {constraints.sort_by} "
                            f"LIMIT {constraints.total} "
                            f"OFFSET {constraints.first};",
                            (username,))
                posts = _posts_from_rows(cur)

        return self._attach_profile_picture(posts)

    def create_post(self, username: str, text: str, picture: str = None):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO Posts "
                            "(username, picture, text) "
                            "VALUES (%s, %s, %s);",
                            (username, picture, text))

        # created post is the latest post
        return self._get_latest_post_from_user(username)

    def search_posts_default(self, search_string: str):
        return self.search_posts(QueryConstraints(), search_string)

    def search_posts(self, constraints: QueryConstraints, search_string: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM Posts "
                            f"WHERE text LIKE CONCAT('%%', %s, '%%') "
                            f"ORDER BY postedOn {constraints.sort_by} "
                            f"LIMIT {constraints.total} "
                            f"OFFSET {constraints.first};",
                            (search_string,))

                posts = _posts_from_rows(cur)

        return self._attach_profile_picture(posts)

    def all_posts(self, constraints: QueryConstraints):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM Posts "
                            f"ORDER BY postedOn {constraints.sort_by} "
                            f"LIMIT {constraints.total} "
                            f"OFFSET {constraints.first};")

                posts = _posts_from_rows(cur)

        return self._attach_profile_picture(posts)

    def feed_posts(self, constraints: QueryConstraints, username: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM Posts "
                            f"WHERE username IN "
                            f"(SELECT following FROM Follows WHERE follower=%s) "
                            f"ORDER BY postedOn DESC "
                            f"LIMIT {constraints.total} "
                            f"OFFSET {constraints.first};",
                            (username,))

                posts = _posts_from_rows(cur)

        return self._attach_profile_picture(posts)

    def delete_post(self, post_id: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM Posts WHERE id=%s", (post_id,))

    def _get_latest_post_from_user(self, username):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM Posts "
                            "WHERE username=%s "
                            "ORDER BY editedOn DESC LIMIT 1", (username))
                row = cur.fetchone()

        return _post_from_row(row)
