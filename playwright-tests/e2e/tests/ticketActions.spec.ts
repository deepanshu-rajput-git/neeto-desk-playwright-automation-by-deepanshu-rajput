import { COMMON_SELECTORS, readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { TicketInfo, generateTicketInfo } from "@constants/utils";
import { BUTTON_SPINNER, COMMON_BUTTON_SELECTORS, COMMON_CLASS_SELECTORS, COMMON_TEXTS, TABLE_BODY_SELECTOR, THREE_DOTS_SPINNER } from "@constants/common";
import { faker } from "@faker-js/faker";
import { TICKET_BUTTON_SELECTORS, TICKET_STATUS } from "@selectors/ticket";
import { expect } from "@playwright/test";
import { TICKET_ACTION_BUTTON_SELECTORS } from "@selectors/ticketActions";
import { TICKET_ACTION_TEXTS } from "@constants/texts/ticketActions";

test.describe("Ticket actions", () => {
    let user = {}, ticketsInfo: TicketInfo[];

    test.beforeEach(({ }, testInfo) => {
        user = readFileSyncIfExists().user;
        if (testInfo.title.includes("2 tickets")) {
            ticketsInfo = Array.from({ length: 2 }, () => generateTicketInfo({ user }));
        } else {
            ticketsInfo = Array.from({ length: 1 }, () => generateTicketInfo({ user }));
        }
    });

    test("should spam the newly created ticket", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create a new ticket", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: ticketsInfo[0] });
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden();
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') })).toBeVisible({ timeout: 10000 });
        });

        await test.step("Step 3: Report the ticket as spam", async () => {
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click();

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

            const blockCustomerModal = page.locator(COMMON_CLASS_SELECTORS.dialogBox);
            if (blockCustomerModal.isVisible()) {
                await page.getByTestId(COMMON_SELECTORS.alertModalCrossIcon).click();
            }
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
        });

        await test.step("Step 4: Navigate to spams", () =>
            sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.spamLabel));

        await test.step("Step 4: Verify details", () =>
            ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketsInfo[0], status: TICKET_STATUS.spam }, user }));

        await test.step("Step 5: Deleting the newly created ticket", () =>
            ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo: ticketsInfo[0], sidebarSection, canDelete: true }));
    });

    test("should block the author of newly created 2 tickets", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        const newEmail = faker.internet.email();
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create two new tickets with same email", async () => {
            for (const ticketInfo of ticketsInfo) {
                await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: { ...ticketInfo, customerEmail: newEmail } });
                await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden();
                await expect(page.locator(TABLE_BODY_SELECTOR)
                    .getByRole('row', { name: new RegExp(ticketInfo.subject, 'i') })).toBeVisible({ timeout: 10000 });
            }
        });

        await test.step("Step 3: Report the ticket as spam", async () => {
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click();

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

            const blockCustomerModal = page.locator(COMMON_CLASS_SELECTORS.dialogBox);
            if (await blockCustomerModal.isVisible()) {
                await expect(page.getByTestId(COMMON_BUTTON_SELECTORS.modalHeader)).toContainText(new RegExp(TICKET_ACTION_TEXTS.blockCustomer, 'i'));
                await page.getByTestId(TICKET_BUTTON_SELECTORS.customerBlockModalSubmit).click();
                await expect(page.locator(BUTTON_SPINNER)).toBeHidden();
                await page.reload();
            }
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
        });

        await test.step("Step 4: Navigate to spams", () =>
            sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.spamLabel));

        await test.step("Step 5: Verify tickets in spams", () =>
            Promise.all(ticketsInfo.map((ticketInfo) =>
                ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketInfo, status: TICKET_STATUS.spam, customerEmail: newEmail }, user })
            ))
        )

        await test.step("Step 6: Deleting the newly created ticket", async () => {
            for (const ticketInfo of ticketsInfo) {
                await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo, sidebarSection, canDelete: true })
            }
        })
    });

    test("should move the newly created ticket to trash", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create a new ticket", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: ticketsInfo[0] });
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden();
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') })).toBeVisible({ timeout: 10000 });
        });

        await test.step("Step 3: Move the ticket to trash", async () => {
            await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click();

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

            await page.reload();
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
        });

        await test.step("Step 4: Navigate to trash", () =>
            sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.trashLabel));

        await test.step("Step 5: Verify details of trashed ticket", () =>
            ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketsInfo[0], status: TICKET_STATUS.trash }, user }));

        await test.step("Step 6: Deleting the trashed ticket", async () =>
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo: ticketsInfo[0], sidebarSection, canDelete: true }));
    });


    test("Tag:(2 tickets), should merge newly created ticket into another ticket", async ({ page, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {
        let ticketNumber1: string;

        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create two new tickets ", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: ticketsInfo[0] });
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden();
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') })).toBeVisible({ timeout: 10000 });

            const ticketButtonContent = await page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).textContent();

            ticketNumber1 = String(parseInt(ticketButtonContent));

            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: ticketsInfo[1] });
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden();
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[1].subject, 'i') })).toBeVisible({ timeout: 10000 });
        });

        await test.step("Step 3: Opening the details of 2nd ticket", () =>
            page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[1].subject, 'i') })
                .getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click());

        await test.step("Step 4: Verify if shortcut for merging tickets works", async () => {
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();
            await page.keyboard.press(TICKET_ACTION_BUTTON_SELECTORS.keyToMerge);
            await expect(page.getByTestId(COMMON_BUTTON_SELECTORS.paneBody)).toBeVisible({ timeout: 2000 });
            await page.getByTestId(COMMON_BUTTON_SELECTORS.paneCloseButton).click();
            await expect(page.getByTestId(COMMON_BUTTON_SELECTORS.paneBody)).toBeHidden({ timeout: 2000 });
        });

        await test.step("Step 5: Merging 2nd ticket into 1st ticket", async () => {

            await page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.subheaderActionsDropdown,).click();
            await expect(page.getByTestId(COMMON_SELECTORS.dropdownContainer)).toBeVisible();
            await page.getByTestId(COMMON_SELECTORS.dropdownContainer).getByText(COMMON_TEXTS.mergeTicket).click();

            await expect(page.getByTestId(COMMON_BUTTON_SELECTORS.paneBody)).toBeVisible({ timeout: 2000 });

            await page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.primaryTicketNumberTextField).fill(ticketNumber1);
            await page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.addPrimaryTicketButton).click();
            await expect(page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.addTicketInputError)).toBeHidden({ timeout: 2000 });
            await expect(page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.ticketCardSubject)).toBeVisible({ timeout: 2000 });

            await page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.mergeTicketsSubmitButton).click();

            await expect(page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.commentTextInput)).toBeVisible({ timeout: 2000 });

            await page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.mergeTicketsButton).click();

            await page.reload();
            await expect(page.getByTestId(COMMON_SELECTORS.pageLoader)).toBeHidden();

        });

        await test.step("Step 6: Verify parent ticket in all tickets view", async () => {
            await sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.allTicketsLabel);
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden({ timeout: 10000 });
            await ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketsInfo[0], status: TICKET_STATUS.waitingOnCustomer }, user });
        })

        await test.step("Step 7: Verify child ticket in closed tickets view", async () => {
            await sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.closedTicketsLabel);
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden({ timeout: 10000 });
            await ticketPage.verifyDetailsOfTicket({ ticketInfo: { ...ticketsInfo[1], status: TICKET_STATUS.closed }, user });
        })

        await test.step("Step 8: Deleting the newly created ticket", async () => {
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo: ticketsInfo[1], sidebarSection });
            await sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.allTicketsLabel);
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden({ timeout: 10000 });
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo: ticketsInfo[0], sidebarSection });
        })
    });


    test("should print the newly created ticket", async ({ page, context, ticketPage, neetoPlaywrightUtilities, sidebarSection }) => {

        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create a new ticket", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo: ticketsInfo[0] });
            await expect(page.locator(THREE_DOTS_SPINNER)).toBeHidden();
            await expect(page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') })).toBeVisible({ timeout: 10000 });
        });

        const ticketButtonContent = await page.locator(TABLE_BODY_SELECTOR)
            .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).textContent();

        await test.step("Step 3: Open the ticket details", () =>
            page.locator(TABLE_BODY_SELECTOR)
                .getByRole('row', { name: new RegExp(ticketsInfo[0].subject, 'i') }).getByTestId(TICKET_BUTTON_SELECTORS.ticketSubjectButton).click());

        await test.step("Step 4: Print the ticket", async () => {
            await page.getByTestId(TICKET_ACTION_BUTTON_SELECTORS.subheaderActionsDropdown,).click();
            await expect(page.getByTestId(COMMON_SELECTORS.dropdownContainer)).toBeVisible();
            const pagePromise = context.waitForEvent('page');
            await page.getByTestId(COMMON_SELECTORS.dropdownContainer).getByText(COMMON_TEXTS.printTicket).click();
            const newPage = await pagePromise;
            await newPage.waitForLoadState();
            const ticketId = String(parseInt(ticketButtonContent));
            await expect(newPage).toHaveURL(`desk/tickets/${ticketId}/print`);
            await newPage.close();
        });

        await test.step("Step 5: Deleting the newly created ticket", async () => {
            await sidebarSection.clickOnSubLink(TICKET_BUTTON_SELECTORS.allTicketsLabel);
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo: ticketsInfo[0], sidebarSection });
        })
    });
})