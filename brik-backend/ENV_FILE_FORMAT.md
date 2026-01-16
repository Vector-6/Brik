# .env File Format Guide

## Issue with bcrypt Hash in .env

If your `ADMIN_PASSWORD_HASH` is being truncated, it's because the `$` characters in bcrypt hashes can be interpreted as variable expansion.

## Solution: Use Quotes

Wrap the hash value in **single quotes** to prevent variable expansion:

```env
ADMIN_EMAIL=admin@brik.com
ADMIN_PASSWORD_HASH='$2b$10$CXqoLoZnXRNxQV8w8J5sqeQp2BOdusWJ7xFCD73dV8eDII1Zwb3nm'
JWT_ADMIN_SECRET=brik$1212
```

OR use **double quotes**:

```env
ADMIN_EMAIL=admin@brik.com
ADMIN_PASSWORD_HASH="$2b$10$CXqoLoZnXRNxQV8w8J5sqeQp2BOdusWJ7xFCD73dV8eDII1Zwb3nm"
JWT_ADMIN_SECRET=brik$1212
```

## Important Notes

1. **No spaces around the `=` sign**:
   ✅ Correct: `ADMIN_EMAIL=admin@brik.com`
   ❌ Wrong: `ADMIN_EMAIL = admin@brik.com`

2. **No line breaks in the hash** - The entire hash must be on one line

3. **Restart the backend** after making changes to `.env`

## Example .env File

```env
# Admin Authentication
ADMIN_EMAIL=admin@brik.com
ADMIN_PASSWORD_HASH='$2b$10$CXqoLoZnXRNxQV8w8J5sqeQp2BOdusWJ7xFCD73dV8eDII1Zwb3nm'
JWT_ADMIN_SECRET=brik$1212

# Database
MONGODB_URI=mongodb://localhost:27017/brik

# Server
PORT=3001
```

## Verification

After updating your `.env` file, verify it's being read correctly by checking the backend logs. You should see:

```
Admin hash from env: $2b$10$CXqoLo... (length: 60)
```

NOT:
```
Admin hash from env: $2b$10... (length: 6)  ❌
```
