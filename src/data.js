import CSV from './csv';
import config from './config';

export const mapUnique = (list, map) => {
    const resultMap = {};
    list.forEach(item => resultMap[map(item)] = 1);
    return Object.keys(resultMap);
};

// Store column indices indexed by name
export const columnIndices = {};
CSV.headers.map((h, i) => columnIndices[h] = i);

// Convert numeric columns to number
const {columnsToFloat} = config;
const baseData = CSV.data.map(
    (row) =>
        row.map((cell, index) =>
            columnsToFloat[index] ? parseFloat(cell) : cell),
);

// Add extra measures to data
const moreMeasures = config.moreMeasures(columnIndices),
      measureFuncs = Object.values(moreMeasures),
      expandRow    = row => measureFuncs.map(fn => fn(row));
export const data = baseData.map(
    (row) => [...row, ...expandRow(row)],
);

Object.keys(moreMeasures).forEach((m, i) => {
    columnIndices[m] = CSV.headers.length + i;
});

// Make records from rows
const headers = [...CSV.headers, ...config.extraMeasures];
export const records = data.map(
    (row) => {
        const record = {};
        headers.forEach((header, index) => record[header] = row[index]);
        return record;
    },
);

// Calculate maxima for each measure
export const minMax = {};
const columns = config.measures.map(m => headers.indexOf(m));
columns.forEach((c, i) => {
    minMax[config.measures[i]] = {
        max: Math.max(...data.map(d => d[c]).filter(x => Number.isFinite(x))),
        min: Math.min(...data.map(d => d[c]).filter(x => Number.isFinite(x))),
    };
});

// Create list of all municipalities
const municipalityColumn = headers.indexOf(config.municipalityColumn);
export const municipalities = mapUnique(data, d => d[municipalityColumn]).sort();

export const years = [];
records.forEach(d => years.indexOf(d.Year) < 0 ? years.push(d.Year) : null);

export {headers};
