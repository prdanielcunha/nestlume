import { expect, test } from '@playwright/test';

test('public reading works without login and any passage can enter grounded study', async ({ page }) => {
  await page.goto('/ler/gen/1?v=1');
  await expect(page.getByRole('heading', { name: /Gênesis 1:1/i })).toBeVisible();

  await page.getByRole('button', { name: /Perguntar sobre esta passagem/i }).click();
  await expect(page).toHaveURL(/\/perguntar\?ref=/);
  await expect(page.getByLabel('Referência (opcional)')).toHaveValue(/Gênesis 1:1/i);
});

test('Greek and Hebrew original-language packages load at exact canonical references', async ({ page }) => {
  await page.goto('/ler/jhn/1?v=1');
  await page.getByRole('button', { name: 'Idioma original' }).click();
  await expect(page.getByText(/Grego koiné/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /logos/i }).first()).toBeVisible();

  await page.goto('/ler/gen/1?v=1');
  await page.getByRole('button', { name: 'Idioma original' }).click();
  await expect(page.getByText(/Hebraico bíblico/i)).toBeVisible();
  await expect(page.locator('.original-line button').first()).toBeVisible();
});

test('versification mismatch is surfaced instead of silently shifting the verse', async ({ page }) => {
  await page.goto('/ler/2co/13?v=14');
  await page.getByRole('button', { name: 'Idioma original' }).click();
  await expect(page.getByRole('heading', { name: /2CO 13:14/i })).toBeVisible();
  await expect(page.getByText(/não desloca a referência silenciosamente/i)).toBeVisible();
});

test('AI remains fail-closed without an approved live endpoint', async ({ page }) => {
  await page.goto('/perguntar?ref=Jo%C3%A3o%201%3A1-5');
  await page.getByLabel('Pergunta').fill('O que esta passagem afirma sobre a Palavra?');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Estudar com IA' }).click();
  await expect(page.getByText(/provedor de produção ainda não foi conectado/i)).toBeVisible();
});

test('interface language and theme are user-selectable', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Idioma da interface').selectOption('en');
  await expect(page.getByRole('button', { name: 'Explore' }).first()).toBeVisible();

  await page.getByLabel('Interface language').selectOption('pt');
  await page.getByLabel('Tema').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('interactive controls have accessible names and page does not overflow viewport', async ({ page }) => {
  await page.goto('/explorar');

  const unnamed = await page.locator('button, input, textarea, select, a[href]').evaluateAll(elements =>
    elements
      .filter(element => {
        const html = element as HTMLElement;
        const text = (html.innerText || '').trim();
        const aria = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
        const title = element.getAttribute('title');
        const id = element.getAttribute('id');
        const label = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : element.closest('label');
        return !text && !aria && !title && !label;
      })
      .map(element => element.outerHTML.slice(0, 180))
  );
  expect(unnamed).toEqual([]);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('core reading remains available offline after a complete verified book download', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'One offline service-worker pass is enough.');

  await page.goto('/ler/jhn/1?v=1');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });

  await page.getByRole('button', { name: 'Baixar este livro' }).click();
  await expect(page.getByRole('button', { name: 'Livro completo offline' })).toBeVisible({ timeout: 45_000 });

  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /João 1:1/i })).toBeVisible();

  await page.getByRole('button', { name: 'Idioma original' }).click();
  await expect(page.getByText(/Grego koiné/i)).toBeVisible();
});

test('local build meets the initial layout/performance budget', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'Performance budget runs once in desktop Chromium.');

  await page.addInitScript(() => {
    const metrics = { cls: 0, lcp: 0, maxEvent: 0 };
    (window as Window & { __nestlumePerf?: typeof metrics }).__nestlumePerf = metrics;

    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
        if (!entry.hadRecentInput) metrics.cls += entry.value || 0;
      }
    }).observe({ type: 'layout-shift', buffered: true });

    new PerformanceObserver(list => {
      const last = list.getEntries().at(-1);
      if (last) metrics.lcp = last.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) metrics.maxEvent = Math.max(metrics.maxEvent, entry.duration);
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    } catch {
      // Event Timing is not required for this smoke; navigation + CLS/LCP remain measured.
    }
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar' }).first().click();
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() =>
    (window as Window & { __nestlumePerf?: { cls: number; lcp: number; maxEvent: number } }).__nestlumePerf
  );
  expect(metrics).toBeTruthy();
  expect(metrics!.cls).toBeLessThanOrEqual(0.1);
  expect(metrics!.lcp).toBeLessThanOrEqual(2500);
  if (metrics!.maxEvent > 0) expect(metrics!.maxEvent).toBeLessThanOrEqual(200);
});
