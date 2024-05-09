import { COMMON_SELECTORS } from "@bigbinary/neeto-playwright-commons";
import { readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { COMMON_BUTTON_SELECTORS, TABLE_BODY_SELECTOR } from "@constants/common";
import { expect } from "@playwright/test";
import { VIEW_TEXTS } from "@constants/texts/view";
import { VIEW_SELECTORS } from "@selectors/addNewView";
import { TicketInfo, generateTicketInfo } from "@constants/utils";


test.describe("Canned Responses", () => {
    let user = {}, ticketInfo: TicketInfo;
    test.beforeAll(() => {
        user = readFileSyncIfExists().user;
        ticketInfo = generateTicketInfo({ user });
    });

    test("should be available to reply ", async ({ page, cannedResponse, ticketPage, neetoPlaywrightUtilities }) => {
        test.slow();
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Navigate to settings", async () => {
            await page.getByTestId(VIEW_SELECTORS.settingsNavTab).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
            await cannedResponse.verifyText({
                container: COMMON_BUTTON_SELECTORS.mainHeader,
                text: VIEW_TEXTS.settings
            })
        });

        await test.step("Step 3: Navigate to Canned Response settings option", async () => {
            const viewsButton = page.getByTestId(VIEW_SELECTORS.taxonomySettingsOption);
            await viewsButton.scrollIntoViewIfNeeded();
            await viewsButton.click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        })

        await test.step("Step 4: Creating a new canned response", async () => {
            await cannedResponse.verifyText({
                container: COMMON_SELECTORS.heading,
                text: "Canned responses"
            });

            await cannedResponse.createCannedResponse({ neetoPlaywrightUtilities });

            await page.getByTestId(COMMON_BUTTON_SELECTORS.navTabLink('settings')).click();
            await neetoPlaywrightUtilities.waitForPageLoad();

            await page.getByTestId(COMMON_BUTTON_SELECTORS.navTabLink('tickets')).click();
            await neetoPlaywrightUtilities.waitForPageLoad();
        });
        await test.step("Step 5: Create a new ticket", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo });

            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })
                .getByTestId('tickets-subject-button').click();
        });

        await page.getByTestId('ticket-details-subheader-reply-button').click();
        await expect(page.getByTestId('reply-container')).toBeVisible();
        await page.getByTestId('neeto-editor-fixed-menu-canned-responses-option').click();
        await expect(page.getByTestId(COMMON_SELECTORS.paneBody)).toBeVisible({ timeout: 5000 });

        await neetoPlaywrightUtilities.selectOptionFromDropdown({
            selectValueContainer: 'select-a-canned-response-select-value-container',
            selectMenu: 'select-a-canned-response-select-menu',
            value: 'Glad it is solved'
        });

        await page.getByTestId('apply-button').click();
        await expect(page.getByTestId(COMMON_SELECTORS.paneBody)).toBeHidden({ timeout: 5000 });
        await neetoPlaywrightUtilities.waitForPageLoad();

        await expect(page.getByTestId('neeto-editor-content').getByRole('paragraph', { name: new RegExp("Desc", 'i') })).toBeVisible();
        await page.getByTestId('send-reply-button').click();
        await neetoPlaywrightUtilities.waitForPageLoad();
    })
});