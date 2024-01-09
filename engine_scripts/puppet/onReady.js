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

  const autoScroll = config.behaviors.autoScroll;
  if (autoScroll) {
    // Scroll the page from top to bottom to trigger any lazy loading.
    const delay = autoScroll !== true ? autoScroll : 150;
    await page.evaluate( (async (delay) => {
      let oldScrollY = -1;
      while (oldScrollY < window.scrollY) {
        oldScrollY = window.scrollY;
        window.scrollBy({top: window.innerHeight * 2, behavior: 'smooth'});
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }), delay);
  }
};
