const GeoStoreService = require('services/geoStoreService');

describe('GeoStore Service test', function () {


    const pointGeometry = {
        type: "Point",
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
        type: "Unknown",
        coordinates: [-1.6596221923828125, 50.91255835156951]
    };

    it('Get Point Geometry Type', function () {
        let geometry_type = GeoStoreService.getGeometryType(pointGeometry);
        geometry_type.should.be.exactly(1).and.be.a.Number();
    });

    it('Get Polygon Geometry Type', function () {
        let geometry_type = GeoStoreService.getGeometryType(polygonGeometry);
        geometry_type.should.be.exactly(3).and.be.a.Number();
    });

    it('Test unknown geometry', function () {
        try {
            GeoStoreService.getGeometryType(invalidGeometry)
        } catch (err) {
            const expected = 'Unknown geometry type: Unknown';
            err.message.should.equal(err.message, expected)
        }

    });
});
