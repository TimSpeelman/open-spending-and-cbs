const rnd = (x, p) => Math.round(x * p) / p;
export default {
    dimensions        : ['Municipality', 'Year'],
    measures          : ['Population', 'Crime', 'Finance'],
    explanation       : {
        'Population': 'Number of residents',
        'Crime'     : 'Number of crimes registered',
        'Finance'   : 'Euros spent on Law & Order (x1000)',
        'Crime/Population' : 'Number of crimes per resident',
        'Finance/Crime' : 'Number of euros spent per registered crime',
        'Finance/Population' : 'Number of euros spent per resident'
    },
    extraMeasures     : ['Crime/Population', 'Finance/Crime', 'Finance/Population'],
    municipalityColumn: 'Municipality',
    columnsToFloat    : [false, true, true, true, true],
    moreMeasures      : indices => ({
        'Crime/Population': d => (rnd(d[indices.Crime] / d[indices.Population], 1000)) || 0,
        'Finance/Crime': d => (rnd(1000 * d[indices.Finance] / d[indices.Crime], 1000)) || 0, // from thousands to euros
        'Finance/Population': d => (rnd(1000 * d[indices.Finance] / d[indices.Population], 1000)) || 0,
    }),
};
