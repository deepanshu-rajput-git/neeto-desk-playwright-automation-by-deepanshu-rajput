import { COMMON_SELECTORS, NEETO_EDITOR_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { ALERT_BOX, COMMON_BUTTON_SELECTORS, COMMON_CLASS_SELECTORS, COMMON_INPUT_FIELD, COMMON_TEXTS, TABLE_BODY_SELECTOR, THREE_DOTS_SPINNER } from "@constants/common";
import { Page, expect } from "@playwright/test";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";
import { Options, ViewInfo, isValidEmail } from "../constants/utils";

export default class ViewPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    attemptToCreateNewView = async ({ viewInfo }: { viewInfo: ViewInfo }) => {
        const submitButton = this.page.getByTestId('form-submit-button');
        if (!viewInfo.name) {
            await expect(async () => {
                await this.page.getByTestId('name-input-field').fill(viewInfo.name);
                await this.page.getByTestId('description-text-input').click();
                await expect(this.page.getByTestId('name-input-error')).toBeVisible({ timeout: 10000 });
                await submitButton.scrollIntoViewIfNeeded();
                await expect(submitButton).toBeDisabled();
            }).toPass({ timeout: 5000 });
        }

        if (!viewInfo.sortOrder.field) {
            await this.page.getByTestId('field-select-value-container').click();
            await this.page.getByTestId('direction-select-value-container').click();
            await expect(this.page.getByTestId('field-select-error')).toBeVisible({ timeout: 10000 });
        }

        if (!viewInfo.sortOrder.direction) {
            await this.page.getByTestId('field-select-value-container').click();
            await expect(this.page.getByTestId('direction-select-error')).toBeVisible({ timeout: 10000 });
            await expect(submitButton).toBeDisabled();
        }
        await this.page.getByTestId('cancel-button').click();
    }
}