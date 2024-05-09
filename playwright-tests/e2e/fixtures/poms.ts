import {
  CustomFixture,
  EditorPage,
  HelpAndProfilePage,
  OrganizationPage,
  SidebarSection,
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
import TaxonomyPage from "pom/taxonomy";
import TicketPage from "pom/ticket";
import ViewPage from "pom/view";

export interface Poms {
  organizationPage: OrganizationPage;
  helpAndProfilePage: HelpAndProfilePage;
  ticketPage: TicketPage,
  editorPage: EditorPage,
  sidebarSection: SidebarSection,
  viewPage: ViewPage,
  taxonomyPage: TaxonomyPage,
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

  ticketPage: async ({ page }, use) => {
    const ticketPage = new TicketPage(page);
    await use(ticketPage);
  },

  editorPage: async ({ page, neetoPlaywrightUtilities }, use) => {
    const customEditorPage = new EditorPage(page, neetoPlaywrightUtilities);
    use(customEditorPage);
  },

  sidebarSection: async ({ page, neetoPlaywrightUtilities }, use) => {
    const sidebarSection = new SidebarSection(page, neetoPlaywrightUtilities);
    use(sidebarSection);
  },

  viewPage: async ({ page }, use) => {
    const viewPage = new ViewPage(page);
    await use(viewPage);
  },

  taxonomyPage: async ({ page }, use) => {
    const taxonomyPage = new TaxonomyPage(page);
    await use(taxonomyPage);
  },
};
