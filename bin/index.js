#!node

/**
 * Command line utility to aggreage CSV files with rows like A,B,100.
 * 
 * Usage:
 *      "npm install -g" to install the script globally
 *      "summer [-t] < input-file > output-file"
 */

const commander = require('commander');
const readline = require('readline');
const { aggregate } = require('../aggregate');
const { runTests } = require('../tests');

main();

/**
 * Main function.
 * Parses the command line arguments, reads input stream and sends it to processing.
 */
function main() {
    commander
        .version('1.0.0', '-v, --version')
        .usage('[OPTIONS]...')
        .option('-a, --turnarounds', 'Aggregate turnarounds like "A,B,100" and "B,A,10" to "A,B,90"')
        .option('-t, --test', 'Run tests')
        .parse(process.argv);
    const optionDefinitions = [
        { name: 'deep', alias: 'd', type: Boolean },
    ];
    const removeTurnarounds = commander.turnarounds;
    const test = commander.test;

    if (test) {
        const result = runTests();
        process.exit(result);
    } else {
        let input = '';

        readline
            .createInterface({input: process.stdin})
            .on('line', line => input += '\n' + line.trim())
            .on('close', () => process.exit(processInput(input, removeTurnarounds)));
    }
}        

/**
 * Processes input string. Prints output to the stdout.
 * @param {string} input string with CSV daat to process
 * @param {boolean} removeTurnarounds true to Aggregate turnarounds like "A,B,100" and "B,A,10" to "A,B,90"
 */
function processInput(input, removeTurnarounds) {
    const {result: outputCsv, error} = aggregate(input, removeTurnarounds);

    if (!error) {
        process.stdout.write(outputCsv);
        process.stdout.write('\n');
        return 0;
    } else {
        process.stderr.write(`Error while ${error.step}:\n${error.e}`);
        process.stderr.write('\n');
        return 1;
    }
}    
