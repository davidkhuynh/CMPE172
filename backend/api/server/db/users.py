from server.db import rds
from server.utils.db_utils import QueryConstraints, User
from server.utils.general_utils import flatten


def get_user(username: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Users WHERE username=%s;", (username,))
        user_data = cur.fetchone()

    return __user_from_row(user_data)


def create_user(user_data: User):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO Users "
            "(username, birthday, firstName, lastName, bio) "
            "VALUES (%s, '%s', %s, %s, %s);",
            (user_data.username,
             user_data.birthday,
             user_data.first_name,
             user_data.last_name,
             user_data.bio))
    conn.commit()

    return get_user(user_data.username)


def edit_user(username: str, user_data: User):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("UPDATE Users"
                    "SET firstName=%s,"
                    "lastName=%s,"
                    "bio=%s"
                    "WHERE username=%s;",
                    (user_data.first_name,
                     user_data.last_name,
                     user_data.bio,
                     username))
    conn.commit()

    return get_user(username)

def follow(follower: str, following: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        # check if follower is already following user
        cur.execute("SELECT following FROM Follows WHERE follower=%s AND following=%s;", (follower, following))
        if cur.fetchone():
            return False

        # follow user
        cur.execute("INSERT INTO Follows (follower, following) VALUES (%s, %s), (follower, following)")

    conn.commit()
    return True


def following(constraints: QueryConstraints, username: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT following FROM Follows "
                    f"WHERE follower=%s "
                    f"LIMIT {constraints.total} "
                    f"OFFSET {constraints.first};",
                    (username,))
        followed_by = flatten(cur.fetchall())

    return followed_by


def followers(constraints: QueryConstraints, username: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Follows "
                    f"WHERE following=%s "
                    f"LIMIT {constraints.total} "
                    f"OFFSET {constraints.first};",
                    (username,))
        followers = flatten(cur.fetchall())

    return followers


def search_users(constraints: QueryConstraints, search_string: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM Users"
                    f" WHERE username LIKE '%%s%' "
                    f"ORDER BY username {constraints.sort_by} "
                    f"LIMIT {constraints.total} "
                    f"OFFSET {constraints.first};",
                    (search_string,))

        users = __users_from_rows(cur)

    return users


## private
def __user_from_row(row):
    return {
        "username": row[0],
        "birthday": row[1],
        "firstName": row[2],
        "lastName": row[3],
        "bio": row[4],
        "createdOn": row[5]
    } if row else {}


def __users_from_rows(cur):
    users = []
    query_result = cur.fetchall()
    for row in query_result:
        users.append(__user_from_row(row))
    return users

