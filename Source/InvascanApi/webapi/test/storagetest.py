import datetime

# Add project root to path
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from webapi.entities.UserAccount import UserAccount
from webapi.data.storagedb import UserRepository

if __name__ == '__main__':
    repo = UserRepository()

    new_user = UserAccount(
        firstname="John",
        lastname="Doe",
        gender="Male",
        dob=datetime.datetime(1995, 7, 15),
        profession="Engineer",
        email="john.doe@example.com",
        password="hashedpassword",
        passwordsalt="randomsalt",
        status=None  # or uuid.UUID(...) if you have status values
    )

    repo.create_user_account(new_user)
