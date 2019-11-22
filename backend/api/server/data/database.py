import pymysql
from pymysql.connections import Connection

from server.data import SQLConfig, sql_connection
from server.data.posts import Posts
from server.data.users import Users


class Database:
    users: Users
    posts: Posts
    _conn: Connection
    TABLES = ("Blocks", "Bookmarks", "Follows", "PostLikes", "PostTags", "Posts", "Users")

    def __init__(self, config: SQLConfig):
        self._config = config
        self.users = Users(self._config)
        self.posts = Posts(self._config)

    def truncate_tables(self):
        """
        delete contents of all tables
        :return:
        """
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                for table in Database.TABLES:
                    cur.execute(f"TRUNCATE TABLE {self._config.db_name}.{table};")

    def drop_tables(self):
        with sql_connection(self._config) as conn:
            with conn.cursor() as cur:
                for table in Database.TABLES:
                    cur.execute(f"DROP TABLE {self._config.db_name}.{table};")
