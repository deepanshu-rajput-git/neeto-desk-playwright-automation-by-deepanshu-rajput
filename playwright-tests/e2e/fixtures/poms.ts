import {
  CustomFixture,
  HelpAndProfilePage,
  OrganizationPage,
} from "@bigbinary/neeto-playwright-commons";
import { CHANGELOG_BASE_URL, CHAT_API_BASE_URL, KB_DOCS_BASE_URL } from "@constants/routes";
import {
  Fixtures,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from "@playwright/test";
import { I18nPlaywrightFixture } from "playwright-i18next-fixture";

export interface Poms {
  organizationPage: OrganizationPage;
  helpAndProfilePage: HelpAndProfilePage;
}

export type PomFixture = Fixtures<
  Poms,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions,
  PlaywrightTestArgs &
    PlaywrightTestOptions &
    CustomFixture &
    I18nPlaywrightFixture,
  PlaywrightWorkerArgs & PlaywrightWorkerOptions
>;

export const poms: PomFixture = {
  organizationPage: async ({ page, neetoPlaywrightUtilities }, use) => {
    const organization = new OrganizationPage(page, neetoPlaywrightUtilities);
    await use(organization);
  },

  helpAndProfilePage: async ({ page, neetoPlaywrightUtilities }, use) => {
    const helpAndProfilePage = new HelpAndProfilePage({
      page,
      neetoPlaywrightUtilities,
      chatApiBaseURL: CHAT_API_BASE_URL,
      kbDocsBaseURL: KB_DOCS_BASE_URL,
      changelogBaseURL: CHANGELOG_BASE_URL,
    });
    await use(helpAndProfilePage);
  },
};
