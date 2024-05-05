import { COMMON_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { Page, expect } from "@playwright/test";

export default class TicketPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    createNewTicket = async ({ neetoPlaywrightUtilities }) => {
        await this.page.getByTestId('add-new-ticket-button').click();
        await this.page.getByTestId('tickets-subject-text-field').fill('Deepanshu ticket');
        await this.page.getByTestId('tickets-customer-email-text-field').fill('oliver@example.com');
        await neetoPlaywrightUtilities.selectOptionFromDropdown({
            selectValueContainer: 'group-select-value-container',
            selectMenu: 'groupt-select-menu',
            value: '--'
        });

        await neetoPlaywrightUtilities.selectOptionFromDropdown({
            selectValueContainer: 'agent-select-value-container',
            selectMenu: 'agent-select-menu',
            value: 'Deepanshu Rajput'
        });

        await this.page.getByTestId('neeto-editor-content').fill('Description');

        await neetoPlaywrightUtilities.selectOptionFromDropdown({
            selectValueContainer: 'nui-select-value-container',
            selectMenu: 'nui-select-menu',
            value: 'Feature request'
        });

        await expect(this.page.getByTestId(COMMON_SELECTORS.spinner)).toBeHidden();
        await expect(this.page.locator('ant-table-container').getByRole('button', { name: 'Deepanshu ticket' })).toBeVisible();
    }
}