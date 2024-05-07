import { commands, i18nFixture, CustomFixture, EditorPage, SidebarSection, } from "@neetoplaywright";
import { test } from "@playwright/test";

import { Poms, poms } from "./poms";
import TicketPage from "pom/ticket";

interface ExtendedFixture {
  ticketPage: TicketPage,
  editorPage: EditorPage,
  sidebarSection: SidebarSection,
}

export default test
  .extend<CustomFixture>(commands)
  .extend(i18nFixture)
  .extend<Poms>(poms)
  .extend({
    page: async ({ page }, use) => {
      await page.goto('/admin')
      await use(page);
    }
  }).extend<ExtendedFixture>({
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
  });