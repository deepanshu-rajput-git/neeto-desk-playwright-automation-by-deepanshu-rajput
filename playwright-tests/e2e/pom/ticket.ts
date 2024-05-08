import { COMMON_SELECTORS, NEETO_EDITOR_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { ALERT_BOX, COMMON_BUTTON_SELECTORS, COMMON_CLASS_SELECTORS, COMMON_INPUT_FIELD, COMMON_TEXTS, TABLE_BODY_SELECTOR, THREE_DOTS_SPINNER } from "@constants/common";
import { Page, expect } from "@playwright/test";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";
import { Options, isValidEmail } from "../constants/utils";

export default class TicketPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async selectOptionFromDropdown({
        containerSelector,
        value,
    }) {
        const selectContainer = this.page.locator(`${containerSelector}[data-cy="${COMMON_SELECTORS.selectValueContainer}"]`);
        await expect(async () => {
            await selectContainer.click();
            await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownMenu)).toBeVisible({
                timeout: 9000,
            });
            await this.page.getByTestId(COMMON_SELECTORS.dropdownMenu).getByText(value).click();
            await expect(selectContainer).toContainText(value, { timeout: 10000 });
        }).toPass({ timeout: 20000 });
    }

    verifyTicketInDifferentTables = async ({ subject, labels, sidebarSection }) => {
        await this.page.goto('/');
        for (const label of labels) {
            await sidebarSection.clickOnSubLink(label);
            await expect(this.page.locator(THREE_DOTS_SPINNER)).toBeHidden({ timeout: 10000 });
            await expect(this.page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(subject, 'i') }))
                .toBeVisible({ timeout: 10000 });
        }
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

        await this.selectOptionFromDropdown({
            containerSelector: TICKET_BUTTON_SELECTORS.statusSelector,
            value: ticketInfo.status
        });

        await this.selectOptionFromDropdown({
            containerSelector: TICKET_BUTTON_SELECTORS.prioritySelector,
            value: ticketInfo.priority
        });

        await this.selectOptionFromDropdown({
            containerSelector: TICKET_BUTTON_SELECTORS.categorySelector,
            value: ticketInfo.category
        });

        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden({ timeout: 10000 });
    }

    verifyDetailsOfTicket = ({ ticketInfo, user }) =>
        Promise.all([
            expect(this.page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeVisible({ timeout: 5000 }),
            expect(this.page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).locator(COMMON_CLASS_SELECTORS.capitalize)).toContainText(ticketInfo.priority, { timeout: 5000 }),

            expect(this.page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).locator(COMMON_CLASS_SELECTORS.truncate)).toContainText(ticketInfo.category, { timeout: 5000 }),

            expect(this.page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketStatusDropdown)).toContainText(ticketInfo.status, { timeout: 5000 }),

            expect(this.page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).locator(COMMON_CLASS_SELECTORS.inline).getByRole('button')).toContainText(new RegExp((user.firstName).slice(0, 5), 'i'), { timeout: 5000 }),
        ]);

    attemptToCreateNewTicket = async ({ subject, customerEmail, agentName, desc }) => {
        await this.page.getByTestId(COMMON_BUTTON_SELECTORS.addNewTicketButton).click();
        if (!subject) {
            await expect(async () => {
                await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.subjectField).fill(subject);
                await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.customerEmailField).click();
                await expect(this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.subjectInputError)).toBeVisible({ timeout: 10000 });
                await expect(this.page.getByTestId(COMMON_SELECTORS.saveChangesButton)).toBeDisabled();
            }).toPass({ timeout: 5000 });
        }

        if (!isValidEmail(customerEmail)) {
            await expect(async () => {
                await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.customerEmailField).fill(customerEmail);
                await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
                await expect(this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.customerEmailInputError)).toBeVisible({ timeout: 10000 });
            }).toPass({ timeout: 5000 });
        }

        if (!agentName) {
            await this.page.getByTestId(TICKET_BUTTON_SELECTORS.agentSelectValueContainer).click();
            await this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.subjectField).click();
            await expect(this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.agentSelectError)).toBeVisible({ timeout: 10000 });
        }

        if (!desc) {
            await expect(async () => {
                await this.page.getByTestId(NEETO_EDITOR_SELECTORS.contentField).fill(desc);
                const saveButton = this.page.getByTestId(COMMON_SELECTORS.saveChangesButton);
                await saveButton.scrollIntoViewIfNeeded();
                await saveButton.click();
                await expect(this.page.getByTestId(TICKET_INPUT_FIELD_SELECTORS.neetoEditorError)).toBeVisible({ timeout: 10000 });
            }).toPass({ timeout: 5000 });
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
        await expect(this.page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden({ timeout: 10000 });
        await this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).locator(COMMON_INPUT_FIELD.checkBoxInput).click();

        await this.performActionFromDropdown({
            selectValueContainer: COMMON_BUTTON_SELECTORS.takeActionDropdown,
            selectMenu: COMMON_BUTTON_SELECTORS.takeActionDropdownContainer,
            value: COMMON_TEXTS.moveToTrash,
            neetoPlaywrightUtilities,
        });

        await expect(this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeHidden({ timeout: 10000 });
    }

    deleteTicket = async ({ neetoPlaywrightUtilities, ticketInfo, sidebarSection, canDelete = false }) => {
        if (!canDelete) {
            await this.moveTicketToTrash({ neetoPlaywrightUtilities, ticketInfo });
            await sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.trashLabel);
            await expect(this.page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden({ timeout: 10000 });
        }
        await this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).locator(COMMON_INPUT_FIELD.checkBoxInput).click();

        await this.performActionFromDropdown({
            selectValueContainer: COMMON_BUTTON_SELECTORS.takeActionDropdown,
            selectMenu: COMMON_BUTTON_SELECTORS.takeActionDropdownContainer,
            value: COMMON_TEXTS.deleteForever,
            neetoPlaywrightUtilities
        });

        await expect(this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeHidden({ timeout: 10000 });
    }

    // should be used on ticket details page only
    verifyShortcutActionKey = async ({ key, actionTitle }: { key: string, actionTitle: string }) => {
        await this.page.keyboard.press(key);
        await expect(this.page.getByTestId(ALERT_BOX)).toBeVisible({ timeout: 10000 });
        await expect(this.page.getByTestId(COMMON_SELECTORS.alertTitle)).toContainText(new RegExp(actionTitle, 'i'));
        await this.page.getByTestId(COMMON_SELECTORS.alertModalCrossIcon).click();
    }
}