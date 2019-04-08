import React, {Component} from 'react';
import * as d3 from 'd3';

class BarChart extends Component {

  constructor(props) {
    super(props);

    this.chartRef = React.createRef();
    this.state = {
      data: null
    }
  }
  
  componentDidMount() {
    d3.json('http://localhost:8080/getData')
      .then((data) => {
        data.forEach((d) => {
          d.price = +d['average unit price'].replace(/\$|,/g, '');
          d.revenue = +d['revenue total'].replace(/\$|,/g, '');
          d.units = +d['units sold'];  
        });

        this.setState({
          data
        });
      });
  }

  drawChart() {
    let {data} = this.state;

    if (!data) {
      return;
    }

    d3.select(this.chartRef.current)
        .select('svg').remove();

    const clientWidth = d3.select('body').node().getBoundingClientRect().width;
    const clientHeight = d3.select('body').node().getBoundingClientRect().height;

    const margin = {top: 30, right: 30, bottom: 30, left: 80},
          width = clientWidth - margin.left - margin.right,
          height = (clientHeight * 0.75) - margin.top - margin.bottom;

    let svg = d3.select(this.chartRef.current)
        .append('svg')
        .attr('width', width + margin.top + margin.bottom)
        .attr('height', height + margin.left + margin.right)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let { metric } = this.props;

    if (clientWidth < 700) {
      //horizontal view
      let x = d3.scaleLinear().range([0, (width - margin.right)]),
          y = d3.scaleBand().rangeRound([height, 0]).padding(0.1);

      x.domain([0, d3.max(data, (d) => d[metric])]);
      y.domain(data.map((d) => d.item));

      buildAxes(x,y);

      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', (d) => y(d.item))
        .attr('x', (d) => 0)
        .attr('height', y.bandwidth())
        .attr('width', (d) => x(d[metric]))
        .attr('fill', 'steelblue');

    } else {
      //default view
      let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
          y = d3.scaleLinear().rangeRound([height, 0]);

      x.domain(data.map((d) => d.item));
      y.domain([0, d3.max(data, (d) => d[metric])]);

      buildAxes(x,y);

      svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => x(d.item))
        .attr('y', (d) => y(d[metric]))
        .attr('width', x.bandwidth())
        .attr('height', (d) => height - y(d[metric]))
        .attr('fill', 'steelblue');
    }


    function buildAxes(x,y) {
      //xAxis
      svg.append('g')
          .attr('class', 'axis axis--x')
          .attr('transform', 'translate(0,' + height + ')')
          .call(d3.axisBottom(x).tickSizeOuter(0).tickSize(0));

      //yAxis
      svg.append('g')
          .attr('class', 'axis axis--y')
          .call(d3.axisLeft(y).tickSizeOuter(0).tickSize(0));
    }
  }

  render() {
    return (
      <div ref={this.chartRef}></div>
    )
  }

  componentDidUpdate() {
    this.drawChart();
  }
}

export default BarChart;