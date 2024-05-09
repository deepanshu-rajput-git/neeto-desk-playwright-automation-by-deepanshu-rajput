import { COMMON_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { ViewInfo, generateViewInfo } from "@constants/utils";
import { COMMON_BUTTON_SELECTORS, COMMON_CLASS_SELECTORS, COMMON_INPUT_FIELD, TABLE_BODY_SELECTOR } from "@constants/common";
import { TICKET_BUTTON_SELECTORS } from "@selectors/ticket";
import { expect } from "@playwright/test";
import { VIEW_TEXTS } from "@constants/texts/view";
import { VIEW_SELECTORS } from "@selectors/addNewView";

test.describe("Taxonomy page", () => {
    test("should edit a taxonomy", async ({ page, taxonomyPage, neetoPlaywrightUtilities }) => {
        test.slow();
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Navigate to settings", async () => {
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await expect(page.getByTestId(COMMON_BUTTON_SELECTORS.mainHeader)).toContainText(VIEW_TEXTS.settings);
        });

        await test.step("Step 3: Navigate to views option", async () => {
            const viewsButton = page.getByTestId(VIEW_SELECTORS.taxonomySettingsOption);
            await viewsButton.scrollIntoViewIfNeeded();
            await viewsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Editing taxonomy Agent and Group", async () => {
            await expect(page.getByTestId(COMMON_SELECTORS.header)).toContainText(new RegExp('Taxonomy', 'i'));

            await taxonomyPage.editTaxonomy({ defaultValue: "Agent", singularLabel: "Member", pluralLabel: "Members", neetoPlaywrightUtilities });
            await taxonomyPage.editTaxonomy({ defaultValue: "Group", singularLabel: "Team", pluralLabel: "Teams", neetoPlaywrightUtilities });

            await expect(page.getByTestId('agent-nav-tab')).toContainText(new RegExp('Members', 'i'));

            await page.getByTestId('agent-nav-tab').click();
            await neetoPlaywrightUtilities.waitForPageLoad();

            await expect(page.getByTestId('main-header')).toContainText(new RegExp('Members', 'i'));
            await expect(page.getByTestId('ntm-add-member-button')).toContainText(new RegExp('Member', 'i'));

            await page.getByTestId('settings-nav-tab').click();
            await neetoPlaywrightUtilities.waitForPageLoad();

            const groupButton = page.getByTestId('groups-settings-option');
            await expect(groupButton.getByTestId('settings-item-heading')).toContainText(new RegExp('Teams', 'i'));
            await expect(groupButton.getByTestId('settings-item-description')).toContainText(new RegExp('Teams', 'i'));
            await groupButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();

            await expect(page.getByTestId('main-header')).toContainText(new RegExp('Teams', 'i'));
            await expect(page.getByTestId('neeto-molecules-header').getByTestId('add-new-group-button')).toContainText(new RegExp('Team', 'i'));

            await page.getByTestId('taxonomy-sub-link').click();
            await neetoPlaywrightUtilities.waitForPageLoad();

            await test.step("Step 5: Restoring to default", async () => {
                await taxonomyPage.restoreToDefault({ defaultValue: "Agent", neetoPlaywrightUtilities });
                await taxonomyPage.restoreToDefault({ defaultValue: "Group", neetoPlaywrightUtilities });
            });

            await test.step("Assertion of restoring to default", async () => {
                await expect(page.getByTestId('agent-nav-tab')).toContainText(new RegExp('Agents', 'i'));
                await page.getByTestId('settings-nav-tab').click();
                await expect(page.getByTestId('groups-sub-link')).toContainText(new RegExp('Groups', 'i'));
            })
        });
    });
});