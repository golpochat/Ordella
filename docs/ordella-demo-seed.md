# Ordella Demo Seed

The demo seed script lives at:

```powershell
scripts/seed-ordella-demo.ts
```

Run it from the repository root:

```powershell
cd "D:\Exclusive projects\Ordella"
npx ts-node --project apps/api/tsconfig.json scripts/seed-ordella-demo.ts
```

If `ts-node` still reports decorator-related TypeScript errors, set the compiler options through an environment variable first:

```powershell
$env:TS_NODE_COMPILER_OPTIONS='{"module":"commonjs","moduleResolution":"node","target":"ES2021","experimentalDecorators":true,"emitDecoratorMetadata":true,"allowSyntheticDefaultImports":true}'
npx ts-node scripts/seed-ordella-demo.ts
```

If you are already inside `apps/api`, run the seed with the relative path back to the repo-level script:

```powershell
npx ts-node --project tsconfig.json ..\..\scripts\seed-ordella-demo.ts
```

Common errors:

- `Cannot find module './seed-ordella-demo.ts'`: the command was run from the wrong directory. Use the repo root command above, or the `..\..\scripts\seed-ordella-demo.ts` path from `apps/api`.
- `TS1240 Unable to resolve signature of property decorator`: `ts-node` is not using the API TypeScript decorator settings. Use `--project apps/api/tsconfig.json` or set `TS_NODE_COMPILER_OPTIONS`.
- `SyntaxError: Expected property name or '}' in JSON`: PowerShell stripped quotes from inline JSON. Use the environment variable form above instead of passing inline JSON to `--compiler-options`.
- `Invalid email or password`: rerun the seed after pulling script changes so user and supplier passwords are stored with the app's current `scrypt:` password hash format.
