import datetime
import unittest
from webapi.entities.UserAccount import UserAccount
from webapi.data.storagedb import UserRepository

class MyTestCase(unittest.TestCase):
    def test_something(self):
        self.assertEqual(True, False)  # add assertion here


    def test_check_email_exists(self):
        repo = UserRepository()
        email = "john.doe@example.com"
        results = repo.check_email_exists(email)
        self.assertEqual(results, False)
        self.assertTrue(results)


if __name__ == '__main__':
    unittest.main()
