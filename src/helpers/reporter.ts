import { SpecReporter, StacktraceOption } from 'jasmine-spec-reporter';
import Jasmine from 'jasmine'; 

const jasmineRunner = new Jasmine();
jasmineRunner.env.clearReporters();
jasmineRunner.env.addReporter(
  new SpecReporter({
    spec: {
      displayPending: true,
      displayDuration: true,
      displayStacktrace: StacktraceOption.RAW
    },
    summary: {
      displayDuration: true,
      displayFailed: true,
      displayPending: false
    }
  })
);

jasmineRunner.loadConfigFile('spec/support/jasmine.json');
jasmineRunner.execute();