import { COMMON_SELECTORS, getByDataQA, readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { TicketInfo, ViewInfo, generateTicketInfo, generateViewInfo } from "@constants/utils";
import { COMMON_BUTTON_SELECTORS, COMMON_INPUT_FIELD, COMMON_TEXTS, TABLE_BODY_SELECTOR } from "@constants/common";
import { faker } from "@faker-js/faker";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";
import { expect } from "@playwright/test";
import { VIEW_TEXTS } from "@constants/texts/view";
import TicketPage from "pom/ticket";

test.describe("Add new View", () => {
    let viewInfo: ViewInfo;
    test.beforeAll(() => {
        viewInfo = generateViewInfo();
    });


    test("should create a new ticket", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        test.slow();
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

            await page.getByTestId('condition-field-dropdown-button').click();
            await expect(page.getByTestId('nui-dropdown-container')).toBeVisible({
                timeout: 10000,
            });
            await page.getByTestId('nui-dropdown-container').getByTestId(`${viewInfo.condition.field}-menu-item`).click();
            await expect(page.getByTestId('condition-field-dropdown-button')).toContainText((viewInfo.condition.field).toLowerCase(), { timeout: 10000 });

            // await neetoPlaywrightUtilities.selectOptionFromDropdown({
            //     selectValueContainer: 'condition-field-dropdown-button',
            //     selectMenu: 'nui-dropdown-container',
            //     value: viewInfo.condition.field,
            // });

            await neetoPlaywrightUtilities.selectOptionFromDropdown({
                selectValueContainer: 'condition-verb-dropdown-button',
                selectMenu: 'nui-dropdown-container',
                value: (viewInfo.condition.verb).toLowerCase(),
                options: {
                    visibilityTimeout: 5000,
                    textAssertionTimeout: 1000,
                    retryTimeout: 20000
                },
            });

            await page.getByTestId('preview-callback-button').click();
            await expect(page.getByTestId('neeto-backdrop')).toBeVisible();
            await expect(page.getByTestId('neeto-backdrop').getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
            await page.getByTestId('modal-close-button').click();

            await page.getByTestId('field-select-value-container').click();
            await page.keyboard.type(viewInfo.sortOrder.field);
            await page.keyboard.press("Enter");
            await expect(page.getByTestId('field-select-value-container')).toContainText(new RegExp(viewInfo.sortOrder.field, 'i'));

            await page.getByTestId('direction-select-value-container').click();
            await page.keyboard.type(viewInfo.sortOrder.direction);
            await page.keyboard.press("Enter");
            await expect(page.getByTestId('direction-select-value-container')).toContainText(new RegExp(viewInfo.sortOrder.direction, 'i'));

            if (viewInfo.availability === "MySelf") {
                await page.getByTestId('myself-radio-label').click();
            } else {
                await page.getByTestId('all-agents-radio-label').click();
            }
            await page.getByTestId('form-submit-button').click();

            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.locator('.ant-table-container')).toBeVisible();
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(viewInfo.name, 'i') })).toBeVisible({ timeout: 10000 });

        });
        await test.step("Step 5: Asserting the visibility of new view in tickets", async () => {
            await page.getByTestId('settings-nav-tab').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await page.getByTestId('tickets-nav-tab').click();
            const newViewButton = page.getByTestId(`${(viewInfo.name).toLowerCase()}-sub-link`);
            await expect(newViewButton).toBeVisible();
            await newViewButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId('main-header')).toBeVisible();
        });

        await test.step("Teardown view", async () => {
            await page.getByTestId('settings-nav-tab').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId('main-header')).toContainText('Settings');
            await page.getByTestId('views-settings-option').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden({ timeout: 10000 });
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(viewInfo.name, 'i') }).locator(COMMON_INPUT_FIELD.checkBoxInput).click();

            await ticketPage.performActionFromDropdown({
                selectValueContainer: COMMON_BUTTON_SELECTORS.takeActionDropdown,
                selectMenu: COMMON_BUTTON_SELECTORS.takeActionDropdownContainer,
                value: VIEW_TEXTS.deactivate,
                neetoPlaywrightUtilities,
            });

            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(viewInfo.name, 'i') })).toBeHidden({ timeout: 10000 });

            await page.getByTestId('disabled-block').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(viewInfo.name, 'i') }).locator(COMMON_INPUT_FIELD.checkBoxInput).click();

            await ticketPage.performActionFromDropdown({
                selectValueContainer: COMMON_BUTTON_SELECTORS.takeActionDropdown,
                selectMenu: COMMON_BUTTON_SELECTORS.takeActionDropdownContainer,
                value: VIEW_TEXTS.delete,
                neetoPlaywrightUtilities,
            });

            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(viewInfo.name, 'i') })).toBeHidden({ timeout: 10000 });
        })
    });
})