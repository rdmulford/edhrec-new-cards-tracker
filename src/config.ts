import { homedir } from 'os'

import * as fs from 'fs';
import * as path from 'path';

const userHomeDir = homedir()

export type TrackConfig = {
  commanders: Commander[];
}

export type Commander = {
  name: string;
  theme?: string;
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