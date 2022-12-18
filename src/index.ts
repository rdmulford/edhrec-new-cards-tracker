#!/usr/bin/env node

import { program } from "commander";
import { TrackConfig } from "./config.js";
import { constructPath, printJson, readJson, writeJson } from "./file.js";
import { getCommanders, confirm} from "./input.js";
import { track } from "./tracker.js";

program
  .name('nct')
  .description('cli to help keep up with edhrec new card suggestions')
  .version('0.0.1')

program.command('track')
  .description('get latest updates on new cards for configured commanders')
  .action(async (str, options) => {
    // load config
    const configPath = constructPath('.ntc/track-config.json')
    const resultPath = constructPath('.ntc/result.json')

    let config: TrackConfig = readJson(configPath)
    printJson(config)

    // if config not defined, create an empty config object to fill values into
    if (!config) {
      console.log("No existing config found")
      config = {
        resultPath,
        commanders: []
      }
    }

    // check/add more commanders
    let addCommanders: boolean = true
    if (config.commanders) {
      addCommanders = await confirm("Would you like to add/reset commander list?")
    }
    if (addCommanders) {
      let reset: boolean = false
      if (config.commanders) {
        reset = await confirm("Reset commander list from scratch?")
      }
      config.commanders = await getCommanders({existingCommanders: config?.commanders, reset})
    }

    if (!config.commanders) {
      console.log("Commander list empty - nothing to do! Exiting...")
      return
    }

    // get tracking results
    await track(config)

    // save new config
    writeJson(configPath, config)
  });

program.parse();

