from rest_framework.pagination import PageNumberPagination

class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom page number pagination that respects a `page_size` query parameter
    from the client, up to a maximum of 1000 items.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000
