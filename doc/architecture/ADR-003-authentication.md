# ADR-003 — Authentication

## Decision

JWT authentication.

## Alternatives

### Clerk

**Pros**
- Fast setup
- Managed authentication

**Cons**
- Less backend ownership
- External dependency

### Supabase Auth

**Pros**
- Integrated with PostgreSQL

**Cons**
- Tighter coupling to Supabase

## Why we chose this

The project aims to demonstrate backend engineering skills. Implementing JWT authentication provides experience with password hashing, token generation, protected routes, and authorization.

## Consequence

We'll implement:

- Access tokens
- Refresh tokens
- Password hashing
- Role-based authorization