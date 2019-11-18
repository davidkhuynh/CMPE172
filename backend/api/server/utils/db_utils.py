from dataclasses import dataclass


@dataclass
class QueryConstraints(object):
    sort_by: str = "DESC"
    first: int = 0
    total: int = 10


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
    if not request_data:
        return QueryConstraints()

    if "sortBy" in request_data:
        sort_by_from_request_data = request_data["sortBy"].strip("\"")
        print(sort_by_from_request_data)
        sort_by = SORT_ORDERS[sort_by_from_request_data]
    else:
        sort_by = "DESC"

    # get from first_post to last_post
    first = request_data.get("first")
    if not first:
        first = 0
    total = request_data.get("total")
    if not total:
        total = 10

    return QueryConstraints(sort_by, first, total)
