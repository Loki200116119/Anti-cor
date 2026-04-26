from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

# Rate limiting configuration
limiter = Limiter(key_func=get_remote_address)

# Rate limits for different endpoints
REPORT_CREATE_LIMIT = "5/minute"  # 5 reports per minute
REPORT_LIST_LIMIT = "30/minute"   # 30 list requests per minute
AUTH_LIMIT = "10/minute"          # 10 auth attempts per minute
FILE_UPLOAD_LIMIT = "3/minute"    # 3 file uploads per minute

# Global rate limit (fallback)
GLOBAL_LIMIT = "100/minute"       # 100 requests per minute globally