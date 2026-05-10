"""
authentication/backends.py

Custom DRF Authentication Backend that verifies Supabase JWTs.

This backend:
  - Reads the Authorization: Bearer <token> header
  - Verifies the token using SUPABASE_JWT_SECRET (HS256)
  - Extracts 'sub' as supabase_uid
  - Attaches supabase_uid to request
  - Returns a lightweight AnonymousUser-compatible object

Django's native User model is NOT used for authentication.
No passwords are stored or checked.
"""

from django.contrib.auth.models import AnonymousUser
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .utils import verify_supabase_token, extract_supabase_uid


class SupabaseUser:
    """
    A lightweight user object representing an authenticated Supabase user.
    It is NOT a Django User model instance.
    """

    def __init__(self, supabase_uid: str, email: str = None, role: str = None):
        self.supabase_uid = supabase_uid
        self.email = email
        self.role = role
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False

    def __str__(self):
        return f"SupabaseUser(uid={self.supabase_uid}, email={self.email})"


class SupabaseJWTAuthentication(BaseAuthentication):
    """
    DRF Authentication class for Supabase JWT tokens.

    Attach to REST_FRAMEWORK['DEFAULT_AUTHENTICATION_CLASSES'] in settings.py.

    Flow:
      1. Extract Bearer token from Authorization header.
      2. Verify token signature using SUPABASE_JWT_SECRET.
      3. Extract supabase_uid from 'sub' claim.
      4. Return (SupabaseUser, token) to DRF request pipeline.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            # No token provided — let permission classes handle it
            return None

        token = auth_header.split(" ", 1)[1].strip()

        if not token:
            raise AuthenticationFailed("Bearer token is empty.")

        try:
            payload = verify_supabase_token(token)
        except AuthenticationFailed:
            raise

        supabase_uid = extract_supabase_uid(payload)
        email = payload.get("email", "")
        role = payload.get("role", "authenticated")

        user = SupabaseUser(supabase_uid=supabase_uid, email=email, role=role)

        # Attach supabase_uid directly to request for easy access in views
        request.supabase_uid = supabase_uid

        return (user, token)

    def authenticate_header(self, request):
        return "Bearer"
