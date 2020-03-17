const fs = require('fs');
const { aggregate } = require('./aggregate');

/**
 * Array with test input and output (for the "normal" and "turnaround" modes).
 */
const tests = [
  ['test1.in', 'test1.out', 'test1.t.out'],
  ['test2.in', 'test2.out', 'test2.t.out']
].map(
  test => test.map(f => `./test-data/${f}`)
);

module.exports = {
  /**
   * Runs tests one by one.
   * @returns number of failed tests
   */
  runTests: function () {  
    let result = 0;

    tests.forEach(
      test => {
        [false, true].forEach(
          turnaround => {
            console.log(`\nRunning test file ${test[0]} in ${turnaround ? '"turnaround"' : 'normal'} mode.`)
            const input = readFile(test[0]);
            const expected = readFile(turnaround ? test[2] : test[1]);
            const {result: output, error} = aggregate(input, turnaround);
            if (error) {
              console.log(`ERROR: ${JSON.stringify(error, null, 2)}`)
            } else {
              if (expected.trim() === output.trim()) {
                console.log('PASSED')
              } else {
                result++;
                console.log(
                  `FAILED!!\n` +
                  `Expected:\n` + 
                  `-----------\n` +
                  `${expected}` +
                  `\n-----------\n` +
                  `Got:\n` + 
                  `-----------\n` +
                  `${output}` +
                  `-----------\n`
                );
              }
            }
          }
        );
      }
    );

    return result;
  }
}  

/**
 * Reads the text file from disk.
 * @param {string} fileName name of the file to read
 * @returns contents of the file as string.
 */
function readFile(fileName) {
  const contents = fs.readFileSync(fileName, 'utf8');
  return contents;
}  