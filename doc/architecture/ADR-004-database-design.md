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