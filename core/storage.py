"""Object storage (S3-compatible) for datasets, chart images, and raw HTML."""

import io
from typing import Optional

import boto3
from botocore.config import Config

from core.config import get_settings

settings = get_settings()

# S3 client - supports local MinIO or AWS S3
_client = None


def _get_client():
    global _client
    if _client is None:
        extra = {}
        if settings.s3_endpoint_url:
            extra["endpoint_url"] = settings.s3_endpoint_url
        if settings.aws_access_key_id:
            extra["aws_access_key_id"] = settings.aws_access_key_id
        if settings.aws_secret_access_key:
            extra["aws_secret_access_key"] = settings.aws_secret_access_key
        _client = boto3.client(
            "s3",
            region_name=settings.s3_region,
            config=Config(signature_version="s3v4"),
            **extra,
        )
    return _client


async def upload_file(
    key: str,
    body: bytes | str | io.BytesIO,
    content_type: str = "application/octet-stream",
) -> str:
    """Upload a file to S3. Returns the object key (path)."""
    client = _get_client()
    if isinstance(body, str):
        body = body.encode("utf-8")
    if isinstance(body, bytes):
        body = io.BytesIO(body)

    client.put_object(
        Bucket=settings.s3_bucket,
        Key=key,
        Body=body,
        ContentType=content_type,
    )
    return key


async def download_file(key: str) -> bytes:
    """Download a file from S3."""
    client = _get_client()
    response = client.get_object(Bucket=settings.s3_bucket, Key=key)
    return response["Body"].read()


def get_presigned_url(key: str, expires_in: int = 3600) -> Optional[str]:
    """Generate a presigned URL for temporary access."""
    try:
        client = _get_client()
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": key},
            ExpiresIn=expires_in,
        )
    except Exception:
        return None
