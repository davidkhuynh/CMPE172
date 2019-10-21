from server.db import rds


def get_user(username: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Users WHERE username=%s;", (username,))
        user_data = cur.fetchone()

    return __user_from_row(user_data)


def create_user(request_data):
    return None


def edit_user(username, request_data):
    pass


def following():
    pass


def followers():
    return None


def search_users():
    return None

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

