import { COMMON_SELECTORS, CustomCommands, hyphenize } from "@bigbinary/neeto-playwright-commons";
import { WebFormInfo } from "@constants/utils";
import { Page, expect } from "@playwright/test";
import { VIEW_SELECTORS } from "@selectors/addNewView";
import { WEB_FORM_SELECTORS } from "@selectors/webForm";

export default class WebForm {
    page: Page;
    neetoPlaywrightUtilities: CustomCommands;

    constructor(page: Page, neetoPlaywrightUtilities: CustomCommands) {
        this.page = page;
        this.neetoPlaywrightUtilities = neetoPlaywrightUtilities;
    }

    verifyText = ({ container, text }) =>
        expect(this.page.getByTestId(container))
            .toContainText(new RegExp(text, 'i'));

    createWebForm = async ({ webFormInfo }:
        {
            webFormInfo: WebFormInfo
        }) => {

        await this.page.getByTestId(COMMON_SELECTORS.header).getByTestId(WEB_FORM_SELECTORS.addNewWebForm).click();
        await this.neetoPlaywrightUtilities.waitForPageLoad();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
            .toBeVisible({ timeout: 5000 });

        await this.page.getByTestId(WEB_FORM_SELECTORS.webFormsTitleInput).fill(webFormInfo.name);
        await this.page.getByTestId(WEB_FORM_SELECTORS.webFormsDescField).fill(webFormInfo.desc);


        const toggleButton = this.page.getByTestId(WEB_FORM_SELECTORS.publicSwitch);
        if (webFormInfo.isPublic) {
            await toggleButton.click();
            await expect(toggleButton.locator(VIEW_SELECTORS.checkIcon)).toBeVisible({ timeout: 5000 });
        } else {
            await expect(toggleButton.locator(VIEW_SELECTORS.closeIcon)).toBeVisible({ timeout: 5000 });
        }

        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody)).toBeHidden({ timeout: 6000 });
        await this.neetoPlaywrightUtilities.waitForPageLoad();

        await expect(this.page.getByTestId(COMMON_SELECTORS.heading)).toContainText(new RegExp(webFormInfo.name, 'i'));

        for (const quesNumber of Array.from({ length: 3 }, (_, i) => i)) {
            await this.page.locator(`[name="questions.${quesNumber}.label"]`)
                .fill(webFormInfo.questions[quesNumber].label);

            await this.neetoPlaywrightUtilities.waitForPageLoad();

            await this.page.locator(`[name="questions.${quesNumber}.placeholder"]`)
                .fill(webFormInfo.questions[quesNumber].label);

            await this.neetoPlaywrightUtilities.waitForPageLoad();
        }

        const formContainer = this.page.locator(WEB_FORM_SELECTORS.neetoFormEngine);
        await Promise.all(webFormInfo.questions.map(async (question) => {
            await expect(formContainer.getByTestId(`${hyphenize(question.label)}-input-label`)).toBeVisible();
            await expect(formContainer.getByPlaceholder(`${question.placeholder}`)).toBeVisible();
        }));

        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await this.neetoPlaywrightUtilities.verifyToast();
        await this.neetoPlaywrightUtilities.waitForPageLoad();
    }
}