import { commands, i18nFixture, CustomFixture, } from "@neetoplaywright";
import { test } from "@playwright/test";

import { Poms, poms } from "./poms";

interface ExtendedFixture {
  // neetoPLaywrightUtilities:CustomCommands
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
  })