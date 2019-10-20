import sys
import pymysql
from server.db import rds_config

def connect():
    conn = pymysql.connect(rds_config.host, user=rds_config.username, passwd=rds_config.password, db=rds_config.db_name, connect_timeout=5)
    return conn
