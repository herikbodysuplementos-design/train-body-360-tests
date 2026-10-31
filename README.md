# TRAIN BODY 360 — Testes automatizados

Testes gratuitos de navegação, persistência e responsividade do aplicativo TRAIN BODY 360, executados com Playwright pelo GitHub Actions.

**Aplicativo testado:** https://designs.magicpath.ai/v1/calm-gulf-9032

## Execução automática

Abra **Actions → Testes Playwright → Run workflow**.

Ao final, o GitHub disponibiliza o relatório HTML e as evidências de falhas como artefatos.

## Execução local

```bash
npm ci
npx playwright install --with-deps chromium
npm test
```
