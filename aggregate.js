const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const _ = require('lodash');

module.exports = {
  /**
   * Aggregates input string.
   * @param {string} input string with CSV daat to process
   * @param {boolean} removeTurnarounds true to Aggregate turnarounds like "A,B,100" and "B,A,10" to "A,B,90"
   * @returns aggregated data as CSV string (in a result property) or an error object 
   * with step (name of the step) and e (exception or string with details) properties 
   */
  aggregate: function (inputCsv, removeTurnarounds) {
      let records = [];

      try {
          records = parse(
              inputCsv, 
              {
                  skip_empty_lines: true,
                  trim: true,
                  quote: '"',
              }
          );
      } catch (e) {
          return {
              result: null,
              error: {
                  step: 'Parsing CSV',
                  e,
              },
          };
      }

      let error;

      // Validate names
      error = validateInput(
          records, 
          'empty names',
          row => row.slice(0, 2).filter(c => !c.trim()).length
      );
      if (error) {
          return error;
      }

      // Validate amounts
      error = validateInput(
          records, 
          'invalid amount',
          row => isNaN(parseFloat(row[2])) || parseFloat(row[2]) <= 0
      );
      if (error) {
          return error;
      }

      if (removeTurnarounds) {
          // For rows where name1 > name2 inverts the name order and adds flag of inversion
          records = records.map(row => (row[0] > row[1] ? [row[1], row[0], row[2], true] : row));
      }

      // Groups record by name pair
      const groupedRecords = _.groupBy(
          records, 
          record => record.slice(0, 2).map(c => c.toUpperCase())
      );

      // Lodash groupBy() creates an object with group key as property names
      // and grouped records as values - so map the object "entries" 
      // to produce the array of [name1, name2, totalAmount] arrays 
      const rows = Object.entries(groupedRecords)
          .map(
              row => [
                  ...row[1][0].slice(0, 2),
                  (
                      Math.round(
                        row[1]
                            // Take into account the row "inversion" flag
                            .map(r => parseFloat(r[2] * (r.length === 4 ? -1 : 1)))
                            .reduce((s, v) => s + v, 0)
                        * 100
                    ) / 100
                  ).toFixed(2),
              ]
          )
          // If the resulting row amount is negative, "invert" the row
          .map(row => (row[2] < 0 ? [row[1], row[0], -row[2]] : row))
          .filter(row => row[2] !== '0.00')
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
      return {result, error: null};
  }
}

/**
 * Validates input records.
 * @param {array} records array with records (each record is an array like ["name1", "name2", amount])
 * @param {string} message message to describe an error
 * @param {function} validator boolean function that validates the record
 * @returns null if all records validated withot errors or an error object
 */
function validateInput(records, message, validator) {
    const invalidRecords = records.filter(validator);
    if (invalidRecords.length) {
        return {
            result: null,
            error: {
                step: 'Validating CSV',
                e: `${invalidRecords.length} row(s) has ${message}:\n` +
                   `${invalidRecords.slice(0, 10).map(row => row.join(',')).join('\n')}`,
            },
        };
    } else {
        return null;
    }
}
