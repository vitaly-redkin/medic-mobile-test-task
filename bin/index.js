#!node

/**
 * Command line utility to aggreage CSV files with rows like A,B,100.
 * 
 * Usage:
 *      "npm install -g" to install the script globally
 *      "summer [-t] < input-file > output-file"
 */

const commander = require('commander');
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const readline = require('readline');
const _ = require('lodash');

main();

/**
 * Main function.
 * Parses the command line arguments, reads input stream and sends it to processing.
 */
function main() {
    commander
        .version('1.0.0', '-v, --version')
        .usage('[OPTIONS]...')
        .option('-t, --turnarounds', 'Aggregate turnarounds like "A,B,100" and "B,A,10" to "A,B,90"')
        .parse(process.argv);
    const optionDefinitions = [
        { name: 'deep', alias: 'd', type: Boolean },
    ];
    const removeTurnarounds = commander.turnarounds;
    
    let input = '';

    readline
        .createInterface({input: process.stdin})
        .on('line', line => input += '\n' + line.trim())
        .on('close', () => processInput(input, removeTurnarounds));
}        

/**
 * Processes input string. Prints output to the stdout.
 * @param {string} input string with CSV daat to process
 * @param {boolean} removeTurnarounds true to Aggregate turnarounds like "A,B,100" and "B,A,10" to "A,B,90"
 */
function processInput(input, removeTurnarounds) {
    const outputCsv = aggregate(input, removeTurnarounds);

    process.stdout.write(outputCsv);
    process.stdout.write('\n');
}    
  
/**
 * Aggregates input string.
 * @param {string} input string with CSV daat to process
 * @param {boolean} removeTurnarounds true to Aggregate turnarounds like "A,B,100" and "B,A,10" to "A,B,90"
 * @returns aggregated data as CSV string
 */
function aggregate(inputCsv, removeTurnarounds) {
    let records = parse(
        inputCsv, 
        {
            skip_empty_lines: true
        }
    );

    if (removeTurnarounds) {
        // For rows where name1 > name2 inverts the name order and adds flag of inversion
        records = records.map(row => (row[0] > row[1] ? [row[1], row[0], row[2], true] : row));
    }

    // Groups record by name pair
    const groupedRecords = _.groupBy(
        records, 
        record => record.slice(0, 2)
    );

    // Lodash groupBy() creates an object with group key as property names
    // and grouped records as values - so map the object "entries" 
    // to produce the array of [name1, name2, totalAmount] arrays 
    const rows = Object.entries(groupedRecords)
        .map(
            row => [
                ...row[0].split(','),
                Math.round(
                    row[1]
                        // Take into account the row "inversion" flag
                        .map(r => parseFloat(r[2] * (r.length === 3 ? -1 : 1)))
                        .reduce((s, v) => s + v, 0)
                    * 100
                ) / 100,
            ]
        )
        // If the resulting row amount is negative, "invert" the row
        .map(row => (row[2] < 0 ? [row[1], row[0], -row[2]] : row))
        .filter(row => row[2] !== 0)
        // Sort by names (ASC), then by amount (DESC)
        .sort(
            (row1, row2) => {
                var c1 = row1[0].localeCompare(row2[0]);
                if (c1) {
                    return c1;
                } else {
                    return row1[1].localeCompare(row2[1]) || (row2[2] - row1[2]);
                }
            }
        );

    const result = stringify(rows);
    return result;
}
