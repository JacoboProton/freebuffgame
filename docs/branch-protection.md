# Contributing

Thanks for contributing to Duobi-Jac! This file covers the **one-time repo
admin setup** that protects `main` from merging without the e2e suite green.

## Branch protection for `main`

The repo has a GitHub Actions workflow at
[`.github/workflows/e2e.yml`](.github/workflows/e2e.yml) that runs the
Playwright e2e suite against a service-container Postgres on every PR and
push to `main`. The workflow is useless unless PRs are **required** to pass
it before merging.

### One-time setup (repo admin only)

1. Go to **Settings → Branches → Branch protection rules**:
   <https://github.com/duobijac/duobijac/settings/branches>
2. Click **Add rule** (or edit the existing `main` rule).
3. Set **Branch name pattern** to `main`.
4. Enable **Require a pull request before merging** (recommended).
5. Enable **Require status checks to pass before merging**.
6. In the status checks search box, type `e2e` and select the check named
   **`e2e / Playwright e2e (Postgres)`**. The check name follows the
   pattern `<workflow-file> / <job-name>`, so it's the workflow file
   `e2e.yml` paired with the job name `Playwright e2e (Postgres)`.
7. (Recommended) Enable **Require branches to be up to date** so PRs re-run
   e2e after a push to the target branch.
8. (Recommended) Enable **Do not allow bypassing the above settings** so
   even admins can't merge a red PR.
9. Click **Create** / **Save changes**.

> **Why not in code?** Branch protection rules are a repo-level GitHub
> setting, not a file in the repo. There is no way to enforce this from
> `main` itself. The closest equivalents (Probot's
> `.github/settings.yml`, the GitHub Rulesets API) both require
> out-of-band auth that this repo doesn't have configured.

### Verifying the rule is active

```bash
# Requires: gh auth login (one-time)
gh api repos/duobijac/duobijac/branches/main/protection \
  | jq '.required_status_checks.checks[] | .context'
```

You should see `"e2e / Playwright e2e (Postgres)"` in the output.

### What this does NOT cover

- **Fork PRs.** GitHub Actions doesn't expose secrets to PRs from forks,
  so the e2e workflow uses the service-container `DATABASE_URL` fallback
  (no `DATABASE_URL` secret is required for the check to be meaningful —
  it just runs against a fresh ephemeral Postgres).
- **PRs from branches other than `main`.** The `pull_request` trigger
  fires for PRs targeting `main` (and `push` to `main`). PRs targeting
  feature branches don't run e2e.
- **The `lint` job** in `.github/workflows/ci.yml` is not currently a
  required check (it runs with `continue-on-error: true`). If you want to
  block merges on lint failures, add the `CI / Lint` check to the same
  required list.

## Local development

The e2e suite lives in `apps/api/e2e/` and runs against a real Postgres.
See [`apps/api/e2e/README.md`](apps/api/e2e/README.md) for prerequisites
and run instructions.
