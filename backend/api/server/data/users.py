import datetime
from datetime import date

from dataclasses import dataclass
from pymysql import Connection

from server.data import _process_rows, sql_connection, SQLConfig
from server.utils.db_utils import QueryConstraints
from server.utils.general_utils import flatten


@dataclass
class User(object):
    username: str = ""
    birthday: datetime.date = datetime.datetime.now().date()
    created_on: datetime.datetime = datetime.datetime.now()
    display_name: str = ""
    bio: str = ""


def _user_from_row(row):
    return User(
        username=row[0],
        birthday=row[1],
        display_name=row[2],
        bio=row[3],
        created_on=row[4]
    ) if row else None


def _users_from_rows(rows):
    return _process_rows(rows, _user_from_row)


class Users(object):
    conn: Connection

    def __init__(self, config: SQLConfig):
        self._config = config

    def get_user(self, username: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM Users WHERE username=%s;", (username,))
                user_data = cur.fetchone()

        return _user_from_row(user_data)

    def create_user(self, user_data: User):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO Users "
                    "(username, birthday, displayName, bio) "
                    "VALUES (%s, %s, %s, %s);",
                    (user_data.username,
                     user_data.birthday,
                     user_data.display_name,
                     user_data.bio))

        return self.get_user(user_data.username)

    def edit_user(self, username: str, user_data: User):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE Users "
                            "SET displayName=%s, "
                            "bio=%s "
                            "WHERE username=%s;",
                            (user_data.display_name,
                             user_data.bio,
                             username))

        return self.get_user(username)

    def follow(self, follower: str, following: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                # check if follower is already following user
                cur.execute("SELECT following FROM Follows WHERE follower=%s AND following=%s;",
                            (follower, following))
                if cur.fetchone():
                    return False

                # follow user
                cur.execute("INSERT INTO Follows (follower, following) VALUES (%s, %s);",
                            (follower, following))

    def unfollow(self, follower: str, following: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                # check if follower is already following user before unfollowing
                cur.execute("SELECT following FROM Follows WHERE follower=%s AND following=%s;",
                            (follower, following))
                if not cur.fetchone():
                    return False

                # unfollow user
                cur.execute("DELETE FROM Follows WHERE follower=%s AND following=%s;",
                            (follower, following))

        return True

    def following_default(self, username: str):
        return self.following(QueryConstraints(), username)

    def following(self, constraints: QueryConstraints, username: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT following FROM Follows "
                            f"WHERE follower=%s "
                            f"LIMIT {constraints.total} "
                            f"OFFSET {constraints.first};",
                            (username,))
            followed_by = flatten(cur.fetchall())

        return followed_by

    def followers_default(self, username: str):
        return self.followers(QueryConstraints(), username)

    def followers(self, constraints: QueryConstraints, username: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM Follows "
                            f"WHERE following=%s "
                            f"LIMIT {constraints.total} "
                            f"OFFSET {constraints.first};",
                            (username,))
            followers = flatten(cur.fetchall())
        return followers

    def search_users_default(self, search_str: str):
        return self.search_users(QueryConstraints(), search_str)

    def search_users(self, constraints: QueryConstraints, search_string: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT * FROM Users"
                            f" WHERE username LIKE CONCAT('%%', %s, '%%')"
                            f" ORDER BY username {constraints.sort_by}"
                            f" LIMIT {constraints.total}"
                            f" OFFSET {constraints.first};",
                            (search_string,))
            rows = cur.fetchall()

        users = _users_from_rows(rows)
        return users

    def delete_user(self, username: str):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM Users WHERE username=%s", (username,))
