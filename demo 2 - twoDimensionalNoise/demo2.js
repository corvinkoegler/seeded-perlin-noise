const sr = new SeededRandom(1234567); // seededRandom Instance needs to exist before the Perlin one
const p = new Perlin(2, sr, 10);
const svg = document.getElementById('svg');
const rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');

const windowWidth = window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;

const windowHeight = window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;

svg.setAttribute("viewBox", `0 0 ${windowWidth} ${windowHeight}`);

function createGrid(width, height, ratio, zoom) {
    for (let i = 0; i <= height; i += ratio) {
        for (let j = 0; j <= width; j += ratio) {
            let perlinValue = p.sample([i/zoom, j/zoom]);
            let currentRect = rect.cloneNode(true);
            currentRect.style.y = i;
            currentRect.style.x = j;
            currentRect.style.width = ratio;
            currentRect.style.height = ratio;
            let mappedPerlinValue = ((perlinValue - -1) * (1 - 0)) / (1 - -1) + 0;
            console.log(Math.floor(mappedPerlinValue));
            currentRect.style.fill = `rgba(100,100,100,${mappedPerlinValue})`;
            svg.appendChild(currentRect);
        }
    }
}

createGrid(windowWidth, windowHeight, 5, 120);
