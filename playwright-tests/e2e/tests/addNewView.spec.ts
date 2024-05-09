import { COMMON_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { ViewInfo, generateViewInfo } from "@constants/utils";
import { COMMON_BUTTON_SELECTORS, COMMON_CLASS_SELECTORS, COMMON_INPUT_FIELD, TABLE_BODY_SELECTOR } from "@constants/common";
import { TICKET_BUTTON_SELECTORS } from "@selectors/ticket";
import { expect } from "@playwright/test";
import { VIEW_TEXTS } from "@constants/texts/view";
import { VIEW_SELECTORS } from "@selectors/addNewView";

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
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId(COMMON_BUTTON_SELECTORS.mainHeader)).toContainText(VIEW_TEXTS.settings);
        });

        await test.step("Step 3: Navigate to views option", async () => {
            const viewsButton = page.getByTestId(VIEW_SELECTORS.viewsSettingsOption);
            await viewsButton.scrollIntoViewIfNeeded();
            await viewsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Add new view", async () => {
            await test.step("Filling view name and desc", async () => {
                await page.getByTestId(COMMON_SELECTORS.header).getByTestId(VIEW_SELECTORS.settingsNewView).click();
                await neetoPlaywrightUtilities.waitForPageLoad();
                await page.getByTestId(VIEW_SELECTORS.nameField).fill(viewInfo.name);
                await page.getByTestId(VIEW_SELECTORS.viewsDescText).fill(viewInfo.desc);
            });

            await test.step("Toggling automation rule", async () => {
                const toggleButton = page.getByTestId(VIEW_SELECTORS.activeSwitch);
                if (!viewInfo.active) {
                    await toggleButton.click();
                    await expect(toggleButton.locator(VIEW_SELECTORS.closeIcon)).toBeVisible();
                } else {
                    await expect(toggleButton.locator(VIEW_SELECTORS.checkIcon)).toBeVisible();
                }
            });
            await test.step("Setting up conditions", async () => {
                await page.getByTestId(VIEW_SELECTORS.conditionFieldDropdownButton).click();
                await expect(page.getByTestId(COMMON_SELECTORS.dropdownContainer)).toBeVisible({
                    timeout: 10000,
                });

                await page.getByTestId(COMMON_SELECTORS.dropdownContainer).getByTestId(`${viewInfo.condition.field}-menu-item`).click();
                await expect(page.getByTestId(VIEW_SELECTORS.conditionFieldDropdownButton)).toContainText((viewInfo.condition.field).toLowerCase(), { timeout: 10000 });

                await neetoPlaywrightUtilities.selectOptionFromDropdown({
                    selectValueContainer: VIEW_SELECTORS.conditionVerbDropdown,
                    selectMenu: COMMON_SELECTORS.dropdownContainer,
                    value: (viewInfo.condition.verb).toLowerCase(),
                    options: {
                        visibilityTimeout: 5000,
                        textAssertionTimeout: 1000,
                        retryTimeout: 20000
                    },
                });

                if (viewInfo.condition.value) {
                    await neetoPlaywrightUtilities.selectOptionFromDropdown({
                        selectValueContainer: VIEW_SELECTORS.conditionValueMultiSelect,
                        selectMenu: COMMON_SELECTORS.dropdownContainer,
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
                await page.getByTestId(VIEW_SELECTORS.addConditionButton).click();
                await expect(page.getByTestId(VIEW_SELECTORS.logicOperatorButton)).toBeVisible();
            })

            await test.step("Verify delete condition button", async () => {
                await page.getByTestId(VIEW_SELECTORS.deleteConditionButton).click();
                await expect(page.getByTestId(VIEW_SELECTORS.logicOperatorButton)).toBeHidden();
                await expect(page.getByTestId(VIEW_SELECTORS.deleteConditionButton)).toBeHidden();
            })

            await test.step("Verify preview ", async () => {
                await page.getByTestId(VIEW_SELECTORS.previewCallbackButton).click();
                await expect(page.getByTestId(COMMON_SELECTORS.backdrop)).toBeVisible();
                await expect(page.getByTestId(COMMON_SELECTORS.backdrop).getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
                await expect(page.getByTestId(COMMON_SELECTORS.modalHeader)).toContainText('Matching tickets');
                await page.getByTestId(COMMON_SELECTORS.alertModalCrossIcon).click();
            });

            await test.step("Setting sort order ", async () => {
                await page.getByTestId(VIEW_SELECTORS.fieldSelectValueContainer).click();
                await page.keyboard.type(viewInfo.sortOrder.field);
                await page.keyboard.press("Enter");
                await expect(page.getByTestId(VIEW_SELECTORS.fieldSelectValueContainer)).toContainText(new RegExp(viewInfo.sortOrder.field, 'i'));

                await page.getByTestId(VIEW_SELECTORS.directionSelectValueContainer).click();
                await page.keyboard.type(viewInfo.sortOrder.direction);
                await page.keyboard.press("Enter");
                await expect(page.getByTestId(VIEW_SELECTORS.directionSelectValueContainer)).toContainText(new RegExp(viewInfo.sortOrder.direction, 'i'));
            });

            await test.step("Setting availability", () =>
                (viewInfo.availability === "MySelf") ?
                    page.getByTestId(VIEW_SELECTORS.myselfRadioLabel).click() :
                    page.getByTestId(VIEW_SELECTORS.allAgentsRadioLabel).click());

            await test.step("Submitting and verifying view in the table", async () => {
                await page.getByTestId(COMMON_BUTTON_SELECTORS.formSubmitButton).click();
                await neetoPlaywrightUtilities.waitForPageLoad();
                await expect(page.locator(COMMON_CLASS_SELECTORS.tableContainer)).toBeVisible();
                await expect(page.locator(TABLE_BODY_SELECTOR)
                    .getByRole('row', { name: new RegExp(viewInfo.name, 'i') })).toBeVisible({ timeout: 10000 });
            });
        });

        await test.step("Step 5: Asserting the visibility of new view in tickets", async () => {
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await page.getByTestId(TICKET_BUTTON_SELECTORS.ticketsNavTab).click();
            const newViewButton = page.getByTestId(`${(viewInfo.name).toLowerCase()}-sub-link`);
            await expect(newViewButton).toBeVisible();
            await newViewButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId(COMMON_SELECTORS.heading)).toBeVisible();
        });

        await test.step("Step 6: Teardown view", async () => {
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId(COMMON_SELECTORS.heading)).toContainText(VIEW_TEXTS.settings);
            await page.getByTestId(VIEW_SELECTORS.viewsSettingsOption).click();
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

            await page.getByTestId(VIEW_SELECTORS.disabledBlock).click();
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
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId(COMMON_SELECTORS.heading)).toContainText(VIEW_TEXTS.settings);
        });

        await test.step("Step 3: Navigate to views option", async () => {
            const viewsButton = page.getByTestId(VIEW_SELECTORS.viewsSettingsOption);
            await viewsButton.scrollIntoViewIfNeeded();
            await viewsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Attempt to add a new view", async () => {
            await page.getByTestId(COMMON_SELECTORS.header).getByTestId(VIEW_SELECTORS.settingsNewView).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await viewPage.attemptToCreateNewView({ viewInfo: { ...viewInfo, name: "", sortOrder: { field: "", direction: "" } } });
            await neetoPlaywrightUtilities.waitForPageLoad();
        });

        await expect(page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(viewInfo.name, 'i') })).toBeHidden({ timeout: 10000 });

    })
});