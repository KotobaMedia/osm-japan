# AGENTS

## Style Updates

- Prototype map style changes directly in `styles/*.json` first so visual tweaks are fast to validate.
- After the style behavior is confirmed, migrate the same change into `scripts/build_styles.ts`.
- Treat `scripts/build_styles.ts` as the source of truth for generated style JSON files.
- After migration, run `pnpm run build:styles` to regenerate styles and confirm output stays aligned with the intended change.
