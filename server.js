'use strict';
var express = require('express');
var app = require('./app');
const config = require('./config')
var server = express();
server.use('/', app);
server.listen(config.port, () => console.log("server listening on "+config.port));
