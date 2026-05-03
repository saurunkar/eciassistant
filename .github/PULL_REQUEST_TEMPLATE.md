## Summary
<!-- What does this PR do? -->

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Infrastructure / config change
- [ ] Documentation

## Checklist
- [ ] `pytest tests/unit/ -v` passes
- [ ] `pytest tests/security/ -v` passes
- [ ] Coverage ≥ 80% (`pytest --cov=app --cov-fail-under=80`)
- [ ] `ruff check app/ tests/` passes
- [ ] `mypy app/ --ignore-missing-imports` passes
- [ ] Frontend: `pnpm typecheck` passes
- [ ] Frontend: `pnpm build` succeeds
- [ ] No PII logged or stored
- [ ] No secrets committed
