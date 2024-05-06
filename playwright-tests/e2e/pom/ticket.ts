import { COMMON_SELECTORS, NEETO_EDITOR_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { COMMON_BUTTON_SELECTORS, TABLE_BODY_SELECTOR } from "@constants/common";
import { Page, expect } from "@playwright/test";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";

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
        const selectContainer = this.page.locator(`${TICKET_BUTTON_SELECTORS.categorySelector}[data-cy="${COMMON_SELECTORS.selectValueContainer}"]`);
        await expect(async () => {
            await selectContainer.click();
            await expect(this.page.getByTestId(COMMON_SELECTORS.dropdownMenu)).toBeVisible({
                timeout: 9000,
            });
            await this.page.getByTestId(COMMON_SELECTORS.dropdownMenu).getByText(ticketInfo.category).click();
            await expect(selectContainer).toContainText(ticketInfo.category, { timeout: 10000 });
        }).toPass({ timeout: 20000 });

        await this.page.getByTestId(COMMON_SELECTORS.saveChangesButton).click();
        await expect(this.page.getByTestId(COMMON_SELECTORS.spinner)).toBeHidden();
        await expect(this.page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }))
            .toBeVisible();
    }
}