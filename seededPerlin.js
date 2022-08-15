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

function* pseudoRandom(seed) {
    let value = seed;

    while (true) {
        value = value * 16807 % 2147483647;
        let length = Math.log(value) * Math.LOG10E + 1 | 0;
        let max = 10 ** (length - 1) - 1;
        yield parseFloat(max / value); // returns a float between 0 and 1
    }
};

/*
dim:Dimension number of vectors in the grid
This object behaves like a grid consisting of dim dimensional vectors
random vectors generated when needed. 
*/
class Grid {

    constructor(dim, seed) {
        this.dim = dim;
        this.seed = seed;
        this.grid = {}
    }

    /*
    method to get random gradient vector in the location.
    key is a list representing sampling point
    get([1,2]) will give a random gradient vector in the position (1,2)
    */
    get(key) {
        if (!(key in this.grid)) {
            //if gradient is not calculated for the given key before, generate it and put it to grid
            let point = []
            Array.from({ length: this.dim }, (x, i) => point.push(pseudoRandom(this.seed) * 2 - 1));

            let sum = 0
            for (let i = 0; i < point.length; i++) {
                sum += Math.pow(point[i], 2)
            }

            let sqrt = Math.sqrt(sum)
            for (let i = 0; i < point.length; i++) {
                point[i] /= sqrt
            }

            this.grid[key] = point
        }

        return this.grid[key]
    }
}


/*
perlin noise sampler.
dim: number of dimensions you want to sample from
*/

class Perlin {
    constructor(dim, octaves = 1, seed) {
        this.dim = dim;
        this.octaves = octaves;
        this.seed = seed;
        this.grid = new Grid(this.dim, this.seed);
        this.scaleFactor = 2 * Math.pow(this.dim, -0.5);
    }

    /*
    main perlin function.
    calculates perlin noise for the given point
    dimension number of point must be equal to dimension number you give to constructor
    */
    sample(point) {

        //calculate corners of the grid cell that the point falls into
        let gridCorners = [];
        for (const dim of point) {
            const min_ = Math.floor(dim);
            const max_ = min_ + 1
            gridCorners.push([min_, max_])
        }
        //cartesian(...grid_corners) produces each point' coordinates of the grid cell
        let dots = []
        for (const gridCoords of cartesian(...gridCorners)) {
            //get gradient vector from grid
            let gradient = this.grid.get(gridCoords)

            //calculate offset vector by subtracting grid point from the point we sample
            let offset = []
            for (let i = 0; i < point.length; i++) {
                offset.push(point[i] - gridCoords[i])
            }
            //console.log(dotProduct(gradient,offset))

            //save results of dot product to an array
            dots.push(dotProduct(gradient, offset))

        }

        let dim = -1
        while (dots.length != 1) {
            dim += 1
            const half = (dots.length) / 2
            const s = smootherstep(point[dim] - Math.floor(point[dim]))

            let new_dots = []
            for (const x of zipWith((x, y) => [x, y], dots.slice(0, half), dots.slice(half))) {
                new_dots.push(interp(s, x[0], x[1]))
            }
            dots = new_dots

        }
        return dots[0] * this.scaleFactor
    }

    call(point) {

        let ret = 0

        for (let i = 0; i < this.octaves; i++) {
            const frequency = 1 << i
            let scaledPoint = []
            for (const dim of point) {
                scaledPoint.push(dim * frequency);
            }
            ret += this.sample(scaledPoint) / frequency;
        }

        ret /= 2 - Math.pow(2, (1 - this.octaves));
        return ret;
    }
}
module.exports = Perlin;