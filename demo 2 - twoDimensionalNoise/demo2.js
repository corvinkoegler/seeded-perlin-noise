const sr = new SeededRandom(1234567); // seededRandom Instance needs to exist before the Perlin one
const p = new Perlin(2, sr, 1);
const svg = document.getElementById('svg');
const width = window.innerWidth;
const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');

const windowWidth = window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

const windowHeight = window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

// performance reasons...
svg.setAttribute("viewBox", `0 0 ${300} ${300}`); // svg.setAttribute("viewBox", `0 0 ${windowWidth} ${windowHeight}`);
rect.classList.add('datapoint');

let yOffset = 150; // offset the y-coordinate
let x = 0; // sync output of both generators to avoid duplicates
let scaleFactor = 100; // amplify final values

function* perlinNoiseGenerator() {
    while (true) {
        let value = yOffset + (p.sample([1, x / 100]) * scaleFactor);
        x++;
        yield value;
    }
}
let peGen = perlinNoiseGenerator();

// generate next datapoint
function* elementGenerator(template, yOffset) {

    while (true) {
        let point = template.cloneNode(true);
        point.style.x = x;
        point.style.y = yOffset + (p.sample([1, x / 100]) * scaleFactor); // perlin noise
        //point.style.y = yOffset + Math.random() * 300; // true randomness
        x++;

        yield point;
    }
};
let elGen = elementGenerator(rect, yOffset);

// initial fill with extra values
let generatePoints = (surplus) => {
    let result = [];
    for (let i = 0; i < windowWidth + surplus; i += 1) {
        result.push(elGen.next().value);
    }
    return result;
}

function update(data) {
    let pointer = 0;

    //data[0].style.y = data[-1].style.y;
    while (pointer <= data.length - 2) {
        data[pointer].style.y = data[pointer + 1].style.y;
        pointer++;
    }

    data[pointer].style.y = sr.getIntervalValue();
}

function main() {
    let data = generatePoints(40);

    for (element in data) {
        svg.appendChild(data[element]);
    }

    //console.log(data[data.length - 1]);
    setInterval(function () {
        // updating
        update(data);
        //changing scale

    }, 20);


}

main();