class AppException(Exception):
    pass


class UserNotFound(AppException):
    # Not found username in database
    pass


class PasswordIncorrect(AppException):
    # password not matching with hashed_password
    pass


class UserAlreadyExists(AppException):
    # username was registered
    pass

class EmailAlreadyUsed(AppException):
    # email was used
    pass


class InvalidPassword(AppException):
    def __init__(self, reason: str) -> None:
        self.reason = reason
