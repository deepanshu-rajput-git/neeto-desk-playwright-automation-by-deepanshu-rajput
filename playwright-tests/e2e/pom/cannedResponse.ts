import { COMMON_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { COMMON_BUTTON_SELECTORS } from "@constants/common";
import { VIEW_TEXTS } from "@constants/texts/view";
import { CannedResponseInfo } from "@constants/utils";
import { Page, expect } from "@playwright/test";
import { VIEW_SELECTORS } from "@selectors/addNewView";

export default class CannedResponse {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    verifyText = ({ container, text }) =>
        expect(this.page.getByTestId(container))
            .toContainText(new RegExp(text, 'i'));

    createCannedResponse = async ({ neetoPlaywrightUtilities, cannedResponseInfo }:
        {
            neetoPlaywrightUtilities,
            cannedResponseInfo: CannedResponseInfo
        }) => {

        await this.page.getByTestId('neeto-molecules-header').getByTestId('new-canned-response-button').click();
        await neetoPlaywrightUtilities.waitForPageLoad();
        await this.page.getByTestId('name-input-field').fill(cannedResponseInfo.name);
        await this.page.getByTestId('description-text-area').fill(cannedResponseInfo.desc);

        await expect(async () => {
            await this.page.getByTestId('note-action-button').click();
            await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
                .toBeVisible({ timeout: 5000 });
        }).toPass({ timeout: 30000 });

        await this.page.getByTestId('neeto-editor-content').fill(cannedResponseInfo.note);
        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
            .toBeHidden({ timeout: 5000 });

        await this.page.getByTestId('form-submit-button').click();
        await neetoPlaywrightUtilities.waitForPageLoad();

        await expect(this.page.locator('.ant-table-body').getByRole('row', { name: new RegExp(cannedResponseInfo.name) })).toBeVisible();
    }


    deleteCannedResponse = async ({ neetoPlaywrightUtilities, cannedResponseInfo }) => {
        await this.page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
        await neetoPlaywrightUtilities.waitForPageLoad();
        await this.verifyText({
            container: COMMON_BUTTON_SELECTORS.mainHeader,
            text: VIEW_TEXTS.settings
        });

        const viewsButton = this.page.getByTestId('canned-responses-settings-option');
        await viewsButton.scrollIntoViewIfNeeded();
        await viewsButton.click();
        await neetoPlaywrightUtilities.waitForPageLoad();

        const dropDown = this.page.getByTestId('nui-dropdown-container');
        await this.page.locator('.ant-table-body').getByRole('row', { name: new RegExp(cannedResponseInfo.name) }).getByTestId('nui-dropdown-icon').click();
        await expect(dropDown).toBeVisible();
        await dropDown.getByRole('button', { name: 'Delete' }).click();

        await expect(this.page.getByTestId('alert-box')).toBeVisible();
        await this.page.getByTestId('alert-box').getByTestId('alert-submit-button').click();
        await expect(this.page.getByTestId('alert-box')).toBeHidden({ timeout: 10000 });
        await neetoPlaywrightUtilities.waitForPageLoad();
        await expect(this.page.locator('.ant-table-body').getByRole('row', { name: new RegExp(cannedResponseInfo.name) })).toBeHidden();
    }
}