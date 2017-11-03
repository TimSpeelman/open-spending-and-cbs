import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Table, {TableHead, TableBody, TableRow, TableCell} from 'material-ui/Table';
import Switch from 'material-ui/Switch';
import Checkbox from 'material-ui/Checkbox';
import SimpleMenu from './SimpleMenu';
import {Chart} from 'react-google-charts';
import CSV from './csv';
import Filter from './Filter';
import {data, minMax, municipalities, records, columnIndices, headers, years, mapUnique} from './data';
import config from './config';

/** Whether a is in a given range (percentage) of b */
const withinRange = (a, b, range) => a < b * (1 + range / 100) && a > b * (1 - range / 100);

class Focus extends Component {
    state = {
        municipality : 'Enschede',
        selectedMuns : ['Enschede', 'Groningen (gemeente)', 'Lansingerland'],
        freeSelect   : false,
        range        : 5,
        measure      : config.measures[0],
        limit        : 5,
        data         : [],
        byYear       : [],
        year         : 2010,
        startFromZero: false,

    };

    updateData() {
        const {municipality, freeSelect, measure, limit, year, selectedMuns} = this.state;
        let candidates;

        if (freeSelect) {
            candidates = records.filter(r => selectedMuns.indexOf(r.Municipality) >= 0 && r.Year === parseInt(year));
        } else {
            // Get the municipality we focus on
            const focus = records.find(r => r.Municipality === municipality && r.Year === parseInt(year));

            // Get all candidates that match it
            candidates = records.filter(r => /*withinRange(r[measure], focus[measure], range) && */r.Year === parseInt(year));

            // Sort on ascending absolute distance
            candidates.sort((a, b) => Math.abs(a[measure] - focus[measure]) - Math.abs(b[measure] - focus[measure]));

            console.log("Sorted", candidates);

            candidates.forEach(c => console.log(c.Municipality, c.Population))

            // Limit
            candidates = candidates.splice(0, limit);
        }

        // Get all municipalities
        const muns = candidates.map(d => d.Municipality);

        // Get all their corresponding (other) years
        const byYears = muns.map(mun => {
            const row = {
                Municipality: mun,
                byYear      : {},
            };
            const others = records.filter(r => r.Municipality === mun);
            others.forEach(record => row.byYear[record.Year] = record);
            return row;
        });

        this.setState({
            data  : candidates,
            byYear: byYears,
        });
    }

    componentDidMount() {
        this.updateData();
    }

    render() {
        const {
                  municipality,
                  selectedMuns,
                  range,
                  measure,
                  limit,
                  data,
                  byYear,
                  freeSelect,
                  startFromZero,
                  year,
              } = this.state;

        const calcWidth = (value, add) => ((add || 0) + .5 * ((value + '').length + 1)) + 'em';

        const colWidth = 100 / (1 + config.measures.length * years.length);

        console.log("Data", data);

        const combinator = (i, l, comb) => i < l - 2 ? ', ' : (i === l - 2 ? comb : '');

        return (
            <div className="App">
                <h1 className="App-title">JK - Adding Context to Open Spending Data</h1>

                <div><Switch checked={freeSelect} onChange={(e, c) => this.setFreeSelect(c)}/> Free Selection
                </div>

                {freeSelect ? (
                        <div>
                            <p>Showing
                                {this.state.selectedMuns.map((m, i) =>
                                    <span key={m}>
                                        <span className={'selected-mun'}>
                                            {m}

                                            <span className={'delete-icon'}
                                                  onClick={() => this.removeCity(m)}>&times;</span>
                                        </span>
                                        {combinator(i, this.state.selectedMuns.length, 'and')}
                                    </span>,
                                )}

                            </p>
                            <p>
                                (add
                                <select onChange={(e, checked) => e.target.value !== 'none' ? this.addCity(e.target.value) : null}
                                        style={{width: calcWidth(municipality, 5)}} value={'none'}>
                                    <option value={'none'}>municipality</option>
                                    {municipalities.filter(m => selectedMuns.indexOf(m) < 0).map(m => <option key={m}
                                                                                                              value={m}>{m}</option>)}
                                </select>
                                )
                            </p>
                        </div>
                    )
                    :
                    (
                        <p>Showing at most
                            <input type={'text'}
                                   onChange={(e) => this.setLimit(e.target.value)}
                                   value={limit}
                                   step={1}
                                   style={{width: calcWidth(limit)}}/>
                            municipalities with a
                            <select onChange={(e, checked) => this.setMeasure(e.target.value)}
                                    style={{width: calcWidth(measure, 2)}} value={measure}>
                                {[...config.measures, ...config.extraMeasures].map(m => <option key={m}
                                                                                                value={m}>{m}</option>)}
                            </select>
                            closest to
                            <select onChange={(e, checked) => this.setCity(e.target.value)}
                                    style={{width: calcWidth(municipality, 2)}} value={municipality}>
                                {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            in the year
                            <select onChange={(e, checked) => this.setYear(e.target.value)}
                                    style={{width: calcWidth(year, 2)}} value={year}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                            .
                        </p>
                    )}

                <div><Switch checked={startFromZero} onChange={(e, c) => this.setState({startFromZero: c})}/> Start from
                    Zero
                </div>

                {[...config.measures, ...config.extraMeasures].map(measure => {
                    if (data.length === 0) return '';
                    const chartData = [['Municipality', ...years.map(y => y + '')], ...(byYear.map(row => [row.Municipality, ...years.map(year => row.byYear[year] ? row.byYear[year][measure] : 0)]))];

                    console.log("Chart Data", chartData);

                    return (
                        <div style={{
                            width: (data.length < 6 ? (100 / config.measures.length) : 100) + '%',
                            float: 'left',
                        }} key={measure}>
                            <h2>{measure}</h2>
                            <p>{config.explanation[measure]}</p>
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
                                        minValue : startFromZero ? 0 : '',
                                    },
                                }}
                                chartType="ColumnChart"
                                data={chartData}
                                graph_id={measure + 'Chart'}
                                width="100%"
                                legend_toggle={false}
                            />
                        </div>

                    );
                })}

                <h2>Tabular View</h2>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{width: colWidth + '%'}}/>
                            {years.map(y =>
                                <TableCell style={{textAlign: 'center', fontWeight: 'bold'}}
                                           key={y}
                                           colSpan={config.measures.length}>{y}</TableCell>,
                            )
                            }
                        </TableRow>

                        <TableRow>
                            <TableCell style={{width: colWidth + '%'}}>Municipality</TableCell>
                            {years.map(y =>
                                config.measures.map(m => (
                                    <TableCell style={{width: colWidth + '%'}}
                                               numeric
                                               key={y + '-' + m}>{m}</TableCell>)),
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {byYear.map(row => (
                            <TableRow key={row.Municipality}>
                                <TableCell>{row.Municipality}</TableCell>
                                {years.map(year =>
                                    config.measures.map(meas => (
                                        <TableCell numeric
                                                   key={meas}>{row.byYear[year] ? row.byYear[year][meas] : 'N/A'}</TableCell>)),
                                )}
                            </TableRow>))}
                    </TableBody>
                </Table>

            </div>

        );
    }

    setFreeSelect(value) {
        this.setState({
            freeSelect: value,
        }, () => this.updateData());
    }

    removeCity(city) {
        this.setState({
            selectedMuns: this.state.selectedMuns.filter(m => m !== city),
        }, () => this.updateData());
    }

    addCity(city) {
        this.setState({
            selectedMuns: [...this.state.selectedMuns, city],
        }, () => this.updateData());
    }

    setCity(city) {
        console.log("Setting city", city);
        this.setState({
            municipality: city,
        }, () => this.updateData());
    }

    setYear(year) {
        this.setState({
            year: year,
        }, () => this.updateData());
    }

    setLimit(x) {
        this.setState({
            limit: parseInt(x) || 0,
        }, () => this.updateData());
    }

    setRange(x) {
        this.setState({
            range: parseInt(x) || 0,
        }, () => this.updateData());
    }

    setMeasure(x) {
        this.setState({
            measure: x,
        }, () => this.updateData());
    }
}

export default Focus;
