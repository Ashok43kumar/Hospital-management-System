"""
authentication/utils.py

Utility functions for Supabase JWT verification.
The backend NEVER stores passwords or handles auth logic —
it only verifies JWTs issued by Supabase.
"""

import jwt
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed


def verify_supabase_token(token: str) -> dict:
    """
    Verify a Supabase-issued JWT token.

    Args:
        token (str): Raw JWT token string from the Authorization header.

    Returns:
        dict: Decoded token payload containing 'sub' (supabase_uid),
              'email', 'role', and other Supabase claims.

    Raises:
        AuthenticationFailed: If token is missing, expired, or tampered.
    """
    if not token:
        raise AuthenticationFailed("No authentication token provided.")

    jwt_secret = settings.SUPABASE_JWT_SECRET

    if not jwt_secret:
        raise AuthenticationFailed(
            "Server misconfiguration: SUPABASE_JWT_SECRET is not set."
        )

    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase doesn't always set aud
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise AuthenticationFailed("Token has expired. Please log in again.")

    except jwt.InvalidTokenError as e:
        raise AuthenticationFailed(f"Invalid token: {str(e)}")


def extract_supabase_uid(payload: dict) -> str:
    """
    Extract the Supabase user UID from a decoded JWT payload.

    Args:
        payload (dict): Decoded JWT payload.

    Returns:
        str: The Supabase user UID ('sub' claim).

    Raises:
        AuthenticationFailed: If 'sub' claim is missing.
    """
    uid = payload.get("sub")
    if not uid:
        raise AuthenticationFailed("Token payload missing 'sub' (user ID) claim.")
    return uid
