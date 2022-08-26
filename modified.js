'use strickt'

/*
helper functions
*/

function* pseudoRandom(seed) {
    let value = parseInt(seed);

    while (true) {
        value = value * 16807 % 2147483647;
        let length = Math.log(value) * Math.LOG10E + 1 | 0;
        let max = 10 ** (length - 1) - 1;
        yield parseFloat(max / value); // returns a float between 0 and 1
    }
};

let generator = pseudoRandom(123456789);

//gives cartesian product of input lists
const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

//dot product of two javascript arrays
const dotProduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

// zip function as in python zip
const zip = (...rows) => [...rows].map((_, c) => rows.map(row => row[c]));

//perlin's improved smooth step function
const smoothStep = (x) => 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;

/*
classes
*/

/*
dimensions: Dimension number of vectors in the grid
This object behaves like a grid consisting of dimensions dimensional vectors
random vectors generated when needed. 
*/
class Grid {

    constructor(dimensions) {
        this.dimemensions = dimensions;
        this.grid = {};
    }

    /*
    method to get random gradient vector in the location.
    key is a list representing sampling point
    get([1,2]) will give a random gradient vector in the position (1,2)
    */
    get(key) {

        if (!(key in this.grid)) { // if gradient is not calculated for the given key before, generate it and put it to grid
            let point = [];
            Array.from({ length: this.dimemensions }, (x, i) => point.push(generator.next().value * 2 - 1));

            let sum = 0;
            for (let i = 0; i < point.length; i++) {
                sum += Math.pow(point[i], 2);
            }

            let sqrt = Math.sqrt(sum);
            for (let i = 0; i < point.length; i++) {
                point[i] /= sqrt;
            }

            this.grid[key] = point;
        }

        return this.grid[key];
    }
}

/*
perlin noise sampler.
dimensions: number of dimensions you want to sample from
*/

class Perlin {
    constructor(dimensions, octaves = 1) {
        this.dimensions = dimensions;
        this.octaves = octaves;
        this.grid = new Grid(this.dimensions);
        this.scaleFactor = 2 * Math.pow(this.dimensions, -0.5);
    }

    /*
    main perlin function.
    calculates perlin noise for the given point
    dimension number of point must be equal to dimension number you give to constructor
    */
    sample(point) {

        //calculate corners of the grid cell that the point falls into
        let gridCorners = [];
        for (const dimensions of point) {
            const min_ = Math.floor(dimensions);
            const max_ = min_ + 1;
            gridCorners.push([min_, max_]);
        }
        //cartesian(...grid_corners) produces each point' coordinates of the grid cell
        let dots = [];
        for (const gridCoords of cartesian(...gridCorners)) {
            //get gradient vector from grid
            let gradient = this.grid.get(gridCoords);

            //calculate offset vector by subtracting grid point from the point we sample
            let offset = [];
            for (let i = 0; i < point.length; i++) {
                offset.push(point[i] - gridCoords[i]);
            }
            //console.log(dotProduct(gradient,offset))

            //save results of dot product to an array
            dots.push(dotProduct(gradient, offset));

        }

        /*
        cartesian function produces results in a way that şast dimension of the lists fluctuate the most like
        [0,0,0] first element of first four lists is same and first element of last four lists is same
        [0,0,1]  
        [0,1,0]
        [0,1,1] for second element it changes once per two lists
        [1,0,0]	
        [1,0,1] last element changes in each list 0->1->0->1...
        [1,1,0]
        [1,1,1]


        hence we can interpolate wrt to first dimension by splitting list into two and zip them 
        and then linear interpolate each points that corresponds to each other.

        We do this process for each dimension once.Hence we can say that this while loops for dimensions times.
        */
        let dimensions = -1;
        while (dots.length != 1) {
            dimensions += 1;
            const half = (dots.length) / 2;
            const s = smoothStep(point[dimensions] - Math.floor(point[dimensions]));

            let new_dots = [];
            for (const x of zip((x, y) => [x, y], dots.slice(0, half), dots.slice(half))) {
                new_dots.push(lerp(s, x[0], x[1]));
            }
            dots = new_dots;

        }
        //return interpolated result
        return dots[0] * this.scaleFactor;
    }

    call(point) {

        let ret = 0;

        //if there are octaves apply them
        for (let i = 0; i < this.octaves; i++) {
            const frequency = 1 << i;
            let scaledPoint = [];
            for (const dimensions of point) {
                scaledPoint.push(dimensions * frequency);
            }
            ret += this.sample(scaledPoint) / frequency;
        }

        ret /= 2 - Math.pow(2, (1 - this.octaves));
        return ret;
    }
}

let p = new Perlin(2, 2);
console.log(p.sample([1.3, 4]));