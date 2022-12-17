import { homedir } from 'os'
import inquirer from 'inquirer';
import { Answers } from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import * as fs from 'fs';
import * as path from 'path';
import { typeahead } from './scryfall.js';

const userHomeDir = homedir()

export type TrackConfig = {
  commanders: Commander[];
}

export type Commander = {
  name: string;
  theme: string;
}

const configPath = path.join(userHomeDir, '.ntc/track-config.json')

export const readConfig = (): TrackConfig | undefined => {
  if (!fs.existsSync(configPath)) {
    console.log(`config does not exist at ${configPath}`)
    return
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
}

export const writeConfig = (config: TrackConfig) => {
  var dirname = path.dirname(configPath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname)
  }
  fs.writeFileSync(configPath, JSON.stringify(config))
}

// todo: this is bad/lazy
let commanders: Commander[] = []

type PromptForCommandersOptions = {
  reset?: boolean
  config: TrackConfig
}

// recursively prompt for commanders to add
export const promptForCommanders = async (opts: PromptForCommandersOptions) => {
  const { reset, config } = opts

  // append commanders from config if not resetting from scratch
  if (!reset) {
    commanders.push(...config.commanders)
  }
  console.log(commanders)

  inquirer.registerPrompt('autocomplete', inquirerPrompt);

  try {
    await getAnswers()
    console.log(commanders)
  } catch (error) {
    console.log(error)
  }
}

// prompt for commanders to add
const getAnswers = async () => {
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
        name: answers.commander_name as string,
        theme: answers.commander_type as string
      }
      commanders.push(commander)
      if (!answers.is_finished) {
        await getAnswers()
      }
    })
    .catch((error) => {
      throw new Error(error)
    });
}