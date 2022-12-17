#!/usr/bin/env node

import { program } from "commander";
import { readConfig } from "./config.js";
import { getCommanders } from "./input.js";
import { track } from "./tracker.js";

program
  .name('nct')
  .description('cli to help keep up with edhrec new card suggestions')
  .version('0.0.1')

program.command('track')
  .description('get latest updates on new cards for configured commanders')
  // .option('-s, --separator <char>', 'separator character', ',')
  .action(async (str, options) => {
    const config = readConfig()
    if (!config) {
      return
    }
    console.log(config)

    const commanders = await getCommanders({config})
    await track(commanders)
  });

program.parse();

