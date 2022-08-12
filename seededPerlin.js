'use strict'

const f = (a, b) => [].concat(...a.map(d => b.map(e => [].concat(d, e))));

const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

const smootherstep = (x) => 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;

const interp = function (x, a, b) {
    return a + smootherstep(x) * (b - a);
}

const lerp = (t, a, b) => a + (b - a) * t;

const dotProduct = (xs, ys) => {
    const sum = xs => xs ? xs.reduce((a, b) => a + b, 0) : undefined;

    return xs.length === ys.length ? (
        sum(zipWith((a, b) => a * b, xs, ys))
    ) : undefined;
}

const zipWith = (f, xs, ys) => {
    const ny = ys.length;
    return (xs.length <= ny ? xs : xs.slice(0, ny))
        .map((x, i) => f(x, ys[i]));
}

console.log(lerp(15, 40, 45));
console.log(interp(15, 40, 45));