'use strickt'

// helper functions
function* pseudoRandom(seed) {
    let value = seed;

    while (true) {
        value = value * 16807 % 2147483647;
        let length = Math.log(value) * Math.LOG10E + 1 | 0;
        let max = 10 ** (length - 1) - 1;
        yield parseFloat(max / value); // returns a float between 0 and 1
    }
};