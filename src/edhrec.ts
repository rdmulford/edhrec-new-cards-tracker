import { Commander } from "./config"

export const formatCommanderName = (input: string): string => {
  return input.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(/ /g,'-')
}

export const getCommanderUrl = (commander: Commander): string => {
  return `https://edhrec.com/commanders/${commander.name}${commander.theme ? '/'+commander.theme : ''}`
}