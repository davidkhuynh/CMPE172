from contextlib import contextmanager

import pymysql
from dataclasses import dataclass

from server.utils.log_utils import log_info, log_error


@dataclass
class SQLConfig:
    host: str
    username: str
    password: str
    db_name: str


@dataclass
class DBReturn:
    succeeded: bool
    return_object: object
    message: str


def _db_success(message: str, return_object: object = None):
    log_info(message)
    return DBReturn(succeeded=True, return_object=return_object, message=message)


def _db_failure(message: str, return_object: object = None):
    log_error(message)
    return DBReturn(succeeded=False, return_object=return_object, message=message)


def _process_rows(rows, func):
    return [func(row) for row in rows]


@contextmanager
def sql_connection(config: SQLConfig):
    connection = pymysql.connect(host=config.host, user=config.username,
                                 passwd=config.password, db=config.db_name,
                                 connect_timeout=5)
    try:
        yield connection
    finally:
        connection.commit()
        connection.close()


