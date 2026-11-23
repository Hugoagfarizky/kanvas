/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from "@playwright/test"
import path from "node:path"

test("regression: no autosave writes while idle after an edit", async ({ page }) => {
  await page.addInitScript(() => {
    ;(window as any).__puts = 0
    const original = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function (...args: any[]) {
      ;(window as any).__puts += 1
      return original.apply(this, args as any)
    }
  })
  await page.goto("/")
  await page.getByRole("button", { name: "Start a blank board" }).click()
  await expect(page).toHaveURL(/board\//)
  await page.waitForTimeout(1000)

  await page.keyboard.press("n")
  await page.waitForTimeout(1500)

  const before = await page.evaluate(() => (window as any).__puts)
  await page.waitForTimeout(3000)
  const after = await page.evaluate(() => (window as any).__puts)
  expect(after - before).toBeLessThan(3)
})

test("regression: pen stroke is removed by undo", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Start a blank board" }).click()
  await expect(page).toHaveURL(/board\//)
  await page.waitForTimeout(800)

  await page.keyboard.press("p")
  const canvas = page.locator(".react-flow")
  const box = await canvas.boundingBox()
  if (box) {
    await page.mouse.move(box.x + 200, box.y + 200)
    await page.mouse.down()
    await page.mouse.move(box.x + 320, box.y + 260, { steps: 10 })
    await page.mouse.up()
  }
  await page.waitForTimeout(400)
  const pathsBeforeUndo = await page.locator('svg path[fill="#0f172a"], svg path[fill="#f8fafc"]').count()

  await page.keyboard.press("Control+z")
  await page.waitForTimeout(500)
  const pathsAfterUndo = await page.locator('svg path[fill="#0f172a"], svg path[fill="#f8fafc"]').count()

  expect(pathsAfterUndo).toBeLessThan(pathsBeforeUndo)
})

test("regression: edge count survives a reload", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Start a blank board" }).click()
  await expect(page).toHaveURL(/board\//)
  await page.waitForTimeout(800)
  await page.getByRole("button", { name: "Load Dei Learning Plan Demo" }).click()
  await page.waitForTimeout(800)
  const before = await page.locator(".react-flow__edge").count()

  await page.reload()
  await page.waitForTimeout(1000)
  const after = await page.locator(".react-flow__edge").count()
  expect(after).toBe(before)
  expect(after).toBeGreaterThan(0)
})

test("regression: template switch keeps template after reload", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Start a blank board" }).click()
  await expect(page).toHaveURL(/board\//)
  await page.waitForTimeout(800)
  await page.getByRole("button", { name: "Load Dei Learning Plan Demo" }).click()
  await page.waitForTimeout(800)

  await page.reload()
  await page.waitForTimeout(1000)
  await expect(page.locator(".react-flow__node").first()).toBeVisible()
})

test("regression: importing a task node without items does not crash", async ({ page }) => {
  await page.goto("/")
  const filePath = path.resolve("e2e/fixtures/import-task.kanvas.json")
  await page.locator('input[type="file"]').setInputFiles(filePath)
  await expect(page.getByText("Board imported", { exact: true })).toBeVisible()
  await page.getByRole("link", { name: /Import test/ }).click()
  await expect(page).toHaveURL(/board\//)
  await page.waitForTimeout(1000)
  await expect(page.locator(".react-flow__node")).toHaveCount(1)
})
