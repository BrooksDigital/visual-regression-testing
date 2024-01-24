# Visual Regresstion Testing with BackstopJS

## Basic CI Usage

1. Add a file to your project to define the test config called `tests/vrt.yaml` using [tests.yaml] as a base.
2. Add a workflow file to the repo to run the action, eg. `.github/workflows/vrt.yml`:
   ```yaml
   name: Compare web pages visually

   on: workflow_dispatch

   jobs:
     compare:
       concurrency:
         group: 'vrt-${{ vars.BACKSTOP_TEST_URL }}-live'
         cancel-in-progress: true
       permissions:
         contents: read
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: BrooksDigital/visual-regression-testing@main
           with:
             vrt-domain: https://domain.surge.sh
             surge-token: ${{ secrets.SURGE_TOKEN }}
             test-id: backstop-action-test-${{ github.run_number }}-${{ github.run_attempt }}
             test-url: ${{ vars.BACKSTOP_TEST_URL }}
   ```
3. Choose a suitable domain name for Surge and update the `vrt-domain` line. You can use any string that hasn't been
   taken, followed by `.surge.sh`, eg. `https://vrt-my-project.surge.sh/`.
3. [Add the `BACKSTOP_TEST_URL` variable and `SURGE_TOKEN` secret to the repo][0].
4. Trigger the test by going to the *Actions* tab of the repo and selecting the `name` from your workflow file.

## Installing into the codebase

If you want to run it locally or further customize how it's run in CI you can embed it in the project.

```sh
# A typical structure from project root
mkdir tests
cd tests
git clone --depth 1 --branch main git@github.com:BrooksDigital/visual-regression-testing.git backstop
rm -rf backstop/{.git,action.yml}
git add backstop
```
You can continue using the same action in CI but configure it using the `local-backstop-directory` property, eg.
```yaml
  local-backstop-directory: tests/backstop
```

## Usage

```yaml
- uses: BrooksDigital/visual-regression-testing
  with:
    # The relative path to the YAML file containing backstop test config.
    backstop-test-file: tests/vrt.yaml

    # The relative path to a backstop installation already within the codebase.
    local-backstop-directory: tests/backstop

    # The test ID that's displayed at the top of the report. Can also be configured via YAML config.
    test-id: vrt-${{ github.run_number }}-${{ github.run_attempt }}

    # The base URL that will be used as the reference to compare against. Can also be configured via YAML config.
    reference-url: https://example.com

    # The base URL to test. Can also be configured via YAML config.
    test-url: https://user:pass@dev.example.com

    # The domain name to upload to.
    vrt-domain: https://some-domain.surge.sh

    # The Surge token.
    surge-token: ${{ secrets.SURGE_TOKEN }}
```

[0]: https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository
[tests.yaml]: tests.yaml
