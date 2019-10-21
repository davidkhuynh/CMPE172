from dataclasses import dataclass
import datetime
from datetime import date


@dataclass
class QueryConstraints(object):
    sort_by: str = "mostRecent"
    first: int = 0
    total: int = 10


@dataclass
class User(object):
    username: str=""
    birthday: date=datetime.datetime.now().date()
    first_name: str=""
    last_name: str=""
    bio: str=""


def grab_range_from_db(request_data, query_func, **kwargs):
    constraints = __parse_query_constraints(request_data)
    queried_content = query_func(constraints, **kwargs)
    return queried_content


SORT_ORDERS = {
    "": "DESC",
    "mostRecent": "DESC",
    "leastRecent": "ASC"
}


# private
def __parse_query_constraints(request_data):
    """
        get the query constraints (sort by, first/last item number) from request data
    """

    sort_by = SORT_ORDERS[request_data.get("sort_by", default="")]
    # get from first_post to last_post
    first = request_data.get("first")
    if not first:
        first = 0
    total = request_data.get("total")
    if not total:
        total = 10

    return QueryConstraints(sort_by, first, total)
