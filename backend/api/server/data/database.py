import pymysql
from pymysql.connections import Connection

from server.data import SQLConfig
from server.data.posts import Posts
from server.data.users import Users


class Database:
    users: Users
    _conn: Connection
    TABLES = ("Blocks", "Bookmarks", "Follows", "PostLikes", "PostTags", "Posts", "Users")

    def __init__(self, config: SQLConfig):
        self._db_name = config.db_name
        self._conn = pymysql.connect(host=config.host, user=config.username,
                                     passwd=config.password, db=self._db_name,
                                     connect_timeout=5)
        self.users = Users(self._conn)
        self.posts = Posts(self._conn)

    def truncate_tables(self):
        """
        delete contents of all tables
        :return:
        """
        with self._conn.cursor() as cur:
            for table in Database.TABLES:
                cur.execute(f"TRUNCATE TABLE {self._db_name}.{table};")
        self._conn.commit()

    def drop_tables(self):
        with self._conn.cursor() as cur:
            for table in Database.TABLES:
                cur.execute(f"DROP TABLE {self._db_name}.{table};")
        self._conn.commit()
