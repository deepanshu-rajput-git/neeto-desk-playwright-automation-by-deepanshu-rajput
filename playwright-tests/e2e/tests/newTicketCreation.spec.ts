import { readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { TicketInfo, generateTicketInfo } from "@constants/utils";

test.describe("Ticket Page", () => {
    let user = {}, ticketInfo: TicketInfo;
    test.beforeAll(() => {
        user = readFileSyncIfExists().user;
        ticketInfo = generateTicketInfo({ user });
    })
    test("should create a new ticket", async ({ page, ticketPage, neetoPlaywrightUtilities }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Creating a new ticket", () =>
            ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo, }));
    });
})