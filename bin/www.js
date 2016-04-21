#!/usr/bin/env node

/**
 * 开发环境，通过配置不同的开发环境，启用或禁用对应的某些功能，例如Console的输出等
 * development、production
 */
process.env.DEBUG = '*:';
process.env.NODE_ENV = 'development';

const app = require('../app');
const debug = require('debug')('TmnlHUB:server');

app.start();