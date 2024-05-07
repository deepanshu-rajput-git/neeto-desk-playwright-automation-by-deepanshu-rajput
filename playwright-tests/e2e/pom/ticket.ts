import { COMMON_SELECTORS, NEETO_EDITOR_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { ALERT_BOX, COMMON_BUTTON_SELECTORS, COMMON_INPUT_FIELD, COMMON_TEXTS, TABLE_BODY_SELECTOR } from "@constants/common";
import { Page, expect } from "@playwright/test";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";
import { Options, isValidEmail } from "../constants/utils";

export default class TicketPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    createNewTicket = async ({ neetoPlaywrightUtilities, user, groupName = "--", ticketInfo }) => {
        await this.page.getByTestId(COMMON_BUTTON_SELECTORS.addNewTicketButton).click();
        await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.subjectField).fill(ticketInfo.subject);
        await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.customerEmailField).fill(ticketInfo.customerEmail);
        await neetoPlaywrightUtilities.selectOptionFromDropdown({
            selectValueContainer: TICKET_BUTTON_SELECTORS.groupSelectValueContainer,
            selectMenu: TICKET_BUTTON_SELECTORS.groupSelectMenu,
            value: groupName
        });

        await neetoPlaywrightUtilities.selectOptionFromDropdown({
            selectValueContainer: TICKET_BUTTON_SELECTORS.agentSelectValueContainer,
            selectMenu: TICKET_BUTTON_SELECTORS.agentSelectMenu,
            value: user.currentUserName,
        });

        await this.page.getByTestId(NEETO_EDITOR_SELECTORS.contentField).fill(ticketInfo.desc);

        const selectStatusContainer = this.page.locator(`${TICKET_BUTTON_SELECTORS.statusSelector}[data-cy="${COMMON_SELECTORS.selectValueContainer}"]`);
        await expect(async () => {
            await selectCategoryContainer.click();
            await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownMenu)).toBeVisible({
                timeout: 9000,
            });
            await this.page.getByTestId(COMMON_SELECTORS.dropdownMenu).getByText(ticketInfo.category).click();
            await expect(selectCategoryContainer).toContainText(ticketInfo.category, { timeout: 10000 });
        }).toPass({ timeout: 20000 });

        const selectPriorityContainer = this.page.locator(`${TICKET_BUTTON_SELECTORS.prioritySelector}[data-cy="${COMMON_SELECTORS.selectValueContainer}"]`);
        await expect(async () => {
            await selectPriorityContainer.click();
            await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownMenu)).toBeVisible({
                timeout: 9000,
            });
            await this.page.getByTestId(COMMON_SELECTORS.dropdownMenu).getByText(ticketInfo.category).click();
            await expect(selectPriorityContainer).toContainText(ticketInfo.category, { timeout: 10000 });
        }).toPass({ timeout: 20000 });

        const selectCategoryContainer = this.page.locator(`${TICKET_BUTTON_SELECTORS.categorySelector}[data-cy="${COMMON_SELECTORS.selectValueContainer}"]`);
        await expect(async () => {
            await selectCategoryContainer.click();
            await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownMenu)).toBeVisible({
                timeout: 9000,
            });
            await this.page.getByTestId(COMMON_SELECTORS.dropdownMenu).getByText(ticketInfo.category).click();
            await expect(selectCategoryContainer).toContainText(ticketInfo.category, { timeout: 10000 });
        }).toPass({ timeout: 20000 });

        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.spinner)).toBeHidden();
        await expect(this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }))
            .toBeVisible();
    }

    attemptToCreateNewTicket = async ({ ticketInfo, agent }) => {
        await this.page.getByTestId(COMMON_BUTTON_SELECTORS.addNewTicketButton).click();
        if (!ticketInfo.subject) {
            await expect(async () => {
                await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.subjectField).fill(ticketInfo.subject);
                await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.customerEmailField).click();
                await expect(this.page.getByTestId('subject-input-error')).toBeVisible();
            }).toPass({ timeout: 3000 });
        }

        if (!isValidEmail(ticketInfo.customerEmail)) {
            await expect(async () => {
                await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.customerEmailField).fill(ticketInfo.customerEmail);
                await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
                await expect(this.page.getByTestId('customer-email-input-error')).toBeVisible();
            }).toPass({ timeout: 3000 });
        }
        if (!agent.currentUserName) {
            await this.page.getByTestId(TICKET_BUTTON_SELECTORS.agentSelectValueContainer).click();
            await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.subjectField).click();
            await expect(this.page.getByTestId('agent-select-error')).toBeVisible();
        }

        if (!ticketInfo.desc) {
            await expect(async () => {
                await this.page.getByTestId(NEETO_EDITOR_SELECTORS.contentField).fill(ticketInfo.desc);
                await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.subjectField).click();
                await expect(this.page.getByTestId('neeto-editor-error-text')).toBeVisible();
            }).toPass({ timeout: 3000 });
        }
    }

    performActionFromDropdown = async ({ neetoPlaywrightUtilities, selectValueContainer, selectMenu, value, options = {} }: {
        neetoPlaywrightUtilities,
        selectValueContainer: string;
        selectMenu: string;
        value: string;
        options?: Options;
    }) => {
        const mergedOptions: Options = {
            visibilityTimeout: 2000,
            textAssertionTimeout: 1000,
            retryTimeout: 20000,
            ...options,
        };

        await expect(async () => {
            await this.page.getByTestId(selectValueContainer).click();
            await expect(this.page.getByTestId(selectMenu)).toBeVisible({
                timeout: mergedOptions.visibilityTimeout,
            });
            await this.page.getByTestId(selectMenu).getByText(value).click();
            const alertModal = this.page.getByTestId(ALERT_BOX);
            await expect(alertModal).toBeVisible({ timeout: mergedOptions.textAssertionTimeout });
            await alertModal.getByTestId(COMMON_BUTTON_SELECTORS.alertSubmitButton).click();
            await neetoPlaywrightUtilities.verifySuccessToast({ closeAfterVerification: false });
        }).toPass({ timeout: mergedOptions.retryTimeout });
    };

    moveTicketToTrash = async ({ neetoPlaywrightUtilities, ticketInfo }) => {
        await this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).locator(COMMON_INPUT_FIELD.checkBoxInput).click();

        await this.performActionFromDropdown({
            selectValueContainer: COMMON_BUTTON_SELECTORS.takeActionDropdown,
            selectMenu: COMMON_BUTTON_SELECTORS.takeActionDropdownContainer,
            value: COMMON_TEXTS.moveToTrash,
            neetoPlaywrightUtilities,
        });

        await expect(this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeHidden();
    }

    deleteTicket = async ({ neetoPlaywrightUtilities, ticketInfo }) => {
        await this.moveTicketToTrash({ neetoPlaywrightUtilities, ticketInfo });
        await this.page.getByTestId(TICKET_BUTTON_SELECTORS.trashSubLink).click();
        await this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).locator(COMMON_INPUT_FIELD.checkBoxInput).click();

        await this.performActionFromDropdown({
            selectValueContainer: COMMON_BUTTON_SELECTORS.takeActionDropdown,
            selectMenu: COMMON_BUTTON_SELECTORS.takeActionDropdownContainer,
            value: COMMON_TEXTS.deleteForever,
            neetoPlaywrightUtilities
        });

        await expect(this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeHidden();
    }

    verifyCustomTextEditor = async ({ neetoPLaywrightUtilities, someText }) => {
        await this.page.getByTestId('neeto-editor-fixed-menu-bold-option').click();

    }

}