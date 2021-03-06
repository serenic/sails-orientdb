/**
 * Run integration tests
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the appropriate version
 * of Waterline.  Only the interfaces explicitly
 * declared in this adapter's `package.json` file
 * are tested. (e.g. `queryable`, `semantic`, etc.)
 */


/**
 * Module dependencies
 */

var util = require('util');
var mocha = require('mocha');
var log = require('debug-logger')('sails-orientdb:test');
var TestRunner = require('waterline-adapter-tests');
var Adapter = require('../../');

var argvDatabaseType;
if(process.argv.length > 2){
  argvDatabaseType = process.argv[2];
}

var config = require('../test-connection.json');
config.database = 'waterline-test-integration';  // We need different DB's due to https://github.com/orientechnologies/orientdb/issues/3301
config.options.databaseType = argvDatabaseType || process.env.DATABASE_TYPE || config.options.databaseType || Adapter.defaults.options.databaseType;
config.schema = process.env.SCHEMA !== undefined ? parseInt(process.env.SCHEMA) : Adapter.defaults.schema;


// Grab targeted interfaces from this adapter's `package.json` file:
var package = {};
var interfaces = [];
try {
    package = require('../../package.json');
    interfaces = package['waterlineAdapter'].interfaces;
}
catch (e) {
    throw new Error(
    '\n'+
    'Could not read supported interfaces from `waterlineAdapter.interfaces`'+'\n' +
    'in this adapter\'s `package.json` file ::' + '\n' +
    util.inspect(e)
    );
}


log.info('Testing `' + package.name + '`, a Sails/Waterline adapter.');
log.info('Running `waterline-adapter-tests` against ' + interfaces.length + ' interfaces...');
log.info('( ' + interfaces.join(', ') + ' )');
log.info('With database type: ' + config.options.databaseType);
log.info('With schema:        ' + !!config.schema);
console.log();
log.info('Latest draft of Waterline adapter interface spec:');
log.info('https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md');
console.log();




/**
 * Integration Test Runner
 *
 * Uses the `waterline-adapter-tests` module to
 * run mocha tests against the specified interfaces
 * of the currently-implemented Waterline adapter API.
 */
new TestRunner({

    // Load the adapter module.
    adapter: Adapter,

    // Default adapter config to use.
    config: config,

    // The set of adapter interfaces to test against.
    // (grabbed these from this adapter's package.json file above)
    interfaces: interfaces,
    
    // Mocha options
    // reference: https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically
    mocha: {
      timeout: 25000,
      reporter: 'spec',
      //grep: 'should return model instances'
    },
    
    mochaChainableMethods: {
      //invert: true
    },
    
    // Return code -1 if any test failed
    failOnError: true
    
    // Most databases implement 'semantic' and 'queryable'.
    //
    // As of Sails/Waterline v0.10, the 'associations' interface
    // is also available.  If you don't implement 'associations',
    // it will be polyfilled for you by Waterline core.  The core
    // implementation will always be used for cross-adapter / cross-connection
    // joins.
    //
    // In future versions of Sails/Waterline, 'queryable' may be also
    // be polyfilled by core.
    //
    // These polyfilled implementations can usually be further optimized at the
    // adapter level, since most databases provide optimizations for internal
    // operations.
    //
    // Full interface reference:
    // https://github.com/balderdashy/sails-docs/blob/master/contributing/adapter-specification.md
});



