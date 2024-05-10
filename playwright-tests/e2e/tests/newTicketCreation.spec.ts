import { readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { TicketInfo, generateTicketInfo } from "@constants/utils";
import { COMMON_BUTTON_SELECTORS } from "@constants/common";
import { faker } from "@faker-js/faker";
import { TICKET_BUTTON_SELECTORS, TICKET_INPUT_FIELD_SELECTORS } from "@selectors/ticket";

test.describe("Ticket Page", () => {
    let user = {}, ticketInfo: TicketInfo;
    test.beforeAll(() => {
        user = readFileSyncIfExists().user;
        ticketInfo = generateTicketInfo({ user });
    });

    test("should create a new ticket", async ({ page, ticketPage, sidebarSection }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Create a new ticket", async () =>
            await ticketPage.createNewTicket({ user, ticketInfo }));

        await test.step("Step 3: Verify details of newly created ticket", () =>
            ticketPage.verifyDetailsOfTicket({ ticketInfo, user }));

        await test.step("Step 4: Verify the newly created ticket in tables", async () => {
            const labels = [TICKET_BUTTON_SELECTORS.unresolvedLabel, TICKET_BUTTON_SELECTORS.assignedToMeLabel, TICKET_BUTTON_SELECTORS.assignedLabel, TICKET_BUTTON_SELECTORS.allTicketsLabel];
            await ticketPage.verifyTicketInDifferentTables({ subject: ticketInfo.subject, labels, sidebarSection });
        });

        await test.step("Step 5: Delete the newly created ticket", () =>
            ticketPage.deleteTicket({ ticketInfo, sidebarSection }));
    });

    test("should not create new ticket without required fields", async ({ page, ticketPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Attempt to create a new ticket", async () => {
            const sampleText = faker.word.sample();
            await ticketPage.attemptToCreateNewTicket({ subject: "", customerEmail: sampleText, agentName: "", desc: "" })
        });
    });

    test("should verify the functionalities of decription editor", async ({ page, editorPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Verify the description editor", async () => {
            await page.getByTestId(COMMON_BUTTON_SELECTORS.addNewTicketButton).click();
            const sampleText = faker.word.sample();
            await editorPage.verifyDescriptionEditor({
                text: sampleText,
                cannedResponseSuccessMessage: TICKET_INPUT_FIELD_SELECTORS.cannedResponseSuccessMessage,
            });
        })
    });
})