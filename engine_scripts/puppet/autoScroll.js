/**
 * @file
 * Scrolls to the bottom of the page prior to taking the screenshot.
 *
 * It will run if any lazy loading elements are present, or if enabled via the
 * scenario.custom.autoScroll configuration. It can be explicitly disabled by
 * setting autoScroll to false.
 */

module.exports = async (page, scenario) => {
  const { autoScroll } = scenario.custom || {};
  // Allow auto-scroll to be explicitly turned off, regardless of lazy loading
  // elements.
  if (autoScroll === false) {
    console.log('Autoscroll explicitly disabled');
    return;
  }
  const hasLazyElements = () => !!document.querySelector('[loading="lazy"]');
  if (autoScroll || await page.evaluate(hasLazyElements)) {
    const message = autoScroll ? 'Autoscroll enabled via config' : 'Lazy elements detected: autoscroll enabled';
    console.log(message);
    // Scroll the page from top to bottom to trigger any lazy loading.
    const delay = typeof autoScroll === 'number' ? autoScroll : 50;
    await page.evaluate((async (delay) => {
      let oldScrollY = -1;
      while (oldScrollY < window.scrollY) {
        oldScrollY = window.scrollY;
        window.scrollBy({ top: window.innerHeight * 2, behavior: 'smooth' });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }), delay);
  }
};
