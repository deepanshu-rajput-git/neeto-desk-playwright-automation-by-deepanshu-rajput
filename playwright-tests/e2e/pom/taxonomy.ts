import { COMMON_SELECTORS, CustomCommands } from "@bigbinary/neeto-playwright-commons";
import { ALERT_BOX, TABLE_BODY_SELECTOR } from "@constants/common";
import { TAXONOMY_TEXTS } from "@constants/texts/taxonomy";
import { Page, expect } from "@playwright/test";
import { TAXONOMY_BUTTON_SELECTORS } from "@selectors/taxonomy";

export default class TaxonomyPage {
    page: Page;
    neetoPlaywrightUtilities: CustomCommands;

    constructor(page: Page, neetoPlaywrightUtilities: CustomCommands) {
        this.page = page;
        this.neetoPlaywrightUtilities = neetoPlaywrightUtilities;
    }

    verifyText = ({ container, text }) =>
        expect(this.page.getByTestId(container))
            .toContainText(new RegExp(text, 'i'));

    editTaxonomy = async ({ defaultValue, singularLabel, pluralLabel }:
        {
            defaultValue: string,
            singularLabel: string,
            pluralLabel: string,
        }) => {
        await this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(defaultValue, 'i') })
            .getByTestId(COMMON_SELECTORS.dropdownIcon).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownContainer))
            .toBeVisible({ timeout: 5000 });
        await this.page.getByTestId(COMMON_SELECTORS.dropdownContainer)
            .getByRole('button', { name: new RegExp(TAXONOMY_TEXTS.edit, 'i') }).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
            .toBeVisible({ timeout: 5000 });
        await this.page.getByTestId(TAXONOMY_BUTTON_SELECTORS.singularInputField)
            .fill(singularLabel);
        await this.page.getByTestId(TAXONOMY_BUTTON_SELECTORS.pluralInputField)
            .fill(pluralLabel);
        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
            .toBeHidden({ timeout: 10000 });
        await this.neetoPlaywrightUtilities.waitForPageLoad();
    }

    restoreToDefault = async ({ defaultValue }: { defaultValue: string }) => {
        await this.page.locator(TABLE_BODY_SELECTOR).getByRole('row', { name: new RegExp(defaultValue, 'i') })
            .getByTestId(COMMON_SELECTORS.dropdownIcon).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownContainer))
            .toBeVisible({ timeout: 5000 });
        await this.page.getByTestId(COMMON_SELECTORS.dropdownContainer)
            .getByRole('button', { name: new RegExp(TAXONOMY_TEXTS.resetToDefaults, 'i') }).click();
        await expect(this.page.getByTestId(ALERT_BOX)).toBeVisible({ timeout: 5000 });
        await expect(this.page.getByTestId(ALERT_BOX)
            .getByTestId(COMMON_SELECTORS.alertTitle))
            .toContainText(new RegExp(TAXONOMY_TEXTS.resetToDefaults, 'i'));
        await this.page.getByTestId(COMMON_SELECTORS.alertModalSubmitButton).click();
        await expect(this.page.getByTestId(ALERT_BOX))
            .toBeHidden({ timeout: 5000 });
        await this.neetoPlaywrightUtilities.waitForPageLoad();
    }
}