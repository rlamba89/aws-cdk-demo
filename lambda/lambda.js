const express = require('@vendia/serverless-express')
var app = require('./app')

exports.handler = express({app})