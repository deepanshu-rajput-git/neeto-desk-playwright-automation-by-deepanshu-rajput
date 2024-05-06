import { PRODUCT, UNRESOLVED_TICKETS } from "@constants/common";
import { LOGIN_TEXTS } from "@constants/texts/login";
import setup from "@fixtures";
import { COMMON_SELECTORS, initializeCredentials, login } from "@neetoplaywright";
import { expect } from "@playwright/test";
import { LOGIN_BUTTON_SELECTORS } from "@selectors/login";

setup("login", async ({ page, organizationPage, neetoPlaywrightUtilities }) => {
  setup.slow();
  await setup.step("Step 1: Initialize credentials", () =>
    initializeCredentials(PRODUCT)
  );

  await setup.step("Step 2: Setup Organization", () =>
    organizationPage.setupOrganization(PRODUCT)
  );

  await setup.step("Step 3: Login into the application", () =>
    login({ page, neetoPlaywrightUtilities })
  );

  await setup.step("Onboarding user", async () => {
    await page.getByTestId(LOGIN_BUTTON_SELECTORS.onboardingWelcomeButton).click();
    await page.getByRole('button', { name: new RegExp(LOGIN_TEXTS.iWillDoThisLater, 'i') }).click();
    await page.getByTestId(LOGIN_BUTTON_SELECTORS.onboardingCongratulationsButton).click();
    await expect(page.getByTestId(COMMON_SELECTORS.header))
      .toContainText(new RegExp(UNRESOLVED_TICKETS, 'i'), { timeout: 8000 });
  });
});

