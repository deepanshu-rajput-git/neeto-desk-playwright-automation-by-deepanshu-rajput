import { COMMON_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { ALERT_BOX, TABLE_BODY_SELECTOR } from "@constants/common";
import { TAXONOMY_TEXTS } from "@constants/texts/taxonomy";
import { Page, expect } from "@playwright/test";
import { TAXONOMY_BUTTON_SELECTORS } from "@selectors/taxonomy";

export default class CannedResponse {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    verifyText = ({ container, text }) =>
        expect(this.page.getByTestId(container))
            .toContainText(new RegExp(text, 'i'));

    createCannedResponse = async ({ neetoPlaywrightUtilities }:
        {
            neetoPlaywrightUtilities
        }) => {

        await this.page.getByTestId('neeto-molecules-header').getByTestId('new-canned-response-button').click();
        await neetoPlaywrightUtilities.waitForPageLoad();
        await this.page.getByTestId('name-input-field').fill("Name");
        await this.page.getByTestId('description-text-area').fill("Desc");

        await this.page.getByTestId('note-action-button').click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
            .toBeVisible({ timeout: 5000 });

        await this.page.getByTestId('neeto-editor-content').fill("Note");
        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
            .toBeHidden({ timeout: 5000 });

        await this.page.getByTestId('form-submit-button').click();
        await neetoPlaywrightUtilities.waitForPageLoad();

        await expect(this.page.locator('.ant-table-body').getByRole('row', { name: new RegExp("Name") })).toBeVisible();
    }

    // restoreToDefault = async ({ defaultValue, neetoPlaywrightUtilities }: { defaultValue: string, neetoPlaywrightUtilities }) => {
    //     await this.page.locator(TABLE_BODY_SELECTOR).getByRole('row', { name: new RegExp(defaultValue, 'i') })
    //         .getByTestId(COMMON_SELECTORS.dropdownIcon).click();
    //     await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownContainer))
    //         .toBeVisible({ timeout: 5000 });
    //     await this.page.getByTestId(COMMON_SELECTORS.dropdownContainer)
    //         .getByRole('button', { name: new RegExp(TAXONOMY_TEXTS.resetToDefaults, 'i') }).click();
    //     await expect(this.page.getByTestId(ALERT_BOX)).toBeVisible({ timeout: 5000 });
    //     await expect(this.page.getByTestId(ALERT_BOX)
    //         .getByTestId(COMMON_SELECTORS.alertTitle))
    //         .toContainText(new RegExp(TAXONOMY_TEXTS.resetToDefaults, 'i'));
    //     await this.page.getByTestId(COMMON_SELECTORS.alertModalSubmitButton).click();
    //     await expect(this.page.getByTestId(ALERT_BOX))
    //         .toBeHidden({ timeout: 5000 });
    //     await neetoPlaywrightUtilities.waitForPageLoad();
    // }
}