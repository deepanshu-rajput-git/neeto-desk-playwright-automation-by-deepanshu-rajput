import { COMMON_SELECTORS, MEMBER_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { COMMON_BUTTON_SELECTORS } from "@constants/common";
import { expect } from "@playwright/test";
import { VIEW_TEXTS } from "@constants/texts/view";
import { VIEW_SELECTORS } from "@selectors/addNewView";
import { TAXONOMY_TEXTS } from "@constants/texts/taxonomy";
import { TAXONOMY_BUTTON_SELECTORS } from "@selectors/taxonomy";

const taxonomies = [
    {
        defaultValue: TAXONOMY_TEXTS.agent,
        singularLabel: TAXONOMY_TEXTS.member,
        pluralLabel: TAXONOMY_TEXTS.members
    },
    {
        defaultValue: TAXONOMY_TEXTS.group,
        singularLabel: TAXONOMY_TEXTS.team,
        pluralLabel: TAXONOMY_TEXTS.teams
    }
];

test.describe("Taxonomy page", () => {
    test("should edit a taxonomy", async ({ page, taxonomyPage, neetoPlaywrightUtilities }) => {
        test.slow();
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Navigate to settings", async () => {
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await taxonomyPage.verifyText({
                container: COMMON_BUTTON_SELECTORS.mainHeader,
                text: VIEW_TEXTS.settings
            })
        });

        await test.step("Step 3: Navigate to Taxonomy settings option", async () => {
            const viewsButton = page.getByTestId(VIEW_SELECTORS.taxonomySettingsOption);
            await viewsButton.scrollIntoViewIfNeeded();
            await viewsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Editing taxonomy Agent and Group", async () => {
            await taxonomyPage.verifyText({
                container: COMMON_SELECTORS.heading,
                text: TAXONOMY_TEXTS.taxonomy
            });

            for (const { defaultValue, singularLabel, pluralLabel } of taxonomies) {
                await taxonomyPage.editTaxonomy({
                    defaultValue,
                    singularLabel,
                    pluralLabel,
                    neetoPlaywrightUtilities
                });
            }
        });

        await test.step("Step 5: Asserting taxonomy - Agent", async () => {
            await taxonomyPage.verifyText({
                container: COMMON_BUTTON_SELECTORS.navTabLink('agent'),
                text: TAXONOMY_TEXTS.members
            });
            await page.getByTestId(COMMON_BUTTON_SELECTORS.navTabLink('agent')).click();
            await neetoPlaywrightUtilities.waitForPageLoad();

            await taxonomyPage.verifyText({
                container: COMMON_SELECTORS.heading,
                text: TAXONOMY_TEXTS.members
            });
            await taxonomyPage.verifyText({
                container: MEMBER_SELECTORS.newButton,
                text: TAXONOMY_TEXTS.member
            });
        });

        await test.step("Step 4: Asserting taxonomy - Group", async () => {
            await page.getByTestId(COMMON_BUTTON_SELECTORS.navTabLink('settings')).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            const groupButton = page.getByTestId(TAXONOMY_BUTTON_SELECTORS.groupsSettingOption);

            await Promise.all([
                expect(groupButton.getByTestId(TAXONOMY_BUTTON_SELECTORS.settingsItemHeading))
                    .toContainText(new RegExp(TAXONOMY_TEXTS.teams, 'i')),
                expect(groupButton.getByTestId(TAXONOMY_BUTTON_SELECTORS.settingsItemDesc))
                    .toContainText(new RegExp(TAXONOMY_TEXTS.teams, 'i'))
            ])

            await groupButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await taxonomyPage.verifyText({
                container: COMMON_SELECTORS.heading,
                text: TAXONOMY_TEXTS.teams
            });
            await expect(page.getByTestId(COMMON_SELECTORS.header)
                .getByTestId(TAXONOMY_BUTTON_SELECTORS.addNewGroupButton))
                .toContainText(new RegExp(TAXONOMY_TEXTS.team, 'i'));
        });

        await test.step("Step 6: Resetting to default", async () => {
            await page.getByTestId(COMMON_SELECTORS.sidebarSubLink('taxonomy')).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            for (const { defaultValue } of taxonomies) {
                await taxonomyPage.restoreToDefault({ defaultValue, neetoPlaywrightUtilities });
            }
        });

        await test.step("Step 7: Assertion of restoring to default", async () => {
            await taxonomyPage.verifyText({
                container: COMMON_BUTTON_SELECTORS.navTabLink('agent'),
                text: TAXONOMY_TEXTS.agents
            });
            await page.getByTestId(TAXONOMY_BUTTON_SELECTORS.settingsNavTab).click();
            await taxonomyPage.verifyText({
                container: COMMON_SELECTORS.sidebarSubLink('groups'),
                text: TAXONOMY_TEXTS.groups
            });
        })
    });
});