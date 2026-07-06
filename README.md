# Nexus: Distributed State Synchronization Engine

Nexus is a real-time collaborative node-based workspace built to explore distributed state synchronization using modern web technologies. It allows multiple users to create, drag, and edit objects on a shared canvas simultaneously. The project is under active development, with a focus on distributed state management to keep clients in sync without data conflicts, even under network latency.

## Project Status

**Current Phase:** MVP Development

Completed milestones:
- [x] Project setup
- [x] Architecture design
- [x] ADR documentation

Current work:
- [x] Database schema design

Next milestone:
- [ ] Authentication implementation, followed by collaborative canvas integration

## Why Nexus?

Nexus exists to explore the engineering challenges behind real-time collaborative software — the same class of problems solved by tools like Figma and Miro. Distributed collaborative systems are interesting because they force explicit decisions about consistency, conflict resolution, and state ownership under concurrent access.

This project is a hands-on exploration of:
- CRDT-based conflict resolution (Yjs)
- WebSocket-based real-time synchronization
- Separation of collaborative state from persistent business data
- Incremental, MVP-first system design

## Engineering Goal

Nexus is built to explore the challenges of real-time collaborative software. The MVP focuses on three core problems:

- **Real-time collaboration:** Multiple users editing the same workspace simultaneously.
- **Conflict resolution:** Concurrent edits stay consistent across all connected clients using CRDTs.
- **Responsive experience:** The canvas remains interactive while synchronizing changes in real time.

Later phases will address scaling, presence systems, background processing, and distributed infrastructure.

## MVP Philosophy

The goal of Nexus is not to replicate every feature of Figma or Miro. The project follows an iterative approach:

1. Build a minimal collaborative editor.
2. Ship a working MVP.
3. Improve collaboration features.
4. Optimize for scale.
5. Add enterprise-level capabilities.

Every phase should produce a deployable product.

## Architecture Overview

```mermaid
flowchart TD
    A[React Frontend]
    B[Hocuspocus Server]
    C[Yjs Document]
    D[(PostgreSQL)]
    E[(Redis)]

    A <-->|WebSocket| B
    B --> C
    C --> D
    B --> E
```

Yjs holds the live collaborative state as the single source of truth. PostgreSQL persists periodic snapshots and business data (users, workspaces, memberships), while Redis handles ephemeral presence data and cross-instance messaging.

## Tech Stack

### Current Stack

**Frontend**
- Vite
- React + TypeScript
- React Flow (canvas rendering, zoom/pan/drag)
- Tailwind CSS

**Sync Layer**
- Yjs (CRDT engine)
- Hocuspocus (WebSocket server for Yjs)

**Backend**
- Node.js + Express
- PostgreSQL
- Prisma (ORM)
- Redis
- Docker (local environment orchestration)
- Zod (runtime schema validation)

### Planned Infrastructure

- BullMQ (background job processing)
- Monitoring and observability tooling
- Metrics collection
- PNG/PDF export services
- Horizontal WebSocket scaling
- Framer Motion (UI transitions)
- React Virtuoso (list virtualization)

## Folder Structure
```nexus/
    ├── frontend/
    ├── backend/
    ├── docs/
    │ └── architecture/
    └── docker-compose.yml
```



## Architecture Decisions

Architectural decisions are documented as Architecture Decision Records (ADRs) under `docs/architecture/`. Each ADR captures the context, alternatives considered, and rationale behind a decision, so future contributors (including future me) understand why the system is structured the way it is rather than re-litigating settled choices.

## Engineering Principles

These principles guide development decisions across the project:

- Ship before optimizing.
- One source of truth for every piece of data.
- Feature-first architecture over technical-layer organization.
- Avoid premature abstraction.
- Introduce infrastructure only when it solves a real problem.
- Build production-quality code from day one, but only for the current scope.
- Prefer simple solutions unless complexity is justified by measurable benefits.

## Development Environment

Nexus uses a two-folder structure to separate frontend and backend concerns without the overhead of a monorepo.

- **Structure:** Standard `frontend` (Vite) and `backend` (Node.js/Express) directories.
- **Orchestration:** Docker runs local instances of PostgreSQL and Redis to keep dev and production environments consistent.
- **Validation:** Zod enforces schema validation across frontend, backend, and WebSocket payloads.

## Implementation Roadmap

### Phase 1 — Collaborative Canvas (MVP)

Goal: Build the smallest deployable collaborative editor.

- [x] Initialize frontend (Vite + React + TypeScript)
- [x] Initialize backend (Node.js + Express + TypeScript)
- [x] Configure PostgreSQL using Docker
- [x] Configure Prisma
- [ ] Create shared Zod schemas
- [ ] Integrate React Flow
- [ ] Local node creation
- [ ] Local node editing
- [ ] Local node dragging
- [ ] Integrate Hocuspocus
- [ ] Integrate Yjs
- [ ] Synchronize canvas between multiple users
- [ ] Save and load workspaces from PostgreSQL
- [ ] Basic authentication
- [ ] Deploy MVP

### Phase 2 — Collaboration Experience

Goal: Make collaboration feel polished.

- [ ] User presence
- [ ] Ghost cursors
- [ ] Online status
- [ ] Reconnection handling
- [ ] Undo / Redo improvements
- [ ] Workspace routing
- [ ] Better loading states

### Phase 3 — Scaling

Goal: Support larger workloads.

- [ ] Redis Pub/Sub
- [ ] Horizontal WebSocket scaling
- [ ] Snapshot optimization
- [ ] API rate limiting
- [ ] Logging
- [ ] Monitoring
- [ ] Metrics

### Phase 4 — Advanced Features

Goal: Introduce enterprise-level functionality.

- [ ] PNG export
- [ ] PDF export
- [ ] BullMQ background workers
- [ ] Organization support
- [ ] Roles & Permissions
- [ ] Audit logs
- [ ] Analytics

## MVP Scope

The first release includes only the features required to demonstrate a working collaborative editing engine.

**Included**
- User authentication
- Workspace creation
- Shared canvas
- Real-time synchronization
- Persistent storage
- Multi-user editing
- Deployment

**Not included**
- Presence
- Comments
- Chat
- Version history
- Export
- Teams
- Notifications
- Analytics
- AI features

These features will be introduced incrementally after the MVP is deployed.

## Future Improvements

After the MVP is stable, planned work includes:

- Redis-backed presence system
- Horizontal scaling
- Background workers
- Snapshot optimization
- Operational Transform benchmarking
- Monitoring & observability
- Advanced permissions
- Team workspaces
- Export services