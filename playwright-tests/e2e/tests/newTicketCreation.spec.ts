import { EditorPage, readFileSyncIfExists } from "@bigbinary/neeto-playwright-commons";
import test from "../fixtures/index";
import { TicketInfo, generateTicketInfo } from "@constants/utils";
import { COMMON_BUTTON_SELECTORS } from "@constants/common";

test.describe("Ticket Page", () => {
    let user = {}, ticketInfo: TicketInfo;
    test.beforeAll(() => {
        user = readFileSyncIfExists().user;
        ticketInfo = generateTicketInfo({ user });
    });

    // test.beforeEach(async(page)=>{
    //     await page.goto("/");
    // });

    test("should create a new ticket", async ({ page, ticketPage, neetoPlaywrightUtilities }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Creating a new ticket", async () => {
            await ticketPage.createNewTicket({ neetoPlaywrightUtilities, user, ticketInfo, });
            await ticketPage.deleteTicket({ neetoPlaywrightUtilities, ticketInfo });
        });
    })
    test("should not create new ticket if subject is empty", async ({ page, ticketPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Attempt to create a new ticket without subject", () =>
            ticketPage.attemptToCreateNewTicket({ agent: user, ticketInfo: { ...ticketInfo, subject: "" } })
        )
    });

    test("should not create new ticket if customer email is invlaid or empty", async ({ page, ticketPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Attempt to create a new ticket with invalid email", () =>
            ticketPage.attemptToCreateNewTicket({ agent: user, ticketInfo: { ...ticketInfo, customerEmail: "abcd" } })
        );
    })

    test("should not create new ticket if agent name is empty", async ({ page, ticketPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Attempt to create a new ticket without agent name", () =>
            ticketPage.attemptToCreateNewTicket({ agent: { ...user, currentUserName: "" }, ticketInfo })
        )
    })

    test("should not create new ticket if desc is empty", async ({ page, ticketPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Attempt to create a new ticket without desc", () =>
            ticketPage.attemptToCreateNewTicket({ agent: user, ticketInfo: { ...ticketInfo, desc: "" } })
        )
    })

    test("should verify the functionalities of decription editor", async ({ page, editorPage }) => {
        await test.step("Step 1: Navigate to home page", () =>
            page.goto("/"));

        await test.step("Step 2: Verify the description editor", async () => {
            await page.getByTestId(COMMON_BUTTON_SELECTORS.addNewTicketButton).click();
            await editorPage.verifyDescriptionEditor({
                text: "tickets.updated_one",
                cannedResponseSuccessMessage: "messages.successCannedResponse",
            });
        })
    });


})