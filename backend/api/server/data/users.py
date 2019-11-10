from pymysql import Connection

from server.data import _process_rows
from server.utils.db_utils import QueryConstraints, User
from server.utils.general_utils import flatten


def _user_from_row(row):
    return {
        "username": row[0],
        "birthday": row[1],
        "firstName": row[2],
        "lastName": row[3],
        "bio": row[4],
        "createdOn": row[5]
    } if row else {}


def _users_from_rows(rows):
    return _process_rows(rows, _user_from_row)


class Users(object):
    conn: Connection
    def __init__(self, conn):
        self._conn = conn

    def get_user(self, username: str):
        with self._conn.cursor() as cur:
            cur.execute("SELECT * FROM Users WHERE username=%s;", (username,))
            user_data = cur.fetchone()

        return _user_from_row(user_data)

    def create_user(self, user_data: User):
        with self._conn.cursor() as cur:
            cur.execute(
                "INSERT INTO Users "
                "(username, birthday, firstName, lastName, bio) "
                "VALUES (%s, %s, %s, %s, %s);",
                (user_data.username,
                 user_data.birthday,
                 user_data.first_name,
                 user_data.last_name,
                 user_data.bio))
        self._conn.commit()

        return self.get_user(user_data.username)

    def edit_user(self, username: str, user_data: User):
        with self._conn.cursor() as cur:
            cur.execute("UPDATE Users "
                        "SET firstName=%s, "
                        "lastName=%s, "
                        "bio=%s "
                        "WHERE username=%s;",
                        (user_data.first_name,
                         user_data.last_name,
                         user_data.bio,
                         username))
        self._conn.commit()

        return self.get_user(username)

    def follow(self, follower: str, following: str):
        with self._conn.cursor() as cur:
            # check if follower is already following user
            cur.execute("SELECT following FROM Follows WHERE follower=%s AND following=%s;",
                        (follower, following))
            if cur.fetchone():
                return False

            # follow user
            cur.execute("INSERT INTO Follows (follower, following) VALUES (%s, %s);",
                        (follower, following))

        self._conn.commit()
        return True

    def following(self, constraints: QueryConstraints, username: str):
        with self._conn.cursor() as cur:
            cur.execute(f"SELECT following FROM Follows "
                        f"WHERE follower=%s "
                        f"LIMIT {constraints.total} "
                        f"OFFSET {constraints.first};",
                        (username,))
            followed_by = flatten(cur.fetchall())

        return followed_by

    def followers(self, constraints: QueryConstraints, username: str):
        with self._conn.cursor() as cur:
            cur.execute(f"SELECT * FROM Follows "
                        f"WHERE following=%s "
                        f"LIMIT {constraints.total} "
                        f"OFFSET {constraints.first};",
                        (username,))
            followers = flatten(cur.fetchall())
        return followers

    def search_users(self, constraints: QueryConstraints, search_string: str):
        with self._conn.cursor() as cur:
            cur.execute(f"SELECT * FROM Users"
                        f" WHERE username LIKE '%%s%' "
                        f"ORDER BY username {constraints.sort_by} "
                        f"LIMIT {constraints.total} "
                        f"OFFSET {constraints.first};",
                        (search_string,))
            rows = cur.fetchall()

        users = _user_from_row(rows)
        return users

    def delete_user(self, username: str):
        with self._conn.cursor() as cur:
            cur.execute("DELETE FROM Users WHERE username=%s", (username,))
        self._conn.commit()
