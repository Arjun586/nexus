# ADR-006 — Backend Organization

## Decision

Organize the backend by feature rather than by technical layer.

Example:
backend/src/
├── auth/
├── workspace/
├── document/
├── user/
├── shared/


Instead of:
controllers/
services/
routes/
models/


## Why
Feature-first organization keeps related code together, making the codebase easier to navigate and scale.