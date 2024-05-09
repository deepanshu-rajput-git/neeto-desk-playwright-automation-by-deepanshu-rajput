import { COMMON_BUTTON_SELECTORS } from "@constants/common";
import { Page, expect } from "@playwright/test";
import { ViewInfo } from "../constants/utils";
import { VIEW_SELECTORS } from "@selectors/addNewView";

export default class ViewPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    attemptToCreateNewView = async ({ viewInfo }: { viewInfo: ViewInfo }) => {
        const submitButton = this.page.getByTestId(COMMON_BUTTON_SELECTORS.formSubmitButton);
        if (!viewInfo.name) {
            await expect(async () => {
                await this.page.getByTestId(VIEW_SELECTORS.nameField).fill(viewInfo.name);
                await this.page.getByTestId(VIEW_SELECTORS.descTextInput).click();
                await expect(this.page.getByTestId(VIEW_SELECTORS.nameInputEror)).toBeVisible({ timeout: 10000 });
                await submitButton.scrollIntoViewIfNeeded();
                await expect(submitButton).toBeDisabled();
            }).toPass({ timeout: 5000 });
        }

        if (!viewInfo.sortOrder.field) {
            await this.page.getByTestId(VIEW_SELECTORS.fieldSelectValueContainer).click();
            await this.page.getByTestId(VIEW_SELECTORS.directionSelectValueContainer).click();
            await expect(this.page.getByTestId(VIEW_SELECTORS.fieldSelectError)).toBeVisible({ timeout: 10000 });
        }

        if (!viewInfo.sortOrder.direction) {
            await this.page.getByTestId(VIEW_SELECTORS.fieldSelectValueContainer).click();
            await expect(this.page.getByTestId(VIEW_SELECTORS.directionSelectError)).toBeVisible({ timeout: 10000 });
            await expect(submitButton).toBeDisabled();
        }
        await this.page.getByTestId(COMMON_BUTTON_SELECTORS.cancelButton).click();
    }
}