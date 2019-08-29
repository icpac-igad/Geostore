const GeoStoreService = require('services/geoStoreService');

describe('GeoStore Service test', () => {

    const pointGeometry = {
        type: 'Point',
        coordinates: [-1.6596221923828125, 50.91255835156951]
    };

    const polygonGeometry = {
        type: 'Polygon',
        coordinates: [
            [
                [-130.0, 52.0],
                [-131.0, 52.0],
                [-131.0, 53.0],
                [-130.0, 53.0],
                [-130.0, 52.0]
            ]
        ]
    };

    const invalidGeometry = {
        type: 'Unknown',
        coordinates: [-1.6596221923828125, 50.91255835156951]
    };

    it('Get Point Geometry Type', () => {
        const geometryType = GeoStoreService.getGeometryType(pointGeometry);
        geometryType.should.equal(1).and.be.a('number');
    });

    it('Get Polygon Geometry Type', () => {
        const geometryType = GeoStoreService.getGeometryType(polygonGeometry);
        geometryType.should.equal(3).and.be.a('number');
    });

    it('Test unknown geometry', () => {
        try {
            GeoStoreService.getGeometryType(invalidGeometry);
        } catch (err) {
            const expected = 'Unknown geometry type: Unknown';
            err.message.should.equal(err.message, expected);
        }

    });
});
