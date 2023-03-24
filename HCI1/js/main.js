/*
*    main.js
*    6.7 - jQuery UI slider
*/

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

let time = 0
let interval
let formattedData

// Tooltip
const tip = d3.tip()
  .attr('class', 'd3-tip')
	.html(d => {
		let text = `<strong>Model:</strong> <span style='color:red;text-transform:capitalize'>${d.Model}</span><br>`
		text += `<strong>Origin:</strong> <span style='color:red;text-transform:capitalize'>${d.Origin}</span><br>`
		text += `<strong>Cylinders:</strong> <span style='color:red'>${d3.format(".2f")(d.Cylinders)}</span><br>`
		text += `<strong>Horsepower:</strong> <span style='color:red'>${d3.format(".0f")(d.Horsepower)}</span><br>`
		text += `<strong>MPG:</strong> <span style='color:red'>${d3.format(",.0f")(d.Mpg)}</span><br>`
		text += `<strong>Weight:</strong> <span style='color:red'>${d3.format(",.0f")(d.Weight)}</span><br>`
		return text
	})
g.call(tip)
// Scales
const x = d3.scaleLog()
	.base(10)
	.range([0, WIDTH])
	.domain([16,80])
const y = d3.scaleLinear()
	.range([HEIGHT, 0])
	.domain([0, 250])
const area = d3.scaleLinear()
	.range([0, 20])
	.domain([10, 800])
const continentColor = d3.scaleOrdinal(d3.schemePastel1)

// Labels
const xLabel = g.append("text")
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("MPG Per Km/l")
const yLabel = g.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", -40)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("Housepowe")
const timeLabel = g.append("text")
	.attr("y", HEIGHT - 10)
	.attr("x", WIDTH - 40)
	.attr("font-size", "40px")
	.attr("opacity", "0.4")
	.attr("text-anchor", "middle")
	.text("70")

// X Axis
const xAxisCall = d3.axisBottom(x)
	.tickValues([20, 40, 60])
	.tickFormat(d3.format(""));
g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
	.call(xAxisCall)

// Y Axis
const yAxisCall = d3.axisLeft(y)
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall)

const continents = ["US", "Japan", "Europe", "Korea"]

const legend = g.append("g")
	.attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 125})`)

continents.forEach((Origin, i) => {
	const legendRow = legend.append("g")
		.attr("transform", `translate(0, ${i * 20})`)

	legendRow.append("rect")
    .attr("width", 10)
    .attr("height", 10)
		.attr("fill", continentColor(Origin))

	legendRow.append("text")
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(Origin)
})
d3.json("data/carDataset.json").then(function(data){
	// clean data
	formattedData = data.map(year => {
		return year["countries"].filter(Model => {
			const dataExists = (Model.Horsepower && Model.Mpg)
			return dataExists
		}).map(Model => {
			Model.Horsepower = Number(Model.Horsepower)
			Model.Mpg = Number(Model.Mpg)
			return Model
		})
	})

	// first run of the visualization
	update(formattedData[0])
})

function step() {
	// at the end of our data, loop back
	time = (time < 20 ) ? time + 1 : 0
	update(formattedData[time])
}
$("#play-button")
	.on("click", function() {
		const button = $(this)
		if (button.text() === "Play") {
			button.text("Pause")
			interval = setInterval(step, 500)
		}
		else {
			button.text("Play")
			clearInterval(interval)
		}
	})

$("#reset-button")
	.on("click", () => {
		time = 0
		update(formattedData[0])
	})

$("#continent-select")
	.on("change", () => {
		update(formattedData[time])
	})

$("#date-slider").slider({
	min: 70,
	max: 85,
	step: 1,
	slide: (event, ui) => {
		time = ui.value - 70
		update(formattedData[time])
	}
})

function update(data) {
	// standard transition time for the visualization
	const t = d3.transition()
		.duration(100)

	const continent = $("#continent-select").val()

	const filteredData = data.filter(d => {
		if (continent === "all") return true
		else {
			return d.Origin == continent
		}
	})

	// JOIN new data with old elements.
	const circles = g.selectAll("circle")
		.data(filteredData, d => d.Model)

	// EXIT old elements not present in new data.
	circles.exit().remove()

	// ENTER new elements present in new data.
	circles.enter().append("circle")
		.attr("fill", d => continentColor(d.Origin))
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(circles)
		.transition(t)
			.attr("cy", d => y(d.Horsepower))
			.attr("cx", d => x(d.Mpg))
			.attr("r", d => area(d.Weight)/2.352146)
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

	// update the time label
	var c = time + 70
	if(c >= 78){c++}
	if(c >= 81){c++}
	if(c >= 83){c++}
	if(c >= 84){c++}
	if(c >= 87){c++}
	timeLabel.text(String(c))
	$("#year")[0].innerHTML = String(c)
	$("#date-slider").slider("value", Number(time+70))
}