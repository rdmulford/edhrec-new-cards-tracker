import inquirer from 'inquirer';
import { Answers } from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { Commander, TrackConfig } from './config.js';
import { formatCommanderName } from './edhrec.js';
import { typeahead } from './scryfall.js';


type PromptForCommandersOptions = {
  reset?: boolean
  config: TrackConfig
}

// get commanders from config and user input
export const getCommanders = async (opts: PromptForCommandersOptions): Promise<Commander[]> => {
  const { reset, config } = opts

  let commanders: Commander[] = []

  // append commanders from config if not resetting from scratch
  if (!reset) {
    commanders.push(...config.commanders)
  }

  inquirer.registerPrompt('autocomplete', inquirerPrompt);

  try {
    commanders = await promptForCommander(commanders)
  } catch (error: any) {
    throw new Error(error)
  }
  return commanders
}

// prompt for commanders to add
const promptForCommander = async (commanders: Commander[]) => {
  const questions = [
    {
      type: "autocomplete",
      name: "commander_name",
      message: "Enter commander name",
      source: (answersSoFar: any, input: any) => {
        try {
          return typeahead(input)
        } catch (err: any) {
          throw new Error(err)
        }
      }
    },
    {
      type: "input",
      name: "commander_type",
      message: "Enter commander type",
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
        theme: answers.commander_type as string
      }
      commanders.push(commander)
      if (!answers.is_finished) {
        await promptForCommander(commanders)
      }
    })
    .catch((error) => {
      throw new Error(error)
    });
  return commanders
}