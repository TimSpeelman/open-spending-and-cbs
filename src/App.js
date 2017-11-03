import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Table, {TableHead, TableBody, TableRow, TableCell} from 'material-ui/Table';
import SimpleMenu from './SimpleMenu';
import {Chart} from 'react-google-charts';
import CSV from './csv';
import Filter from './Filter';
import {data, minMax, municipalities, records, columnIndices, headers} from './data';
import config from './config';

class App extends Component {
    state = {
        primaryDimension      : 'Municipality',
        selectedMunicipalities: ['Ameland'],
        selectedMeasures      : ['Finance', 'Crime'],
        filters               : [
            {param: 'Population', min: 100000, max: 1000000},
        ],
    };

    render() {
        const {
                  selectedMunicipalities,
                  selectedMeasures,
                  primaryDimension,
              } = this.state;
        const minMaxMeasures = minMax;
        const filteredData = data
            .filter(d => this.state.filters.reduce(
                (pass, f) => pass && f.min < d[columnIndices[f.param]] && d[columnIndices[f.param]] < f.max, true))

        // Only keep records for the selected municipalities
        const tableRecords = records.filter(r => selectedMunicipalities.indexOf(r[config.municipalityColumn]) >= 0);

        const keepColumns = headers.map(h => h === primaryDimension || selectedMeasures.indexOf(h) >= 0);
        const chartSeries = filteredData.map(row => row.filter((cell, index) => keepColumns[index]));
        console.log(filteredData);

        return (
            <div className="App">
                <h1 className="App-title">Adding Context To OpenSpending</h1>

                <Filter
                    params={[...config.measures, ...config.extraMeasures]}
                    minmax={minMaxMeasures}
                    onSubmit={this.addFilter.bind(this)}/>

                <SimpleMenu label={'Add City'}
                            items={municipalities}
                            onSelect={this.addCity.bind(this)}/>

                <h2>Filters</h2>
                <ul>
                    {this.state.filters.map((f, i) => (
                        <li>
                            {f.param}: from {f.min} to {f.max}
                            <a href={'#'} onClick={() => this.dropFilter(i)}>&times;</a>
                        </li>))}
                </ul>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Param</TableCell>
                            {selectedMunicipalities.map(c => (
                                <TableCell key={c} numeric>{c} <a href={'#'}
                                                                  onClick={() => this.removeCity(c)}>x</a></TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedMeasures.map(m => (
                            <TableRow key={m}>
                                <TableCell>{m}</TableCell>
                                {selectedMunicipalities.map(
                                    c => <TableCell
                                        key={c}
                                        numeric>{tableRecords.find(d => d[config.municipalityColumn] === c)[m]}</TableCell>)}
                            </TableRow>))}
                    </TableBody>
                </Table>

                <SimpleMenu label={'Pick Measure'}
                            items={[...config.measures, ...config.extraMeasures]}
                            onSelect={this.addMeasure.bind(this)}/>
                <Chart
                    options={{
                        animation : {
                            duration: 1000,
                            easing  : 'out',
                        },
                        showLegend: false,
                        vAxis     : {
                            textStyle: {
                                // fontSize: 8
                            },
                        },
                    }}
                    chartType="BarChart"
                    data={[[this.state.primaryDimension, ...this.state.selectedMeasures], ...chartSeries]}
                    graph_id="ScatterChart"
                    width="100%"
                    height="4500px"
                    legend_toggle={false}
                />
            </div>
        );//data={[['City', this.state.chartParam], ...Object.entries(chartSeries)]}
    }

    addCity(city) {
        this.setState({
            selectedMunicipalities: [...this.state.selectedMunicipalities, city],
        });
    }

    dropCity(city) {
        this.setState({
            selectedMunicipalities: this.state.selectedMunicipalities.filter(c => c !== city),
        });
    }

    addMeasure(measures) {
        this.setState({
            selectedMeasures: [...this.state.selectedMeasures, measures,],
        });
    }

    dropMeasure(measures) {
        this.setState({
            selectedMeasures: this.state.selectedMeasures.filter(m => m !== measures),
        });
    }

    addFilter(param, min, max) {
        this.setState({
            filters: [...this.state.filters, {param, min, max}],
        });
    }

    dropFilter(index) {
        this.setState({
            filters: this.state.filters.filter((f, i) => i !== index),
        });
    }
}

export default App;
