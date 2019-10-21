from server.db import rds

def get_user(username: str):
    conn = rds.connect()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM Users WHERE username=%s;", (username))
        user_data = cur.fetchone()

    return {
        "username" : user_data[0],
        "birthday" : user_data[1],
        "firstName" : user_data[2],
        "lastName" : user_data[3],
        "bio"   : user_data[4],
        "createdOn" : user_data[5]
    } if user_data else {}


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