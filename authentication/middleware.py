"""
authentication/middleware.py

Supabase Auth Middleware.

Attaches supabase_uid to every request object when a valid JWT is present.
Does NOT block requests — permission classes handle authorization.
This allows views to access request.supabase_uid directly without
going through DRF authentication checks again.
"""

from .utils import verify_supabase_token, extract_supabase_uid


class SupabaseAuthMiddleware:
    """
    Django middleware that silently attaches Supabase user info to request.

    - Reads Authorization: Bearer <token>
    - Verifies token (silently ignores failures)
    - Attaches request.supabase_uid if token is valid
    - Does NOT raise errors — DRF authentication classes handle that
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.supabase_uid = None

        auth_header = request.headers.get("Authorization", "")

        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            try:
                payload = verify_supabase_token(token)
                request.supabase_uid = extract_supabase_uid(payload)
                request.supabase_email = payload.get("email", "")
                request.supabase_role = payload.get("role", "authenticated")
            except Exception:
                # Silently fail — DRF auth backend will raise proper errors
                pass

        response = self.get_response(request)
        return response
