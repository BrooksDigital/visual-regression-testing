module.exports = async (page, scenario, viewport, isReference, browser, config) => {
  let description = scenario.label;
  if (scenario.label !== scenario.path) {
    description += ` (${scenario.path})`;
  }
  console.log(`Scenario: ${description}`);
  await require('./clickAndHoverHelper')(page, scenario);

  // Log browser console messages to backstop console.
  page
    .on('console', message =>
      console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`))
    .on('pageerror', ({ message }) => console.log(message))
    .on('requestfailed', request =>
      console.log(`${request.failure().errorText} ${request.url()}`));

  await require('./autoScroll')(page, scenario);
};
