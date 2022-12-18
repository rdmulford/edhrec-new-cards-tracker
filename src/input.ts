import inquirer from "inquirer";
import { Answers } from "inquirer";
import inquirerPrompt from "inquirer-autocomplete-prompt";
import { Commander, AppConfig } from "./types/index.js";
import { formatCommanderName } from "./edhrec.js";
import { typeahead } from "./scryfall.js";

export const confirm = async (message: string): Promise<boolean> => {
  const questions = [
    {
      type: "confirm",
      name: "confirmed",
      message,
    },
  ];

  const result = await inquirer
    .prompt(questions)
    .then((answers: Answers) => {
      return answers.confirmed as boolean;
    })
    .catch((error) => {
      throw new Error(error);
    });
  return result;
};

type PromptForCommandersOptions = {
  reset?: boolean;
  existingCommanders?: Commander[];
};

// get commanders from config and user input
export const getCommanders = async (
  opts: PromptForCommandersOptions
): Promise<Commander[]> => {
  const { reset, existingCommanders } = opts;

  let commanders: Commander[] = [];

  // append commanders from config if not resetting from scratch
  if (!reset && existingCommanders) {
    commanders.push(...existingCommanders);
  }

  inquirer.registerPrompt("autocomplete", inquirerPrompt);

  try {
    commanders = await promptForCommander(commanders);
  } catch (error: any) {
    throw new Error(error);
  }
  return [...new Set(commanders)]; // deduplicate
};

// prompt for commanders to add
const promptForCommander = async (commanders: Commander[]) => {
  const questions = [
    {
      type: "autocomplete",
      name: "commander_name",
      message: "Enter commander name",
      source: (answersSoFar: any, input: any) => {
        try {
          return typeahead(input);
        } catch (err: any) {
          throw new Error(err);
        }
      },
    },
    {
      type: "input",
      name: "commander_type",
      message: "Enter commander theme (budget, expensive, lands, etc.)",
    },
    {
      type: "confirm",
      name: "is_finished",
      message: "Are you done?",
    },
  ];

  await inquirer
    .prompt(questions)
    .then(async (answers: Answers) => {
      const commander: Commander = {
        name: formatCommanderName(answers.commander_name as string),
        theme: answers.commander_type as string,
      };
      commanders.push(commander);
      console.log("Current Commanders: ", commanders);
      if (!answers.is_finished) {
        await promptForCommander(commanders);
      }
    })
    .catch((error) => {
      throw new Error(error);
    });
  return commanders;
};
