import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';
import Jasmine from 'jasmine'; 

const jasmineRunner = new Jasmine();
jasmineRunner.env.clearReporters();
jasmineRunner.env.addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,                   // Show pending/skipped specs
      displayDuration: true,                  // Show test execution time
      displayStacktrace: StacktraceOption.RAW // Display stack traces in full
    },
    summary: {
      displayDuration: true,                  // Show total execution time in summary
      displayFailed: true,                    // Show summary of failed tests
      displayPending: false                   // Hide pending from summary
    }
  })
);

jasmineRunner.loadConfigFile('spec/support/jasmine.json');
jasmineRunner.execute();