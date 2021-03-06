const tap = require('tap');
const sinon = require('sinon');

const apdsIndex = require('./index');

tap.test('apd activities endpoint setup', async endpointTest => {
  const app = {};
  const postEndpoint = sinon.spy();
  const putEndpoint = sinon.spy();

  apdsIndex(app, postEndpoint, putEndpoint);

  endpointTest.ok(
    postEndpoint.calledWith(app),
    'apd activity POST endpoint is setup with the app'
  );
  endpointTest.ok(
    putEndpoint.calledWith(app),
    'apd activity PUT endpoint is setup with the app'
  );
});
