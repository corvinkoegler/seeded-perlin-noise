const p = new Perlin(2, 4);
const svg = document.getElementById('svg');
const width = window.innerWidth;
const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');

const windowWidth = window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

const windowHeight = window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

svg.setAttribute("viewBox", `0 0 ${300} ${300}`);
rect.classList.add('datapoint');

let yOffset = 150;
let x = 0;
let scaleFactor = 100;

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

// initial fill
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
    while (pointer <= data.length -2) {
            data[pointer].style.y = data[pointer +1].style.y;
            pointer ++;
    }

    data[pointer].style.y = peGen.next().value;
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

/*for (let i = 0; i < windowWidth; i+=0.05) {
    let point = rect.cloneNode(true);
    point.style.x = i;
    point.style.y = data[i];

    svg.appendChild(point);
}*/

/*for (let j = 0; j < 1500; j += 500) {
    for (let i = width; i > 0; i -= 0.1) {
        let point = rect.cloneNode(true);
        point.classList.add('datapoint');
        point.style.x = i;
        point.style.y = (p.sample([i / 10, j / 10]) + yOffset) * 10;
        //point.style.y = (Math.random() + yOffset) * 10;

        svg.appendChild(point);
    }
}*/