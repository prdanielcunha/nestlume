import { expect, test, Page } from '@playwright/test';

async function mockNestAi(page: Page, onRun?: (body: any) => void) {
  await page.addInitScript(() => {
    (window as Window & { __NESTLUME_E2E__?: boolean }).__NESTLUME_E2E__ = true;
  });

  await page.route('https://www.millionsnest.com/api/v1/ai/guest-token', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'e2e-nestai-token', expiresIn: 300 }),
    });
  });

  await page.route('https://ai.millionsnest.com/v1/run', async route => {
    const body = route.request().postDataJSON();
    onRun?.(body);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        requestId: 'e2e-request',
        task: 'nestlume.study.grounded',
        version: 1,
        result: {
          answer: 'Resposta fundamentada de teste.',
          claims: [],
          limitations: [],
        },
        meta: {
          providerClass: 'free',
          cached: false,
          fallbackUsed: false,
          retries: 0,
        },
      }),
    });
  });
}

async function openExploreLayer(page: Page, layer: string) {
  await page.locator('.floating-explore').click();
  const panel = page.locator('.context-panel.open');
  await expect(panel).toBeVisible();
  const button = panel.locator('.explore-actions button').filter({ hasText: layer }).first();
  await expect(button).toBeVisible();
  await button.click();
}

test('public reading works without login and any passage can enter grounded study', async ({ page }) => {
  await page.goto('/ler/gen/1?v=1');
  await expect(page.getByRole('heading', { name: /Gênesis 1:1/i })).toBeVisible();

  await page.getByRole('button', { name: /Perguntar sobre esta passagem/i }).click();
  await expect(page).toHaveURL(/\/perguntar\?.*ref=/);
  await expect(page.getByLabel('Referência (opcional)')).toHaveValue(/Gênesis 1:1/i);
});

test('Greek and Hebrew original-language packages load at exact canonical references', async ({ page }) => {
  await page.goto('/ler/jhn/1?v=1');
  await openExploreLayer(page, 'Idioma original');
  const greekPanel = page.locator('.context-panel.open');
  await expect(greekPanel.getByText(/Grego koiné/i)).toBeVisible();
  await expect(greekPanel.getByRole('button', { name: /logos/i }).first()).toBeVisible();

  await page.goto('/ler/gen/1?v=1');
  await openExploreLayer(page, 'Idioma original');
  const hebrewPanel = page.locator('.context-panel.open');
  await expect(hebrewPanel.getByText(/Hebraico bíblico/i)).toBeVisible();
  await expect(hebrewPanel.locator('.original-line button').first()).toBeVisible();
});

test('versification mismatch is surfaced instead of silently shifting the verse', async ({ page }) => {
  await page.goto('/ler/2co/13?v=14');
  await openExploreLayer(page, 'Idioma original');
  await expect(page.getByRole('heading', { name: /2CO 13:14/i })).toBeVisible();
  await expect(page.getByText(/não desloca a referência silenciosamente/i)).toBeVisible();
});

test('AI uses only the canonical NestAI endpoint for grounded study', async ({ page }) => {
  let requestBody: any = null;
  await mockNestAi(page, body => { requestBody = body; });
  await page.goto('/perguntar?ref=Jo%C3%A3o%201%3A1-5');
  await page.getByRole('textbox', { name: /^Pergunta/ }).fill('O que esta passagem afirma sobre a Palavra?');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Estudar com IA' }).click();
  await expect(page.getByText('Resposta fundamentada de teste.')).toBeVisible();
  expect(requestBody?.task).toBe('nestlume.study.grounded');
  expect(requestBody?.context?.organizationId).toBe('public:nestlume');
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

  await openExploreLayer(page, 'Idioma original');
  await expect(page.locator('.context-panel.open').getByText(/Grego koiné/i)).toBeVisible();
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


test('Bible-wide sourced connections navigate to a related passage', async ({ page }) => {
  await page.goto('/ler/jhn/3?v=16');
  await openExploreLayer(page, 'Fio da Bíblia');
  await expect(page.getByRole('link', { name: /OpenBible\.info/i })).toBeVisible();
  const links = page.locator('.connection-list button');
  await expect(links.first()).toBeVisible();
  await links.first().click();
  await expect(page).toHaveURL(/\/ler\//);
});


test('sourced biblical places are available without invented certainty', async ({ page }) => {
  await page.goto('/ler/jhn/4?v=5');
  await openExploreLayer(page, 'Lugares');
  await expect(page.getByRole('link', { name: /OpenBible\.info/i })).toBeVisible();
  await expect(page.locator('.place-list article').first()).toBeVisible();
  await expect(page.getByText(/Score da fonte/i).first()).toBeVisible();
});


test('sourced biblical people are available without upstream AI descriptions', async ({ page }) => {
  await page.goto('/ler/jhn/1?v=6');
  await openExploreLayer(page, 'Pessoas');
  await expect(page.getByRole('link', { name: /STEP Bible/i })).toBeVisible();
  await expect(page.locator('.person-list article').first()).toBeVisible();
  await expect(page.getByText(/descrições geradas por IA/i)).toBeVisible();
});


test('representative whole-Bible reader matrix stays studyable across genres', async ({ page }) => {
  const passages = [
    { path: '/ler/gen/1?v=1', heading: /Gênesis 1:1/i },
    { path: '/ler/1sa/17?v=45', heading: /1 Samuel 17:45/i },
    { path: '/ler/psa/23?v=1', heading: /Salmos 23:1/i },
    { path: '/ler/pro/1?v=7', heading: /Provérbios 1:7/i },
    { path: '/ler/isa/53?v=4', heading: /Isaías 53:4/i },
    { path: '/ler/mat/5?v=3', heading: /Mateus 5:3/i },
    { path: '/ler/act/2?v=1', heading: /Atos 2:1/i },
    { path: '/ler/rom/8?v=1', heading: /Romanos 8:1/i },
    { path: '/ler/heb/11?v=1', heading: /Hebreus 11:1/i },
    { path: '/ler/rev/21?v=1', heading: /Apocalipse 21:1/i },
  ];

  for (const passage of passages) {
    await page.goto(passage.path);
    await expect(page.getByRole('heading', { name: passage.heading })).toBeVisible();
    await expect(page.getByRole('button', { name: /Perguntar sobre esta passagem/i })).toBeVisible();
  }
});


test('pasted text reaches AI flow only through explicit private consent and never leaks into URL', async ({ page }) => {
  const privateText = 'Trecho privado para estudo; não deve aparecer na URL.';
  let requestBody: any = null;
  await mockNestAi(page, body => { requestBody = body; });
  await page.goto('/colar');
  await page.getByLabel('Texto').fill(privateText);
  await page.getByLabel(/Versão informada por você/i).fill('NVI');
  await page.getByLabel(/Referência \(opcional\)/i).fill('João 1:1');

  await page.getByRole('button', { name: /Estudar este texto com IA/i }).click();
  await expect(page).toHaveURL(/\/perguntar\?mode=texto$/);
  expect(page.url()).not.toContain(encodeURIComponent(privateText));
  await expect(page.getByText(privateText)).toBeVisible();
  await expect(page.getByText(/Versão declarada: NVI/i)).toBeVisible();

  const checks = page.getByRole('checkbox');
  await expect(checks).toHaveCount(2);
  await checks.nth(0).check();
  await checks.nth(1).check();

  await page.getByRole('button', { name: 'Estudar com IA' }).click();
  await expect(page.getByText('Resposta fundamentada de teste.')).toBeVisible();
  expect(page.url()).not.toContain(encodeURIComponent(privateText));
  expect(requestBody?.task).toBe('nestlume.study.grounded');
  expect(requestBody?.input?.pastedText).toBe(privateText);
  expect(requestBody?.input?.consent?.allowPastedText).toBe(true);
});


test('contextual panel supports Escape Back and focus restoration without losing the passage', async ({ page }) => {
  await page.goto('/ler/jhn/1?v=1');
  const explore = page.locator('.floating-explore');

  await explore.focus();
  await explore.click();
  await expect(page.locator('.context-panel.open')).toHaveAttribute('role', 'dialog');
  await expect(page.locator('.panel-close')).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(page.locator('.context-panel')).not.toHaveClass(/open/);
  await expect(explore).toBeFocused();
  await expect(page).toHaveURL(/\/ler\/jhn\/1\?v=1$/);
  await expect(page.getByRole('heading', { name: /João 1:1/i })).toBeVisible();

  await explore.click();
  await expect(page.locator('.context-panel.open')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.context-panel')).not.toHaveClass(/open/);
  await expect(page).toHaveURL(/\/ler\/jhn\/1\?v=1$/);
  await expect(page.getByRole('heading', { name: /João 1:1/i })).toBeVisible();
});


test('open study questions stay local and reappear in the notebook', async ({ page }) => {
  const question = 'Como esta passagem desenvolve o tema da luz?';
  await page.goto('/ler/jhn/1?v=1-5');
  await page.getByText('Guardar uma pergunta para depois', { exact: true }).click();
  await page.getByLabel(/Pergunta · Somente neste dispositivo/i).fill(question);
  const saveQuestion = page.getByRole('button', { name: 'Guardar pergunta' });
  await saveQuestion.click();
  await expect(page.getByRole('button', { name: 'Guardado' })).toBeVisible();

  await page.goto('/caderno');
  await expect(page.getByText('PERGUNTA ABERTA', { exact: true })).toBeVisible();
  await expect(page.getByText(question, { exact: true })).toBeVisible();
});


test('reading lens derives observations locally without presenting them as AI', async ({ page }) => {
  await page.goto('/ler/jhn/1?v=1-5');
  await openExploreLayer(page, 'Ajude-me a enxergar');
  await expect(page.getByRole('heading', { name: 'Lentes de leitura' })).toBeVisible();
  await expect(page.getByText(/não são interpretação.*nem análise por IA/i)).toBeVisible();
  await expect(page.locator('.lens-word-list article').first()).toBeVisible();
});


test('whole-Bible browser opens any selected book and chapter', async ({ page }) => {
  await page.goto('/explorar');
  await page.getByLabel('Livro').selectOption('ROM');
  await page.getByLabel('Capítulo').selectOption('8');
  await page.getByRole('button', { name: 'Abrir capítulo' }).click();
  await expect(page).toHaveURL(/\/ler\/rom\/8$/);
  await expect(page.getByRole('heading', { name: /^Romanos 8$/i })).toBeVisible();
});


test('text provenance distinguishes New Testament TR from Old Testament release provenance', async ({ page }) => {
  await page.goto('/ler/pro/1?v=7');
  await openExploreLayer(page, 'Ver fonte');
  const oldTestamentPanel = page.locator('.context-panel.open');
  await expect(oldTestamentPanel.getByText(/Antigo Testamento: texto idêntico nas saídas TR\/N4/i)).toBeVisible();
  await expect(oldTestamentPanel.getByText(/^Textus Receptus$/i)).toHaveCount(0);

  await page.goto('/ler/jhn/1?v=1');
  await openExploreLayer(page, 'Ver fonte');
  const newTestamentPanel = page.locator('.context-panel.open');
  await expect(newTestamentPanel.getByText(/Novo Testamento: Textus Receptus/i)).toBeVisible();
});


test('integrated study hub is available on an arbitrary Bible passage', async ({ page }) => {
  await page.goto('/ler/rom/8?v=1-4');
  const hub = page.locator('.integrated-study-hub');
  await expect(hub.getByRole('heading', { name: /Estudo integrado da passagem/i })).toBeVisible();
  await expect(hub.locator('.integrated-study-grid button')).toHaveCount(6);
  await expect(hub.locator('.integrated-study-grid button').filter({ hasText: /Contexto/i })).toBeVisible();
  await expect(hub.locator('.integrated-study-grid button').filter({ hasText: /Idioma original|Grego koiné|Hebraico bíblico/i })).toBeVisible();
  await expect(hub.locator('.integrated-study-grid button').filter({ hasText: /Pessoas/i })).toBeVisible();
  await expect(hub.locator('.integrated-study-grid button').filter({ hasText: /Lugares/i })).toBeVisible();
  await expect(hub.locator('.integrated-study-grid button').filter({ hasText: /Passagens relacionadas|Fio da Bíblia/i })).toBeVisible();

  await hub.getByRole('button', { name: /Estudar esta passagem/i }).click();
  await expect(page).toHaveURL(/\/perguntar\?.*mode=study.*ref=/);
  await expect(page.getByRole('textbox', { name: /^Pergunta/ })).toHaveValue(/estudo profundo e integrado/i);
});
