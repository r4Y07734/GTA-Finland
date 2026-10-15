import { expect, test, type Page } from "@playwright/test";
const state = (page: Page) =>
  page.evaluate(() => (window as any).__game.debugState());
const walk = async (page: Page, key: string, ms: number) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(180);
};

test("explore, discover a landmark, inspect it, and restore progress", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:5173") &&
      !r.url().startsWith("ws:")
    )
      external.push(r.url());
  });
  await page.goto("/");
  await expect(page.locator("#game")).toBeVisible();
  await expect(page.locator("#fps")).not.toHaveText("0");
  await page.getByRole("button", { name: "The streets are yours" }).click();
  await walk(page, "w", 1050);
  const moved = await state(page);
  expect(moved.player.y).toBeLessThan(1180);
  expect(moved.found).toContain("square");
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator("#dialog-title")).toContainText("Rautatientori");
  expect((await state(page)).paused).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  await expect.poll(async () => (await state(page)).found).toContain("square");
  expect(Math.abs((await state(page)).player.y - moved.player.y)).toBeLessThan(
    5,
  );
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("solid station walls block movement and sprinting is faster", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#game").focus();
  await walk(page, "a", 2800);
  const blocked = await state(page);
  expect(blocked.player.x).toBeGreaterThanOrEqual(1197);
  expect(blocked.player.x).toBeLessThan(1202);
  expect(blocked.colliding).toBe(false);
  await page.evaluate(() => (window as any).__game.reset());
  await page.waitForTimeout(200);
  await walk(page, "w", 650);
  const walkDistance = 1260 - (await state(page)).player.y;
  await page.evaluate(() => (window as any).__game.reset());
  await page.waitForTimeout(200);
  await page.keyboard.down("Shift");
  await walk(page, "w", 650);
  await page.keyboard.up("Shift");
  const runDistance = 1260 - (await state(page)).player.y;
  expect(runDistance).toBeGreaterThan(walkDistance * 1.5);
});

test("map, field notes, help, pause, zoom, and movement after clicking controls", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "District map", exact: false })
    .first()
    .click();
  await expect(page.locator("#district-map")).toBeVisible();
  expect((await state(page)).paused).toBe(true);
  await page.keyboard.press("m");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Field notes" }).click();
  await expect(page.locator(".landmark-item")).toHaveCount(7);
  await page.locator(".landmark-item").first().click();
  await expect(page.locator("#dialog-title")).toContainText(
    "Helsinki Central Station",
  );
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: "Show all controls" }).click();
  await expect(page.locator("#dialog-title")).toContainText(
    "Find your own way",
  );
  await page.getByRole("button", { name: "Let’s explore" }).click();
  const before = (await state(page)).zoom;
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  expect((await state(page)).zoom).toBeGreaterThan(before);
  await walk(page, "w", 400);
  expect((await state(page)).player.y).toBeLessThan(1230);
  await page.locator("#game").focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#dialog-title")).toContainText(
    "The city can wait",
  );
  await page.getByRole("button", { name: "Return to Rautatientori" }).click();
  expect((await state(page)).player.x).toBe(1370);
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await page.getByRole("button", { name: "Center on player" }).click();
});

test("mobile layout fits and touch movement releases correctly", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await expect(page.locator(".touch-controls")).toBeVisible();
  await page.getByRole("button", { name: "The streets are yours" }).click();
  const down = page.getByRole("button", { name: "Walk south" });
  const box = (await down.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(550);
  await page.mouse.up();
  const after = (await state(page)).player.y;
  expect(after).toBeGreaterThan(1290);
  await page.waitForTimeout(400);
  expect(Math.abs((await state(page)).player.y - after)).toBeLessThan(8);
  await page
    .getByRole("button", { name: "Open district map", exact: true })
    .last()
    .click();
  await expect(page.locator("#district-map")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await context.close();
});
