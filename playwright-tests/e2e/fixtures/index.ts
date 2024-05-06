import { commands, i18nFixture, CustomFixture, } from "@neetoplaywright";
import { test } from "@playwright/test";

import { Poms, poms } from "./poms";
import TicketPage from "pom/ticket";

interface ExtendedFixture {
  ticketPage: TicketPage,
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
    }
  });