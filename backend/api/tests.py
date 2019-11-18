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

    def _create_test_user(self, username="test", birthday=datetime.date(year=1996, month=10, day=10)):
        return self.db.users.create_user(
            User(
                username=username,
                birthday=birthday
            )
        )

    def test_create_user(self):
        user = self._create_test_user()
        assert(user is not None)

    def test_edit_user(self):
        user = self._create_test_user()
        edited_user = self.db.users.edit_user("test", User(display_name="edited display name"))
        assert(user.display_name != edited_user.display_name)

    def test_follow(self):
        user1 = self._create_test_user("test1")
        user2 = self._create_test_user("test2")
        self.db.users.follow(user1.username, user2.username)
        user1_following = self.db.users.following_default(user1.username)
        assert(user2.username in user1_following)
        user2_followers = self.db.users.followers_default(user2.username)
        assert(user1.username in user2_followers)

    def test_search_users(self):
        user = self._create_test_user()
        searched_users = self.db.users.search_users_default("tes")
        assert(any(searched_users))
        searched_users_with_gibberish_query = self.db.users.search_users_default("asdfa")
        assert(not any(searched_users_with_gibberish_query))

    def tearDown(self):
        self.db.drop_tables()


if __name__ == "__main__":
    unittest.main()
