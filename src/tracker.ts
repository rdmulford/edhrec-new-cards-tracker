import { time } from 'console';
import { Browser, webkit } from 'playwright';
import { Commander, TrackConfig } from './config.js';
import { getCommanderUrl } from './edhrec.js';
import { readJson } from './file.js';

type NewCardMap = Map<string, string[]>

type TrackingResults = {
  timestamp: Date
  cards: NewCardMap
}

export const track = async (config: TrackConfig) => {
  const cardMap = await getNewCards(config.commanders)

  const results: TrackingResults = {
    cards: cardMap,
    timestamp: new Date()
  }

  console.log("New Results:")
  console.log(results)

  const previousResults: TrackingResults | undefined = readJson(config.resultPath)
  if (!previousResults) {
    console.log("no previous results to compare to")
    return
  }
  console.log("Previous results:")
  console.log(previousResults)
}

const getNewCards = async (commanders: Commander[]): Promise<NewCardMap> => {
  const browser = await webkit.launch();
  try {
    let newCards: NewCardMap = new Map<string, string[]>()
    for (const commander of commanders) {
      const url: string = getCommanderUrl(commander)
      console.log(`Getting cards from ${url}`)
      const cards = await fetchCards({
        browser,
        url: url,
      })
      console.log(cards)
      newCards.set(commander.name, cards)
    }

    return newCards
  } catch (err: any) {
    throw new Error(err)
  } finally {
    await browser.close();
  }
}

type FetchCardsArgs = {
  browser: Browser;
  url: string;
}

// given a link to an edhrec commander page, return a list of cards under the 'newcards' section
const fetchCards = async (args: FetchCardsArgs): Promise<string[]> => {
  const { browser, url } = args
  // navigate to page
  const context = await browser.newContext()
  const page = await context.newPage();
  await page.goto(url);

  // find new cards id
  const rawNewCards = await page.locator('div#newcards').textContent();
  if (!rawNewCards) {
    throw new Error("new cards not found")
  }

  context.close()

  // parse raw text (disclaimer: i hate this)

  // get each line
  const newCardLines = rawNewCards.substring(13).split('\n')

  // parse raw text to get each new card name
  let newCards = newCardLines.map((line) => {
    // lines may be prefixed with synergy text
    let trimmedCardLine = line.split('synergy').pop();
    if (!trimmedCardLine) {
      trimmedCardLine = line
    }
    // get card name up until first digit
    const cardName = /^\D+/.exec(trimmedCardLine);
    if (!cardName) {
      return
    }
    return cardName[0]
  })

  newCards.pop() // last element is always bogus
  return newCards.flatMap(card => card ? [card] : []) // get rid of undefined
}