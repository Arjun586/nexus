# ADR-002 — Collaborative State

## Decision

Yjs is the single source of truth for collaborative state.

## Alternatives

### PostgreSQL as the source of truth

**Pros**
- Easy SQL queries
- Familiar relational model

**Cons**
- Poor fit for concurrent real-time editing
- Complex conflict resolution

### React Flow JSON in the database

**Pros**
- Simple persistence

**Cons**
- No native conflict resolution
- Difficult multi-user synchronization

## Why we chose this

Yjs is purpose-built for CRDT-based collaboration. By treating it as the authoritative document, we avoid maintaining duplicate representations of the same state.

## Consequence

PostgreSQL stores snapshots, not individual nodes or edges.