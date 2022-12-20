#!/usr/bin/env node

import { program } from "commander";
import { AppConfig } from "./types/index.js";
import { constructPath, printJson, readJson, writeJson } from "./file.js";
import { getCommanders, confirm } from "./input.js";
import { track } from "./tracker.js";

program
  .name("nct")
  .description("cli to help keep up with edhrec new card suggestions")
  .version("0.0.1");

program
  .command("track")
  .description("get latest updates on new cards for configured commanders")
  .action(async (str, options) => {
    try {
      // load config
      const configPath = constructPath(".ntc/track-config.json");

      let config: AppConfig = readJson(configPath);
      printJson(config);

      // if config not defined, create an empty config object to fill values into
      if (!config) {
        console.log("No existing config found");
        config = {
          commanders: [],
        };
      }

      // check/add more commanders
      let addCommanders: boolean = true;
      if (config.commanders) {
        addCommanders = await confirm(
          "Would you like to add/reset commander list?"
        );
      }
      if (addCommanders) {
        let reset: boolean = false;
        if (config.commanders.length > 0) {
          reset = await confirm("Reset commander list from scratch?");
        }
        config.commanders = await getCommanders({
          existingCommanders: config?.commanders,
          reset,
        });
      }

      if (!config.commanders || config.commanders.length <= 0) {
        console.log("Commander list empty - nothing to do! Exiting...");
        return;
      }

      const resultPath = constructPath(".ntc/result.json");

      // get tracking results
      await track(config, resultPath);

      // save new config
      writeJson(configPath, config);
    } catch (error) {
      console.log(error);
    }
  });

program.parse();
