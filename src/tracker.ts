import { Browser, webkit } from 'playwright';
import { Commander } from './config.js';
import { getCommanderUrl } from './edhrec.js';

export const track = async (commanders: Commander[]) => {
  const browser = await webkit.launch();
  try {
    let newCards: string[][] = []
    for (const commander of commanders) {
      const url: string = getCommanderUrl(commander)
      console.log(`getting cards from ${url}`)
      const cards = await fetchCards({
        browser,
        url: url,
      })
      console.log(cards)
      newCards.push(cards)
    }

    console.log(newCards)
  } catch (err) {
    console.log(err)
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
  const page = await browser.newPage();
  await page.goto(url);

  // find new cards id
  const rawNewCards = await page.locator('div#newcards').textContent();
  if (!rawNewCards) {
    throw new Error("new cards not found")
  }

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