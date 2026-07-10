import { expect, test } from "@playwright/test";

async function closeShellContactPromo(page) {
    const closeButton = page.locator(".ggx-contact-promo-close");
    try {
        await closeButton.waitFor({ state: "visible", timeout: 8_000 });
        await closeButton.click();
        await expect(page.locator("#ggx-contact-promo-modal")).toHaveCount(0);
    } catch {
        // The shared contact modal is not part of this feature and may be disabled by config.
    }
}

test.describe("G300 product sharing", () => {
    test("opens share panel and prepares customer share assets", async ({ page }) => {
        await page.goto("/products/300kw/", { waitUntil: "domcontentloaded" });
        await closeShellContactPromo(page);

        const shareButton = page.getByRole("button", { name: /share with customer/i });
        await expect(shareButton).toBeVisible();
        await shareButton.click();

        const dialog = page.getByRole("dialog", { name: /share gasgx g300/i });
        await expect(dialog).toBeVisible();

        const message = page.locator("#g300-share-copy");
        await expect(message).toHaveValue(/https:\/\/www\.gasgx\.com\/products\/300kw\//);
        await expect(message).toHaveValue(/300kW/);

        await expect.poll(async () => {
            return page.locator("#g300-share-poster").evaluate((img: HTMLImageElement) => ({
                src: img.currentSrc || img.src,
                width: img.naturalWidth,
                height: img.naturalHeight,
            }));
        }).toEqual(expect.objectContaining({
            src: expect.stringContaining("data:image/png"),
            width: 1080,
            height: 1440,
        }));

        const qrValues = await page.evaluate(async () => {
            const BarcodeDetectorCtor = (window as any).BarcodeDetector;
            if (!BarcodeDetectorCtor) return null;
            const img = document.getElementById("g300-share-poster") as HTMLImageElement | null;
            if (!img || !img.src) return [];
            const response = await fetch(img.src);
            const bitmap = await createImageBitmap(await response.blob());
            const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
            const codes = await detector.detect(bitmap);
            return codes.map((code: { rawValue: string }) => code.rawValue);
        });
        if (qrValues) expect(qrValues).toContain("https://www.gasgx.com/products/300kw/");

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
    });

    test("keeps share controls usable on mobile width", async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto("/products/300kw/", { waitUntil: "domcontentloaded" });
        await closeShellContactPromo(page);
        await page.getByRole("button", { name: /share with customer/i }).click();

        const panel = page.locator(".product-share-panel");
        await expect(panel).toBeVisible();
        const box = await panel.boundingBox();
        expect(box?.width ?? 0).toBeLessThanOrEqual(390);
        await expect(page.getByRole("button", { name: /copy message/i })).toBeVisible();
        await expect(page.getByRole("button", { name: /save poster/i })).toBeVisible();
    });

    test("supports swiping product gallery images on mobile", async ({ page }) => {
        await page.setViewportSize({ width: 430, height: 932 });
        await page.goto("/products/300kw/", { waitUntil: "domcontentloaded" });
        await closeShellContactPromo(page);

        const stage = page.locator(".gallery-stage");
        await expect(stage).toBeVisible();
        await expect(page.locator("[data-carousel-current]")).toHaveText("01");

        await stage.dispatchEvent("touchstart", {
            touches: [{ identifier: 1, clientX: 360, clientY: 260 }],
        });
        await stage.dispatchEvent("touchend", {
            changedTouches: [{ identifier: 1, clientX: 80, clientY: 265 }],
        });

        await expect(page.locator("[data-carousel-current]")).toHaveText("02");
    });
});
