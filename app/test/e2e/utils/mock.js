/* eslint-disable */
const nock = require('nock');

const createMockQueryCartoDB = ({ rows = [], query }) => {
    nock(`https://${process.env.CARTODB_USER}.cartodb.com`, {
        encodedQueryParams: true
    })
        .get(`/api/v2/sql`)
        .query({
            q: query
        })
        .reply(200, {
            rows,
            time: 0.349,
            fields: {
                geojson: {
                    type: 'string'
                },
                area_ha: {
                    type: 'number'
                },
                name: {
                    type: 'string'
                }
            },
            total_rows: rows.length
        });
};

module.exports = { createMockQueryCartoDB };
