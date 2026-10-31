import { expect, Page, test } from '@playwright/test';

const appUrl =
  process.env.APP_URL ??
  'https://designs.magicpath.ai/v1/calm-gulf-9032';

const embeddedUrl =
  appUrl + (appUrl.includes('?') ? '&embed=true' : '?embed=true');

const navigationLabels = [
  'Início',
  'Meu Treino',
  'Agenda',
  'Suplementos',
  'Evolução',
  'Mais',
];

async function openApp(page: Page) {
  await page.goto(embeddedUrl);
  await expect(page.getByText('TRAIN BODY', { exact: true })).toBeVisible({
    timeout: 30_000,
  });
}

async function disableCheckinPrompt(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem('tb360_checkin_prompt_off', '1');
  });
  await page.reload();
}

async function enterDemo(page: Page) {
  await openApp(page);
  await disableCheckinPrompt(page);

  const demoButton = page.getByRole('button', {
    name: /explorar dashboard demonstrativo/i,
  });

  await expect(demoButton).toBeVisible({ timeout: 30_000 });
  await demoButton.click();

  await expect(page.getByText('Início', { exact: true }).last()).toBeVisible({
    timeout: 15_000,
  });
}

async function enterSimulatedLogin(page: Page) {
  await openApp(page);
  await disableCheckinPrompt(page);

  const email = page.getByLabel('E-mail');
  await expect(email).toBeVisible();
  await email.fill('teste-automatizado@trainbody360.local');

  const enterButton = page.getByRole('button', {
    name: /^entrar \(simulação\)$/i,
  });
  await expect(enterButton).toBeVisible();
  await enterButton.click();

  await expect(page.getByText('Início', { exact: true }).last()).toBeVisible({
    timeout: 15_000,
  });
}

test('carrega sem erro crítico e sem rolagem horizontal', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));

  await openApp(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );

  expect(overflow).toBeFalsy();
  expect(runtimeErrors).toEqual([]);
});

test('entra no modo demonstração e exibe as seis áreas principais', async ({
  page,
}) => {
  await enterDemo(page);

  for (const label of navigationLabels) {
    await expect(page.getByText(label, { exact: true }).last()).toBeVisible();
  }
});

test('permite navegar pelas seis áreas sem quebrar a aplicação', async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await enterDemo(page);

  for (const label of navigationLabels) {
    const destination = page.getByText(label, { exact: true }).last();
    await expect(destination).toBeVisible();
    await destination.click();
    await expect(page.locator('body')).toBeVisible();
  }

  expect(runtimeErrors).toEqual([]);
});

test('mantém a sessão simulada após atualizar a página', async ({ page }) => {
  await enterSimulatedLogin(page);
  await page.reload();

  await expect(page.getByText('Início', { exact: true }).last()).toBeVisible({
    timeout: 15_000,
  });
});
