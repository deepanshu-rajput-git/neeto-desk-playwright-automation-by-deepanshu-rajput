import { readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { TicketInfo, ViewInfo, generateTicketInfo, generateViewInfo } from "@constants/utils";
import { COMMON_BUTTON_SELECTORS } from "@constants/common";
import { faker } from "@faker-js/faker";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";
import { expect } from "@playwright/test";

test.describe("Add new View", () => {
    let viewInfo: ViewInfo;
    test.beforeAll(() => {
        viewInfo = generateViewInfo();
    });

    test("should create a new ticket", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Navigate to settings", async () => {
            await page.getByTestId('settings-nav-tab').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId('main-header')).toContainText('Settings');
        });
        await test.step("Step 3: Navigate to views option", async () => {
            await page.getByTestId('views-settings-option').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Add new view", async () => {
            await page.getByTestId('neeto-molecules-header').getByTestId('settings-new-view-button').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await page.getByTestId('name-input-field').fill(viewInfo.name);
            await page.getByTestId('views-description-textarea').fill(viewInfo.desc);
            if (!viewInfo.active) {
                await page.getByTestId('active-switch').click();
            }

            await neetoPlaywrightUtilities.selectOptionFromDropdown({
                selectValueContainer: 'condition-field-dropdown-button',
                selectMenu: 'nui-dropdown-container',
                value: viewInfo.condition.field,
            });

            await neetoPlaywrightUtilities.selectOptionFromDropdown({
                selectValueContainer: 'condition-verb-dropdown-button',
                selectMenu: 'nui-dropdown-container',
                value: viewInfo.condition.field,
            });
        })
    });
})