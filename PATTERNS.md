Notes:

- Common types are stored in the "shared" workspace.
  - The idea is to have defined and relevant data structures for reference across backend/frontend implementations
- Database "entity" structures are in the "database" workspace.
  - These use snake_case, as that's the standard for Postgres
  - They are defined using simple types (string for date) to prevent issues with CRUD operations
- Converter functions for common types are in "backend-core"
  - These are to help convert "entity" types to the common types, with explicitly defined structures
  - Allows for more granular control when mapping JS objects to their DB counterparts
- The event system is structured such that:
  - Either game-state or hand-state changes can be handled by any available server
  - Redis is used as a temporary data store for in-flight changes
  - Why?
    - Resilliency during server failure/termination; relevant as Kubernetes is the target orchestration engine
