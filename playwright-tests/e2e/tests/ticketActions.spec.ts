import { COMMON_SELECTORS, readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { TicketInfo, generateTicketInfo } from "@constants/utils";
import { COMMON_BUTTON_SELECTORS, COMMON_CLASS_SELECTORS, COMMON_TEXTS, TABLE_BODY_SELECTOR } from "@constants/common";
import { faker } from "@faker-js/faker";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";
import { expect } from "@playwright/test";
import { TICKET_ACTION_BUTTON_SELECTORS } from "@selectors/ticketActions";

test.describe("Ticket actions", () => {
    let user = {}, ticketInfo: TicketInfo;
    test.beforeAll(() => {
        user = readFileSyncIfExists().user;
        ticketInfo = generateTicketInfo({ user });
    });

    test("should spam the newly created ticket", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create a new ticket", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo });
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeVisible();
        });

        await test.step("Step 3: Report the ticket as spam", async () => {
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click();

            await test.step("Verify if shortcut for reporting spam works", async () => {
                await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
                await ticketPage.verifyShortcutActionKey({ key: TICKET_ACTION_BUTTON_SELECTORS.keyToReportSpam, actionTitle: COMMON_TEXTS.reportSpam })
            })

            await ticketPage.performActionFromDropdown({
                selectValueContainer: TICKET_ACTION_BUTTON_SELECTORS.subheaderActionsDropdown,
                selectMenu: COMMON_SELECTORS.dropdownContainer,
                value: COMMON_TEXTS.reportSpam,
                neetoPlaywrightUtilities,
            });

            await neetoPlaywrightUtilities.verifyToast({ closeAfterVerification: false });
            const blockCustomerModal = page.locator(`'${COMMON_CLASS_SELECTORS.dialogBox}'`);
            if (blockCustomerModal.isVisible()) {
                await page.getByTestId(COMMON_SELECTORS.alertModalCrossIcon).click();
            }
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
        });

        await test.step("Step 4: Navigate to spams", () =>
            sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.spamLabel));

        await test.step("Step 4: Navigate to spams", () =>
            ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketInfo, status: "Spam" }, user }));

        await test.step("Step 5: Deleting the newly created ticket", () =>
            ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo, sidebarSection, canDelete: true }));
    });

    test("should block the author of newly created ticket", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        const newEmail = faker.internet.email();
        let ticketInfo2 = generateTicketInfo({ user });

        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create two new tickets with same email", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: { ...ticketInfo, customerEmail: newEmail } });
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeVisible();

            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: { ...ticketInfo2, customerEmail: newEmail } });
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeVisible();
        });

        await test.step("Step 3: Report the ticket as spam", async () => {
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click();

            await test.step("Verify if shortcut for reporting spam works", async () => {
                await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
                await ticketPage.verifyShortcutActionKey({ key: TICKET_ACTION_BUTTON_SELECTORS.keyToReportSpam, actionTitle: COMMON_TEXTS.reportSpam })
            })

            await ticketPage.performActionFromDropdown({
                selectValueContainer: TICKET_ACTION_BUTTON_SELECTORS.subheaderActionsDropdown,
                selectMenu: COMMON_SELECTORS.dropdownContainer,
                value: COMMON_TEXTS.reportSpam,
                neetoPlaywrightUtilities,
            });

            await neetoPlaywrightUtilities.verifyToast({ closeAfterVerification: false });
            const blockCustomerModal = page.locator(`'${COMMON_CLASS_SELECTORS.dialogBox}'`);
            if (blockCustomerModal.isVisible()) {
                await page.getByTestId(COMMON_SELECTORS.alertModalCrossIcon).click();
                await expect(page.getByTestId('modal-header')).toContainText(new RegExp('Block customer', 'i'));
                await page.getByTestId('customer-block-modal-submit-button').click();
                await expect(page.locator('.neeto-ui-btn__spinner')).toBeHidden();
                await page.reload();
            }
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
        });

        await test.step("Step 4: Navigate to spams", () =>
            sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.spamLabel));

        await test.step("Step 5: Verify tickets in spams", async () => {
            await ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketInfo, status: "Spam", customerEmail: newEmail }, user });
            await ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketInfo2, status: "Spam", customerEmail: newEmail }, user })
        })

        await test.step("Step 6: Deleting the newly created ticket", async () => {
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo, sidebarSection, canDelete: true })
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo: ticketInfo2, sidebarSection, canDelete: true });
        })
    });

    test("should move the newly created ticket to trash", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create a new ticket", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo });
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeVisible();
        });

        await test.step("Step 3: Move the ticket to trash", async () => {
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click();

            await test.step("Verify if shortcut for trashing the ticket works", async () => {
                await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
                await ticketPage.verifyShortcutActionKey({ key: TICKET_ACTION_BUTTON_SELECTORS.keyToMoveToTrash, actionTitle: COMMON_TEXTS.moveToTrash })
            })

            await ticketPage.performActionFromDropdown({
                selectValueContainer: TICKET_ACTION_BUTTON_SELECTORS.subheaderActionsDropdown,
                selectMenu: COMMON_SELECTORS.dropdownContainer,
                value: COMMON_TEXTS.moveToTrash,
                neetoPlaywrightUtilities,
            });

            await neetoPlaywrightUtilities.verifyToast({ closeAfterVerification: false });
            await page.reload();
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
        });

        await test.step("Step 4: Navigate to trash", () =>
            sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.trashLabel));

        await test.step("Step 5: Verify details of trashed ticket", () =>
            ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketInfo, status: "Trash" }, user }));

        await test.step("Step 6: Deleting the trashed ticket", async () =>
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo, sidebarSection, canDelete: true }));
    });

})