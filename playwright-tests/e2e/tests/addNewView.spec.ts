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
    test.beforeEach(() => {
        viewInfo = generateViewInfo();
    });

    test("should create a new view", async ({ page, ticketPage, neetoPlaywrightUtilities }) => {
        test.slow();
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Navigate to settings", async () => {
            await page.getByTestId('settings-nav-tab').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId('main-header')).toContainText('Settings');
        });

        await test.step("Step 3: Navigate to views option", async () => {
            const viewsButton = page.getByTestId('views-settings-option');
            await viewsButton.scrollIntoViewIfNeeded();
            await viewsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Add new view", async () => {
            await test.step("Filling view name and desc", async () => {
                await page.getByTestId('neeto-molecules-header').getByTestId('settings-new-view-button').click();
                await neetoPlaywrightUtilities.waitForPageLoad();
                await page.getByTestId('name-input-field').fill(viewInfo.name);
                await page.getByTestId('views-description-textarea').fill(viewInfo.desc);
            });

            await test.step("Toggling automation rule", async () => {
                if (!viewInfo.active) {
                    await page.getByTestId('active-switch').click();
                    await expect(page.getByTestId('active-switch').locator('[data-testid="close-icon"]')).toBeVisible();
                } else {
                    await expect(page.getByTestId('active-switch').locator('[data-testid="check-icon"]')).toBeVisible();
                }
            });
            await test.step("Setting up conditions", async () => {
                await page.getByTestId('condition-field-dropdown-button').click();
                await expect(page.getByTestId('nui-dropdown-container')).toBeVisible({
                    timeout: 10000,
                });

                await page.getByTestId('nui-dropdown-container').getByTestId(`${viewInfo.condition.field}-menu-item`).click();
                await expect(page.getByTestId('condition-field-dropdown-button')).toContainText((viewInfo.condition.field).toLowerCase(), { timeout: 10000 });

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

                if (viewInfo.condition.value) {
                    await neetoPlaywrightUtilities.selectOptionFromDropdown({
                        selectValueContainer: 'condition-value-multi-select-field',
                        selectMenu: 'nui-dropdown-container',
                        value: (viewInfo.condition.value).toLowerCase(),
                        options: {
                            visibilityTimeout: 5000,
                            textAssertionTimeout: 1000,
                            retryTimeout: 20000
                        },
                    });
                }
            });
            await test.step("Verify add condition button", async () => {
                await page.getByTestId('add-condition-button').click();
                await expect(page.getByTestId('logic-operator-button')).toBeVisible();
            })

            await test.step("Verify delete condition button", async () => {
                await page.getByTestId('delete-condition-button-1').click();
                await expect(page.getByTestId('logic-operator-button')).toBeHidden();
                await expect(page.getByTestId('delete-condition-button-1')).toBeHidden();
            })

            await test.step("Verify preview ", async () => {
                await page.getByTestId('preview-callback-button').click();
                await expect(page.getByTestId('neeto-backdrop')).toBeVisible();
                await expect(page.getByTestId('neeto-backdrop').getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
                await expect(page.getByTestId('modal-header')).toContainText('Matching tickets');
                await page.getByTestId('modal-close-button').click();
            });

            await test.step("Setting sort order ", async () => {
                await page.getByTestId('field-select-value-container').click();
                await page.keyboard.type(viewInfo.sortOrder.field);
                await page.keyboard.press("Enter");
                await expect(page.getByTestId('field-select-value-container')).toContainText(new RegExp(viewInfo.sortOrder.field, 'i'));

                await page.getByTestId('direction-select-value-container').click();
                await page.keyboard.type(viewInfo.sortOrder.direction);
                await page.keyboard.press("Enter");
                await expect(page.getByTestId('direction-select-value-container')).toContainText(new RegExp(viewInfo.sortOrder.direction, 'i'));
            });

            await test.step("Setting availability", () =>
                (viewInfo.availability === "MySelf") ?
                    page.getByTestId('myself-radio-label').click() :
                    page.getByTestId('all-agents-radio-label').click());

            await test.step("Submitting and verifying view in the table", async () => {
                await page.getByTestId('form-submit-button').click();
                await neetoPlaywrightUtilities.waitForPageLoad();
                await expect(page.locator('.ant-table-container')).toBeVisible();
                await expect(page.locator(TABLE_BODY_SELECTOR)
                    .getByRole('row', { name: new RegExp(viewInfo.name, 'i') })).toBeVisible({ timeout: 10000 });
            });
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

        await test.step("Step 6: Teardown view", async () => {
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

    test("should not create a new view without required fields", async ({ page, ticketPage, neetoPlaywrightUtilities, viewPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Navigate to settings", async () => {
            await page.getByTestId('settings-nav-tab').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId('main-header')).toContainText('Settings');
        });

        await test.step("Step 3: Navigate to views option", async () => {
            const viewsButton = page.getByTestId('views-settings-option');
            await viewsButton.scrollIntoViewIfNeeded();
            await viewsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Attempt to add a new view", async () => {
            await page.getByTestId('neeto-molecules-header').getByTestId('settings-new-view-button').click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await viewPage.attemptToCreateNewView({ viewInfo: { ...viewInfo, name: "", sortOrder: { field: "", direction: "" } } });
            await neetoPlaywrightUtilities.waitForPageLoad();
        });

        await expect(page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(viewInfo.name, 'i') })).toBeHidden({ timeout: 10000 });

    })
});