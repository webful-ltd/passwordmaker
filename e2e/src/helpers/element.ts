const ElementActionOptions = require('./definitions').ElementActionOptions;

async function waitForElement(selector: string, { visibilityTimeout = 5000 }: ElementActionOptions = {}) {
  const el = await $(selector);
  await el.waitForDisplayed({ timeout: visibilityTimeout });
  return el;
}

module.exports = { waitForElement }
