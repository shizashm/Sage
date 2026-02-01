"""Set a user's password in the DB (same hash format as signup).
Run from backend folder: python scripts/set_user_password.py user@example.com "new_password"
"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import update

from app.api.auth import _hash_password
from app.database import AsyncSessionLocal, init_db
from app.models.user import User


async def set_password(email: str, password: str) -> bool:
    await init_db()
    hashed = _hash_password(password)
    async with AsyncSessionLocal() as session:
        result = await session.execute(update(User).where(User.email == email).values(hashed_password=hashed))
        await session.commit()
        return result.rowcount > 0


def main():
    if len(sys.argv) < 3:
        print('Usage: python scripts/set_user_password.py user@example.com "new_password"', file=sys.stderr)
        sys.exit(1)
    email = sys.argv[1]
    password = sys.argv[2]
    ok = asyncio.run(set_password(email, password))
    if ok:
        print(f"Password updated for {email}. You can now log in with that password.")
    else:
        print(f"No user found with email {email}.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
