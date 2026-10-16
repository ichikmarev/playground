# AGENTS.md

Guidance for AI coding agents working in this repo. See `README.md` for stack, ports, and scripts.

## Workflow

- Package manager: `pnpm` (workspace). Pin exact dependency versions (`pnpm --filter <pkg> add -E <dep>@<version>`) and commit `pnpm-lock.yaml`; CI runs `pnpm install --frozen-lockfile`.
- Before pushing, run what CI runs: `pnpm lint`, `pnpm build`, `pnpm test` (plus `pnpm check` for types).
- Formatting/linting is Biome. Use safe fixes only (`biome check --write`); do not let unsafe fixes turn injected NestJS service imports into `import type` — that breaks DI.

## API (`apps/api`) — request validation and DTOs

All request input (bodies, and params/query when added) must be validated with **zod**. Do not type request bodies with inline object types or plain interfaces, and never pass unvalidated input to the database.

When adding or changing a DTO:

1. Define the schema in `<module>/<module>.schema.ts` and derive the type from it:
   ```ts
   export const createUserSchema = z.object({ ... });
   export type CreateUserDto = z.infer<typeof createUserSchema>;
   ```
   Do not hand-write a separate interface for the same shape.
2. Bind validation per parameter with `ZodValidationPipe` (`src/common/zod-validation.pipe.ts`):
   ```ts
   @Post()
   create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto) { ... }
   ```
   Use `@Body(new ZodValidationPipe(...))`, not `@UsePipes(...)`, and not `class-validator`.
3. Services accept the inferred DTO type (`import type { CreateUserDto }`).
4. Match the DB column, not just the TS type:
   - Strings: `.trim()`, `.min(1)` for required, sensible `.max()`.
   - `INTEGER` columns (e.g. `price` in cents): `z.number().int()`, no coercion.
   - Nullable/optional text columns: use `optionalText(...)` from `src/common/schemas.ts` (accepts omitted, `null`, or blank as absent).
   - Emails: `z.string().trim().toLowerCase().pipe(z.email())`.
5. Unknown keys are stripped (zod default). Only columns listed in the schema may reach an `INSERT`/`UPDATE`.
6. Map SQLite `UNIQUE` violations to `409 Conflict` via `isUniqueConstraintError` (`src/common/sqlite-errors.ts`); do not pre-check existence.
7. Import from `"zod"`, not `"zod/v4"` (the NestJS tsconfig uses `moduleResolution: node`).

### Tests

- Add schema unit tests in `<module>/<module>.schema.spec.ts` (valid, normalized, stripped, and rejected payloads).
- Calling a controller method directly skips pipes. Cover validation wiring with HTTP tests in `src/app.e2e.spec.ts`, which boots `AppModule` against `DATABASE_PATH=:memory:`. Keep each test self-contained (no reliance on rows inserted by other tests).
