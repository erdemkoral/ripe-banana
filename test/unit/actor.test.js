const assert = require('chai').assert;
const Actor = require('../../lib/models/actor');

describe( 'Actor model', () => {
    it('check if good model', () => {
        const actor = new Actor({
            name: 'George Clooney',
            dob: 1961,
            pob: 'Lexington, KY'
        });
        assert.equal(actor.validateSync(), undefined);
    });
});