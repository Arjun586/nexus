# ADR-005 — Infrastructure

## Decision

Start with only the infrastructure required for the MVP.

## Included

- PostgreSQL
- Redis
- Docker
- Prisma

## Deferred

- BullMQ
- Horizontal scaling
- Monitoring
- Metrics
- Object storage

## Why

Premature infrastructure slows development. We'll introduce components only when they solve an actual problem.