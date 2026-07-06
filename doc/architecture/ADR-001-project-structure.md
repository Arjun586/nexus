# ADR-001 — Project Structure

## Decision

Use a two-folder structure.

**frontend/**

**backend/**


## Alternatives

### Monorepo (Turborepo/Nx)

**Pros**
- Shared packages
- Better scaling
- Unified tooling

**Cons**
- More setup
- More concepts
- No benefit for the MVP

### Two separate repositories

**Pros**
- Independent deployments

**Cons**
- Harder to keep changes synchronized
- More repository management

## Why we chose this

The frontend and backend are separate concerns, but they don't yet require a monorepo. A simple two-folder structure minimizes complexity while leaving room to migrate later if shared packages become necessary.