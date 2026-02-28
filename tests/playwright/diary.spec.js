const { test, expect } = require("@playwright/test");

const diaryPath = "/private-use/diary.html";
const gasEndpointPattern = "**/macros/s/**/exec";

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        try { localStorage.clear(); } catch (err) {}
        try { sessionStorage.clear(); } catch (err) {}
    });
});

async function openDiaryEditor(page) {
    await page.goto(diaryPath);
    await page.click("#nextBtn");
    await expect(page.locator("#editorView")).toHaveClass(/active/);
}

async function chooseTag(page, tagText) {
    await page
        .locator("#tagChips .tag-chip")
        .filter({ hasText: `#${tagText}` })
        .first()
        .click();
}

test("家庭和社交的 + 打开对应输入框并挂载到对应行", async ({ page }) => {
    await openDiaryEditor(page);

    await chooseTag(page, "家庭");
    await expect(page.locator("#sceneLabelAddBtn")).toBeVisible();
    await page.click("#sceneLabelAddBtn");
    await expect(page.locator("#familyPeopleAddRow")).toHaveClass(/show/);
    const familyAddParentId = await page.locator("#familyPeopleAddRow").evaluate((node) => node.parentElement?.id || "");
    expect(familyAddParentId).toBe("familyPeopleRow");
    await page.fill("#familyPeopleInput", "配偶");
    await page.press("#familyPeopleInput", "Enter");
    await expect(
        page.locator("#familyPeopleRow .social-person-chip").filter({ hasText: "配偶" })
    ).toHaveCount(1);

    await chooseTag(page, "社交");
    await page.click("#sceneLabelAddBtn");
    await expect(page.locator("#socialPeopleAddRow")).toHaveClass(/show/);
    const socialAddParentId = await page.locator("#socialPeopleAddRow").evaluate((node) => node.parentElement?.id || "");
    expect(socialAddParentId).toBe("socialPeopleRow");
    await page.fill("#socialPeopleInput", "同事");
    await page.press("#socialPeopleInput", "Enter");
    await expect(
        page.locator("#socialPeopleRow .social-person-chip").filter({ hasText: "同事" })
    ).toHaveCount(1);
});

test("新增标签会进入提交 payload，连续两次提交动效不重复", async ({ page }) => {
    const postBodies = [];

    await page.route(gasEndpointPattern, async (route) => {
        const req = route.request();
        if (req.method() === "POST") {
            postBodies.push(String(req.postData() || ""));
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    status: "success",
                    finance: { rowCount: 0 }
                })
            });
            return;
        }
        await route.fulfill({ status: 204, body: "" });
    });

    await openDiaryEditor(page);

    await chooseTag(page, "家庭");
    await page.click("#sceneLabelAddBtn");
    await page.fill("#familyPeopleInput", "配偶");
    await page.press("#familyPeopleInput", "Enter");
    await page.fill("#entryText", "今天和家里沟通了一件事");
    await page.click("#submitBtn");
    await expect(page.locator("#submitOverlay")).toHaveAttribute("data-mode", "success");
    await expect.poll(() => postBodies.length).toBe(1);
    const firstPayload = JSON.parse(postBodies[0]);
    expect(firstPayload.tag).toBe("家庭");
    expect(Array.isArray(firstPayload.familyPeople)).toBeTruthy();
    expect(firstPayload.familyPeople).toContain("配偶");
    const firstEffect = await page.locator("#submitOverlay").getAttribute("data-effect");
    expect(firstEffect).toBeTruthy();
    await page.click("#submitHomeBtn");

    await page.click("#nextBtn");
    await expect(page.locator("#editorView")).toHaveClass(/active/);
    await chooseTag(page, "工作");
    await page.fill("#entryText", "完成了一个测试修复");
    await page.click("#submitBtn");
    await expect(page.locator("#submitOverlay")).toHaveAttribute("data-mode", "success");
    await expect.poll(() => postBodies.length).toBe(2);
    const secondEffect = await page.locator("#submitOverlay").getAttribute("data-effect");
    expect(secondEffect).toBeTruthy();
    expect(secondEffect).not.toBe(firstEffect);
});

test("空内容提交会显示明确阻断原因", async ({ page }) => {
    await openDiaryEditor(page);
    await chooseTag(page, "工作");
    await page.click("#submitBtn");
    await expect(page.locator("#submitOverlay")).toHaveAttribute("data-mode", "error");
    await expect(page.locator("#submitText")).toHaveText(/内容为空，暂时不能提交/);
    await expect(page.locator("#submitSubtext")).toContainText("请先处理以下问题");
    await expect(page.locator("#submitSubtext")).toContainText("还没填写任何内容");
});
