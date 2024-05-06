import {
  CHANGELOG_BASE_URL,
  CHAT_API_BASE_URL,
  KB_DOCS_BASE_URL,
} from "@constants/routes";
import setup from "@fixtures";
import {
  CustomCommands,
  HelpAndProfilePage,
  STORAGE_STATE,
  clearCredentials,
  skipTest,
} from "@neetoplaywright";

setup.describe.serial("Logout feature", () => {
  setup("should logout user", async ({ page: defaultPage, browser }) => {
    skipTest.forAllExceptStagingEnv();
    await defaultPage.close();
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    const page = await context.newPage();
    await page.goto("/admin")
    await page.waitForLoadState();
    const neetoPlaywrightUtilities = new CustomCommands(page, context.request);

    const helpAndProfilePage = new HelpAndProfilePage({
      page,
      neetoPlaywrightUtilities,
      chatApiBaseURL: CHAT_API_BASE_URL,
      kbDocsBaseURL: KB_DOCS_BASE_URL,
      changelogBaseURL: CHANGELOG_BASE_URL,
    });
    await helpAndProfilePage.verifyLogoutV2();
  });

  setup("Teardown", clearCredentials);
});
