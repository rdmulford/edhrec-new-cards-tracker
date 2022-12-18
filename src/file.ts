import { homedir } from 'os'

import * as fs from 'fs';
import * as path from 'path';

const userHomeDir = homedir()

export const constructPath = (filepath: string): string => {
  return path.join(userHomeDir, filepath) 
}

export const readJson = (path: string): any | undefined => {
  if (!fs.existsSync(path)) {
    console.log(`file does not exist at ${path}`)
    return
  }
  return JSON.parse(fs.readFileSync(path, 'utf-8'))
}

export const writeJson = (filepath: string, data: any) => {
  var dirname = path.dirname(filepath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname)
  }
  fs.writeFileSync(filepath, JSON.stringify(data))
}

export const printJson = (data: any) => {
  if (!data) {
    return
  }
  console.log(JSON.stringify(data, null, "  "))
}