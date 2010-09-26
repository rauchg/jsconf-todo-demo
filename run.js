// require.paths are needed until these projects become stable in npm
require.paths.unshift(__dirname + '/support/express/lib/',
                      __dirname + '/support/express/support/connect/lib',
                      __dirname + '/support/socket.io/lib/',
                      __dirname + '/support/nodestream/lib/',
                      __dirname + '/support/mongoose/',
                      __dirname + '/support/jade/lib/');
                      
require('./server');