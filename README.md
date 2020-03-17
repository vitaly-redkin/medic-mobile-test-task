This project is a Medic Mobile Take Home Test (https://gist.github.com/SCdF/40e8d5eed974ef6863ea0020054d81f9).

## Installation
To install the script as a "global" Node.JS utility run such command

`npm install -g`

## Running
To run an utility you should use the command line command named `summer` with input and output stream redirection:

`summer <./test-data/test1.in >res.out`

## Advanced Mode
To aggregate "rurnarounds" like "A,B,100" and "B,A,10" to "A,B,90" use the `-a` command line switch: 

`summer -a <./test-data/test1.in >res.out`

## Tests
To run unit tests use -t command line switch:

`summer -t`

Unit tests described in the `tests` array of the `tests.js` file. Every eleemnt in this array is, in turn, another array which consists of the names of the input file, the expected output file in the "normal" mode and the expected output file in the "advanced" mode.

The test files should be in the `test-data` folder. I did not use any test framework since it would be an overkill for such a simple app.

## Source Data Validation
csv-parseNPM package I used does some job do validate the CSV file format correctness - like proper quoting and consisten number of columns. If the parsing fails I stop the processing, print message to stderr and return 1 as an exist code.
Also I validate if both names are non-empty in the row and if the amount is a positive number. If at least one row fails this validation I do not process the file at all and print the error description and the first 10 failed rows.

## Used NPM Packages
* commander - helps with the command line parsing
* csv-parse, csc-stringify - parses adn composed the CSV files
* lodash - used for the "group by" functionality

While I can implement the functionality I used from thsi packages in this simple application myself I decided to use them since it what I do in the real life (I am paid to solve the business problems not to reinvent the wheels)

