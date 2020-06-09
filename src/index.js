import './styles/app.css';
import * as d3 from 'd3';
import drugsData from './drugs.csv';
import * as topojson from 'topojson';

//Constants
const stateTopo =
  'https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json';
const width = 975;
const height = 610;

const years = getYears(drugsData);
const stats = Object.keys(drugsData[0])
  .filter((stat) => stat !== 'State')
  .filter((stat) => stat !== 'Year');
// Global Variables
let year = 2002;
let stat = 'Population.12-17';

// Draw map and fill depending on selected variables
function drawMap(mapData, data, year, stat) {
  let yearData = data.filter((d) => d.Year === year);
  let geoData = topojson.feature(mapData, mapData.objects.states).features;

  let path = d3.geoPath();
  let mergedData = mergeDataSets(geoData, yearData);
  let scale = d3
    .scaleLinear()
    .domain([0, d3.max(yearData, (d) => d[stat])])
    .range(['#3d677b', '#9a4832']);

  let svg = d3
    .select('svg')
    .attr('width', width)
    .attr('height', height)
    .selectAll('.state')
    .data(mergedData);

  svg
    .enter()
    .append('path')
    .classed('state', true)
    .merge(svg)
    .transition()
    .duration(500)
    .ease(d3.easeCircle)
    .attr('d', path)
    .attr('fill', (d) => scale(d.stats[stat]));
}

// get availible years from dataset
function getYears(data) {
  let years = data.map((d) => d.Year);

  let yearSet = new Set(years);

  return Array.from(yearSet);
}

// create a select element with availible years
function createSelectYear() {
  d3.select('#selectYear')

    .selectAll('option')
    .data(years)
    .enter()
    .append('option')
    .text((d) => d)
    .property('value', (d) => d);
}

// create a select element with availible data points
function createSelectStat() {
  d3.select('#selectStat')
    .selectAll('option')
    .data(stats)
    .enter()
    .append('option')
    .text((d) => d)
    .property('value', (d) => d);
}

// merge topojson map with data set
function mergeDataSets(mapData, drugData) {
  mapData.forEach((state, index) => {
    state.stats = drugData[index];
  });
  return mapData;
}

//get topo json data
d3.json(stateTopo).then((data) => {
  drawMap(data, drugsData, year, stat);

  //Event listeners for select boxs
  d3.select('#selectStat').on('change', () => {
    stat = d3.event.target.value;
    drawMap(data, drugsData, year, stat);
  });

  d3.select('#selectYear').on('change', () => {
    year = Number(d3.event.target.value);
    drawMap(data, drugsData, year, stat);
  });
});

createSelectYear();
createSelectStat();
