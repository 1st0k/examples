#!/usr/bin/env node

const program = require('./dist/index.js');

async function start() {
  console.log(await program.main());
}

start();
