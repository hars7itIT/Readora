# Workflow: Implement Feature

1. **Requirements Review**: Understand the privacy constraints, offline-first behavior, and security boundaries.
2. **Type Definition**: Define data models and schemas in `shared/src/` or domain types.
3. **Core Logic**: Implement the business logic in the feature service (`features/` in client or `services/` in server).
4. **UI Integration**: Build reactive components with hooks, ensuring offline states and loading skeletons are handled.
5. **Validation**: Test locally with unit tests and live verification.
