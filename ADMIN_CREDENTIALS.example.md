# Admin Login Credentials

> Copy this file to `ADMIN_CREDENTIALS.md` and fill in your credentials.  
> `ADMIN_CREDENTIALS.md` is gitignored to avoid committing secrets.

## Default Admin (after running `python scripts/seed_db.py`)

| Field     | Value                  |
|-----------|------------------------|
| **Email** | `admin@probable.local` |
| **Password** | `Admin123!`        |

Run the seed script to create this user, then use it to log in via `POST /api/v1/auth/login`.
