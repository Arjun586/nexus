# ADR-004 — Database Philosophy

## Decision

The database stores business data, not canvas state.

## Stores

- Users
- Workspaces
- Memberships
- Document snapshots
- Refresh tokens

## Does not store

- Nodes
- Edges
- Positions
- Cursor locations
- Zoom level
- React Flow state

## Why

Duplicating collaborative state in PostgreSQL introduces synchronization problems and violates the single source of truth principle.
We chose PostgreSQL because Nexus stores highly relational business data such as users, workspaces, memberships, refresh tokens, and snapshots. PostgreSQL provides ACID transactions, strong constraints, excellent indexing, and mature tooling through Prisma. We intentionally separate persistent business data in PostgreSQL from collaborative state, which will be managed by Yjs.