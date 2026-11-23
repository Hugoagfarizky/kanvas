import { expect, test, type Page } from "@playwright/test"

async function createBoard(page: Page) {
  await page.getByRole("button", { name: "Start a blank board" }).click()
  await expect(page).toHaveURL(/board\//)
  return page.getByRole("textbox", { name: "Board title" })
}

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("creates a board and keeps the title after reload", async ({ page }) => {
  const title = await createBoard(page)

  await title.fill("Launch checklist")
  await title.blur()

  await expect(page.getByText("Saved locally")).toBeVisible()

  await page.reload()

  await expect(page.getByRole("textbox", { name: "Board title" })).toHaveValue("Launch checklist")
})

test("remembers the theme across reloads", async ({ page }) => {
  await page.getByRole("button", { name: "Switch to dark mode" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)

  await page.reload()

  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(page.getByRole("button", { name: "Switch to light mode" })).toBeVisible()
})

test("deletes a board and restores it with undo", async ({ page }) => {
  await createBoard(page)
  await page.getByRole("link", { name: "Back to boards" }).first().click()

  await expect(page.getByRole("link", { name: /Untitled board/ })).toBeVisible()

  await page.getByRole("button", { name: "Delete Untitled board" }).click()
  await expect(page.getByText("Board deleted", { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: /Untitled board/ })).toHaveCount(0)

  await page.getByRole("button", { name: "Undo" }).click()
  await expect(page.getByRole("link", { name: /Untitled board/ })).toHaveCount(1)
})

test("exports a board and imports it back as a copy", async ({ page }) => {
  const title = await createBoard(page)

  await title.fill("Backup test")
  await title.press("Enter")
  await expect(page.getByText("Saved locally")).toBeVisible()

  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export board as JSON" }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toBe("backup-test.kanvas.json")
  const filePath = await download.path()
  expect(filePath).toBeTruthy()

  await page.getByRole("link", { name: "Back to boards" }).first().click()
  await page.getByRole("button", { name: "Delete Backup test" }).click()

  await page.locator('input[type="file"]').setInputFiles(filePath as string)

  await expect(page.getByText("Board imported", { exact: true })).toBeVisible()
  await expect(page.getByRole("link", { name: /Backup test/ })).toHaveCount(1)
})

test("loads without a network after the first visit", async ({ page, context }) => {
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready
    return Boolean(registration.active) && Boolean(navigator.serviceWorker.controller)
  })

  await context.setOffline(true)
  await page.reload()

  await expect(page.getByRole("heading", { name: "Your boards" })).toBeVisible()
})
