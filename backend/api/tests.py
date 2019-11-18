import datetime
import subprocess
import unittest
import pathlib

from server.data import SQLConfig
from server.data.database import Database
from server.data.users import User

TEST_CONFIG = SQLConfig(
    host="localhost",
    username="fumblr_admin",
    password="fumblr_admin",
    db_name="fumblr"
)


class DatabaseTest(unittest.TestCase):
    db: Database
    user1 = "user1"
    user2 = "user2"

    def setUp(self):
        subprocess.call("./test_sql_update", cwd=f"{pathlib.Path().resolve().parent}")
        self.db = Database(TEST_CONFIG)

    def test_create_user(self):
        self.db.users.create_user(
            User(
                username="test",
                birthday=datetime.date(
                    year=1996, month=10, day=10
                )
            )
        )
        user = self.db.users.get_user("test")
        assert(user is not None)

    def tearDown(self):
        self.db.drop_tables()


if __name__ == "__main__":
    unittest.main()
