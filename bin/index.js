#!node

var parse = require('csv-parse/lib/sync');
var stringify = require('csv-stringify/lib/sync');
var readline = require('readline');
var _ = require('lodash');

var stdin = process.stdin;
var stdout = process.stdout;
var input = '';

readline
    .createInterface({input: process.stdin})
    .on('line', line => input += '\n' + line.trim())
    .on('close', processInput);
  
function processInput() {
    
    const records = parse(
        input, 
        {
            skip_empty_lines: true
        }
    );

    var groupedRecords = _.groupBy(
        records, 
        record => record.slice(0, 2)
    );

    var r1 = Object.entries(groupedRecords)
        .map(
            row => [
                ...row[0].split(','),
                Math.round(
                    row[1]
                        .map(r => parseFloat(r[2]))
                        .reduce((s, v) => s + v, 0)
                    * 100
                ) / 100,
            ]
        );
    
    var result = r1;
    var sortedRows = result.sort(
        (r1, r2) => {
            var c1 = r1[0].localeCompare(r2[0]);
            if (c1) {
                return c1;
            } else {
                return r1[1].localeCompare(r2[1]) || (r2[2] - r1[2]);
            }
        }
    );

    var result = stringify(sortedRows);

    printResults(input);
    printResults('\n\n');
    printResults(result);
}

function printResults(result) {
//    stdout.write(JSON.stringify(result, null, 2));
    stdout.write(result);
    stdout.write('\n');
}
