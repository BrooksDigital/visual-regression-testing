'use strict'

/**
 * Creates the backstop configuration.
 *
 * It can be referenced via the backstop command line --config option.
 *
 * It expands per-project configuration found in tests.yaml by default.
 *
 * It can be configured/overridden via the environment variables:
 * - BACKSTOP_TEST_ID: The test ID, used for naming files and identifying which
 *   report you're looking at.
 * - BACKSTOP_TEST_FILE: The path of the test YAML file.
 * - BACKSTOP_REFERENCE_URL: the reference site base URL without a trailing
 *   slash.
 * - BACKSTOP_TEST_URL: the site under test base URL without a trailing slash.
 *
 * @todo Add error handling.
 * @todo Accept Drupal user login links and use them to create cookies for
 *   authenticated testing. (The reference at that point should not be live!)
 *
 * @see https://github.com/garris/BackstopJS#working-with-your-config-file`
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const process = require('node:process');
const yaml = require('js-yaml');

const defaults = {
  onBeforeScript: 'puppet/onBefore.js',
  onReadyScript: 'puppet/onReady.js',
  paths: {
    bitmaps_reference: 'backstop_data/bitmaps_reference',
    bitmaps_test: 'backstop_data/bitmaps_test',
    engine_scripts: 'engine_scripts',
    html_report: 'backstop_data/',
    ci_report: 'backstop_data/ci_report'
  },
  report: ['browser'],
  engine: 'puppeteer',
  engineOptions: {
    args: ['--no-sandbox'],
    // consider navigation to be finished when there are no more than 0 network
    // connections for at least 500 ms
    gotoParameters: {'waitUntil' : 'networkidle0'},
  },
  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  scenarioLogsInReports: true,
};

// This script allows overrides by environment variables. However if backstop is
// run with docker, variables from the host won't be available. To solve this we
// can use dockerCommandTemplate to relay environment variables to the
// container. (It's possible to relay because the script is run both from the
// host - presumably precisely because it needs the docker template - and the
// container.)
const envNames = [
  'BACKSTOP_TEST_URL',
  'BACKSTOP_REFERENCE_URL',
  'BACKSTOP_TEST_ID',
  'BACKSTOP_TEST_FILE',
];

// Map environment variables to a string for the docker run command.
const envVarString = envNames
  .filter(name => process.env[name])
  .map(name => `-e ${name}='${process.env[name]}' `)
  .join('');

// Ensure we're using environment variables that will be passed on to Docker.
function getEnv(name) {
  assert(envNames.includes(name), `'${name}' isn't an allowed environment variable`);
  return process.env[name];
}

const testPath = getEnv('BACKSTOP_TEST_FILE') || 'tests.yaml';
const config = yaml.load(fs.readFileSync(testPath, 'utf8'));

const getBaseUrl = e => getEnv(`BACKSTOP_${e.toUpperCase()}_URL`) || config.base_urls[e];
const defaultScenario = (config.defaults && config.defaults.scenario) || {};

module.exports = {
  ...defaults,
  ...config,
  ...{
    id: getEnv('BACKSTOP_TEST_ID') || config.id,
    scenarios: config.scenarios.map(scenario => ({
      ...{
        url: getBaseUrl('test') + scenario.path,
        referenceUrl: getBaseUrl('reference') + scenario.path,
        label: scenario.path,
      },
      ...defaultScenario,
      ...scenario
    })),
    dockerCommandTemplate: `docker run ${envVarString}--rm -it --user $(id -u):$(id -g) --mount type=bind,source="{cwd}",target=/src backstopjs/backstopjs:{version} {backstopCommand} {args}`,
  }
};
