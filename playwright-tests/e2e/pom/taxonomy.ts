import { COMMON_BUTTON_SELECTORS } from "@constants/common";
import { Page, expect } from "@playwright/test";
import { ViewInfo } from "../constants/utils";
import { VIEW_SELECTORS } from "@selectors/addNewView";

export default class TaxonomyPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    editTaxonomy = async ({ defaultValue, singularLabel, pluralLabel, neetoPlaywrightUtilities }: { defaultValue: string, singularLabel: string, pluralLabel: string, neetoPlaywrightUtilities }) => {
        await this.page.locator('.ant-table-body').getByRole('row', { name: new RegExp(defaultValue, 'i') }).getByTestId('nui-dropdown-icon').click();

        await expect(this.page.getByTestId('nui-dropdown-container')).toBeVisible();
        await this.page.getByTestId('nui-dropdown-container').getByRole('button', { name: new RegExp('Edit', 'i') }).click();

        await expect(this.page.getByTestId('pane-body')).toBeVisible();

        await this.page.getByTestId('taxonomy-singular-input-field').fill(singularLabel);
        await this.page.getByTestId('taxonomy-plural-input-field').fill(pluralLabel);
        await this.page.getByTestId('save-changes-button').click();
        await neetoPlaywrightUtilities.waitForPageLoad();
        // await this.page.locator('.ant-table-body').getByRole('row', {name:new RegExp(defaultValue, 'i')})
    }

    restoreToDefault = async ({ defaultValue, neetoPlaywrightUtilities }: { defaultValue: string, neetoPlaywrightUtilities }) => {
        await this.page.locator('.ant-table-body').getByRole('row', { name: new RegExp(defaultValue, 'i') }).getByTestId('nui-dropdown-icon').click();
        await expect(this.page.getByTestId('nui-dropdown-container')).toBeVisible();
        await this.page.getByTestId('nui-dropdown-container').getByRole('button', { name: new RegExp('Reset to defaults', 'i') }).click();

        await expect(this.page.getByTestId('alert-box')).toBeVisible();
        await expect(this.page.getByTestId('alert-box').getByTestId('alert-title')).toContainText(new RegExp('Reset to defaults', 'i'));
        await this.page.getByTestId('alert-submit-button').click();
        await neetoPlaywrightUtilities.waitForPageLoad();
    }
}