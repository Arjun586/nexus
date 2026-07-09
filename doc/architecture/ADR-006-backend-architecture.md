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
We chose a feature-first architecture because related code evolves together. Each feature contains its routes, validation, controller, service, and repository, making it easier to navigate, test, and scale. This reduces context switching and allows multiple developers to work on different features with fewer merge conflicts.

Feature-first at the project level, layered architecture within each feature.