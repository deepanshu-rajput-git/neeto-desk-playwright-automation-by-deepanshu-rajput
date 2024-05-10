import { COMMON_SELECTORS, NEETO_EDITOR_SELECTORS, hyphenize } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { ALERT_BOX, COMMON_BUTTON_SELECTORS, COMMON_TEXTS, TABLE_BODY_SELECTOR } from "@constants/common";
import { expect } from "@playwright/test";
import { VIEW_TEXTS } from "@constants/texts/view";
import { VIEW_SELECTORS } from "@selectors/addNewView";
import { SampleFormData, WebFormInfo, generateSampleFormData, generateWebFormInfo } from "@constants/utils";
import { WEB_FORM_SELECTORS } from "@selectors/webForm";
import { WEB_FORM_TEXTS } from "@constants/texts/webForm";


test.describe("Web Form", () => {
    let webFormInfo: WebFormInfo, sampleFormData: SampleFormData;
    test.beforeAll(() => {
        webFormInfo = generateWebFormInfo();
        sampleFormData = generateSampleFormData();
    });

    test("should able to create a new web form ", async ({ page, webForm, context, neetoPlaywrightUtilities }) => {
        test.slow();
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Navigate to settings", async () => {
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await webForm.verifyText({
                container: COMMON_BUTTON_SELECTORS.mainHeader,
                text: VIEW_TEXTS.settings
            })
        });

        await test.step("Step 3: Navigate to Web Forms settings option", async () => {
            const webFormsButton = page.getByTestId(WEB_FORM_SELECTORS.webFormSettings);
            await webFormsButton.scrollIntoViewIfNeeded();
            await webFormsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Creating a new web form", async () => {
            await webForm.verifyText({
                container: COMMON_SELECTORS.heading,
                text: WEB_FORM_TEXTS.webForms
            });
            await webForm.createWebForm({ webFormInfo });
        });


        await test.step("Step 6: Opening the form", async () => {
            const pagePromise = context.waitForEvent('page');
            await page.getByTestId(WEB_FORM_SELECTORS.webFormsViewButton).click();
            const newPage = await pagePromise;
            await newPage.waitForLoadState();


            await expect(async () => {
                await newPage.getByTestId(WEB_FORM_SELECTORS.selectValueContainer).click();
                await expect(newPage.getByTestId(WEB_FORM_SELECTORS.formSelectMenu)).toBeVisible({
                    timeout: 4000,
                });
                await newPage.getByTestId(WEB_FORM_SELECTORS.formSelectMenu).getByText(webFormInfo.name).click();
                await expect(newPage.getByTestId(WEB_FORM_SELECTORS.selectValueContainer)).toContainText(webFormInfo.name, { timeout: 2000 });
            }).toPass({ timeout: 30000 });


            await newPage.getByTestId(`${hyphenize(webFormInfo.questions[0].label)}-input-field`).fill(sampleFormData.name);
            await newPage.getByTestId(NEETO_EDITOR_SELECTORS.contentField).filter({
                has: newPage.locator(`[data-placeholder="${webFormInfo.questions[1].placeholder}"]`)
            }).fill(sampleFormData.desc);

            await newPage.getByTestId(`${hyphenize(webFormInfo.questions[2].label)}-input-field`).fill(sampleFormData.email);

            await newPage.getByRole('button', { name: COMMON_TEXTS.submit }).click();

            await expect(newPage.getByTestId(WEB_FORM_SELECTORS.formSelectMenu)).toBeVisible({
                timeout: 4000,
            });

            await expect(newPage.
                getByRole('heading', {
                    name: new RegExp(WEB_FORM_TEXTS.thanksFormMsg, 'i')
                }))
                .toBeVisible({ timeout: 5000 });

            await newPage.close();
        });

        await test.step("Step 7: Tearing down the form", async () => {
            await page.getByTestId(WEB_FORM_SELECTORS.webFormSublink).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId(COMMON_SELECTORS.heading)).toContainText(WEB_FORM_TEXTS.webForms);
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(webFormInfo.name) })
                .getByTestId(COMMON_SELECTORS.dropdownIcon).click();

            await expect(page.getByTestId(COMMON_SELECTORS.dropdownContainer)).toBeVisible({ timeout: 5000 });
            await page.getByTestId(COMMON_SELECTORS.dropdownContainer).getByRole('button', { name: COMMON_TEXTS.delete }).click();

            const alertModal = page.getByTestId(ALERT_BOX);
            await expect(alertModal).toBeVisible({ timeout: 40000 });
            await alertModal.getByTestId(COMMON_BUTTON_SELECTORS.alertSubmitButton).click();
            await expect(alertModal).toBeHidden({ timeout: 10000 });
        })
    });
});