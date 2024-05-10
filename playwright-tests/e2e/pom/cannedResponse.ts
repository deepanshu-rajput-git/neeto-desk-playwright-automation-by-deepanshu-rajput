import { COMMON_SELECTORS, CustomCommands, NEETO_EDITOR_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { ALERT_BOX, COMMON_BUTTON_SELECTORS, TABLE_BODY_SELECTOR } from "@constants/common";
import { CANNED_RESPONSE_TEXTS } from "@constants/texts/cannedResponse";
import { VIEW_TEXTS } from "@constants/texts/view";
import { CannedResponseInfo } from "@constants/utils";
import { Page, expect } from "@playwright/test";
import { VIEW_SELECTORS } from "@selectors/addNewView";
import { CANNED_RESPONSE_SELECTORS } from "@selectors/cannedResponse";

export default class CannedResponse {
    page: Page;
    neetoPlaywrightUtilities: CustomCommands;

    constructor(page: Page, neetoPlaywrightUtilities: CustomCommands) {
        this.page = page;
        this.neetoPlaywrightUtilities = neetoPlaywrightUtilities;
    }

    verifyText = ({ container, text }) =>
        expect(this.page.getByTestId(container))
            .toContainText(new RegExp(text, 'i'));

    createCannedResponse = async ({ cannedResponseInfo }:
        {
            cannedResponseInfo: CannedResponseInfo
        }) => {

        await this.page.getByTestId(COMMON_SELECTORS.header).getByTestId(CANNED_RESPONSE_SELECTORS.newCannedResponseButton).click();
        await this.neetoPlaywrightUtilities.waitForPageLoad();
        await this.page.getByTestId(CANNED_RESPONSE_SELECTORS.nameInputField).fill(cannedResponseInfo.name);
        await this.page.getByTestId(CANNED_RESPONSE_SELECTORS.descTextArea).fill(cannedResponseInfo.desc);


        const toggleButton = this.page.getByTestId(VIEW_SELECTORS.activeSwitch);
        if (!cannedResponseInfo.active) {
            await toggleButton.click();
            await expect(toggleButton.locator(VIEW_SELECTORS.closeIcon)).toBeVisible({ timeout: 5000 });
        } else {
            await expect(toggleButton.locator(VIEW_SELECTORS.checkIcon)).toBeVisible({ timeout: 5000 });
        }

        await this.page.locator(`[value="${cannedResponseInfo.availability}"]`).click();

        await this.page.getByTestId(CANNED_RESPONSE_SELECTORS.addActionButton).click();
        const deleteButton = this.page.getByTestId(CANNED_RESPONSE_SELECTORS.deleteActionButton);
        await expect(deleteButton).toBeVisible({ timeout: 5000 });
        await deleteButton.click();
        await expect(deleteButton).toBeHidden({ timeout: 5000 });

        await expect(async () => {
            await this.page.getByTestId(CANNED_RESPONSE_SELECTORS.noteActionButton).click();
            await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
                .toBeVisible({ timeout: 5000 });
        }).toPass({ timeout: 30000 });

        await this.page.getByTestId(NEETO_EDITOR_SELECTORS.contentField).fill(cannedResponseInfo.note);
        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.paneBody))
            .toBeHidden({ timeout: 5000 });

        await this.page.getByTestId(CANNED_RESPONSE_SELECTORS.formSubmitButton).click();
        await this.neetoPlaywrightUtilities.waitForPageLoad();

        await expect(this.page.locator(TABLE_BODY_SELECTOR).getByRole('row', { name: new RegExp(cannedResponseInfo.name) })).toBeVisible({ timeout: 5000 });
    }

    deleteCannedResponse = async ({ cannedResponseInfo }) => {
        await this.page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
        await this.neetoPlaywrightUtilities.waitForPageLoad();
        await this.verifyText({
            container: COMMON_BUTTON_SELECTORS.mainHeader,
            text: VIEW_TEXTS.settings
        });

        const viewsButton = this.page.getByTestId(CANNED_RESPONSE_SELECTORS.cannedResponsesSettings);
        await viewsButton.scrollIntoViewIfNeeded();
        await viewsButton.click();
        await this.neetoPlaywrightUtilities.waitForPageLoad();

        const dropDown = this.page.getByTestId(COMMON_SELECTORS.dropdownContainer);
        await this.page.locator(TABLE_BODY_SELECTOR).getByRole('row', { name: new RegExp(cannedResponseInfo.name) }).getByTestId(COMMON_SELECTORS.dropdownIcon).click();
        await expect(dropDown).toBeVisible({ timeout: 5000 });
        await dropDown.getByRole('button', { name: CANNED_RESPONSE_TEXTS.delete }).click();

        await expect(this.page.getByTestId(ALERT_BOX)).toBeVisible({ timeout: 5000 });
        await this.page.getByTestId(ALERT_BOX).getByTestId(COMMON_BUTTON_SELECTORS.alertSubmitButton).click();
        await expect(this.page.getByTestId(ALERT_BOX)).toBeHidden({ timeout: 10000 });
        await this.neetoPlaywrightUtilities.waitForPageLoad();
        await expect(this.page.locator(TABLE_BODY_SELECTOR).getByRole('row', { name: new RegExp(cannedResponseInfo.name) })).toBeHidden({ timeout: 5000 });
    }
}