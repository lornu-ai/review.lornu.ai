import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/")
})

test("opens on the facility request and is marked confidential", async ({ page }) => {
  await expect(page).toHaveTitle("Lornuai · Commercial Credit Review")
  await expect(page.locator(".hero-ask strong")).toHaveText("$1.25M")
  await expect(page.locator(".topbar-center")).toContainText("Confidential")
  await expect(page.locator(".counter")).toContainText("01")
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow")
})

test("moves through all nine slides with the arrow buttons", async ({ page, isMobile }) => {
  const next = page.getByRole("button", { name: "Next slide" })
  const previous = page.getByRole("button", { name: "Previous slide" })
  await expect(previous).toBeDisabled()
  for (let slide = 2; slide <= 9; slide++) {
    await next.click()
    await expect(page.locator(".counter")).toContainText(String(slide).padStart(2, "0"))
  }
  await expect(next).toBeDisabled()
  await expect(page.locator(".close-slide")).toContainText("review.lornu.ai · Confidential")
  // Below 1050px the design hides the closing figures and the restart button; phones go back with the arrows.
  if (isMobile) {
    await previous.click()
    await expect(page.locator(".counter")).toContainText("08")
    return
  }
  await page.getByRole("button", { name: /Restart presentation/ }).click()
  await expect(page.locator(".counter")).toContainText("01")
})

test("the keyboard drives the deck", async ({ page, isMobile }) => {
  test.skip(isMobile, "No hardware keyboard on the phone profile")
  await page.keyboard.press("ArrowRight")
  await expect(page.locator(".counter")).toContainText("02")
  await page.keyboard.press("Space")
  await expect(page.locator(".counter")).toContainText("03")
  await page.keyboard.press("ArrowLeft")
  await expect(page.locator(".counter")).toContainText("02")
})

test("the overview jumps straight to a chapter", async ({ page }) => {
  await page.getByRole("button", { name: /Overview/ }).click()
  const dialog = page.getByRole("dialog", { name: "Presentation overview" })
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: /Capital/ }).click()
  await expect(dialog).toBeHidden()
  await expect(page.locator(".counter")).toContainText("06")
})

test("scenario tabs change the coverage projection", async ({ page }) => {
  await page.getByRole("button", { name: /Overview/ }).click()
  await page.getByRole("dialog", { name: "Presentation overview" }).getByRole("button", { name: /Coverage/ }).click()
  const chart = page.locator("svg.chart")
  await expect(chart).toHaveAttribute("aria-label", "Base case debt service coverage projection")
  const baseLine = await page.locator(".chart-line").getAttribute("points")
  await page.getByRole("button", { name: "Upside" }).click()
  await expect(chart).toHaveAttribute("aria-label", "Upside debt service coverage projection")
  await expect(page.locator(".chart-line")).not.toHaveAttribute("points", baseLine ?? "")
  await page.getByRole("button", { name: "Conservative" }).click()
  await expect(chart).toHaveAttribute("aria-label", "Conservative debt service coverage projection")
})
