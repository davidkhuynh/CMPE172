from dataclasses import dataclass


@dataclass
class QueryConstraints(object):
    sort_by: str = "mostRecent"
    first: int = 0
    last: int = 10


def grab_range_from_db(request_data, query_func, **kwargs):
    constraints = __parse_query_constraints(request_data)
    queried_content = query_func(constraints, **kwargs)
    return queried_content


SORT_ORDERS = {
    "mostRecent": "DESC",
    "leastRecent": "ASC"
}


# private
def __parse_query_constraints(request_data):
    """
        get the query constraints (sort by, first/last item number) from request data
    """

    sort_by = request_data.get("sort_by")
    if not sort_by:
        sort_by = "mostRecent"
    # get from first_post to last_post
    first = request_data.get("first")
    if not first:
        first = 0
    last = request_data.get("last")
    if not last:
        last = 10

    return QueryConstraints(sort_by, first, last)
