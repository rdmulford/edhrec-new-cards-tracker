import { Browser, webkit } from "playwright";
import {
  Commander,
  AppConfig,
  TrackingResults,
  NewCardMap,
} from "./types/index.js";
import { getCommanderUrl } from "./edhrec.js";
import { readJson, writeJson } from "./file.js";
import { outputResults } from "./output.js";
import { retryAsync } from "ts-retry";

export const track = async (config: AppConfig, resultPath: string) => {
  let cardMap: NewCardMap;
  try {
    cardMap = await getNewCards(config.commanders);
  } catch (error: any) {
    throw new Error(error);
  }

  const results: TrackingResults = {
    cards: cardMap,
    timestamp: new Date(),
  };

  if (!results.cards) {
    // some error happened, no cards returned
    console.log("Unknown error, no cards found. exiting...");
    return;
  }

  const previousResults: TrackingResults | undefined = readJson(resultPath);

  outputResults(results, previousResults);

  try {
    writeJson(resultPath, results);
  } catch (error: any) {
    throw new Error(error);
  }
};

const getNewCards = async (commanders: Commander[]): Promise<NewCardMap> => {
  const browser = await webkit.launch();
  try {
    let newCards: NewCardMap = new Map<Commander, string[]>();
    // todo: parallelize
    for (const commander of commanders) {
      const url: string = getCommanderUrl(commander);
      console.log(`Getting cards from ${url}`);
      const cards = await fetchCards({
        browser,
        url: url,
      });
      newCards.set(commander, cards);
    }

    return newCards;
  } catch (error: any) {
    throw new Error(error);
  } finally {
    await browser.close();
  }
};

type FetchCardsArgs = {
  browser: Browser;
  url: string;
};

// given a link to an edhrec commander page, return a list of cards under the 'newcards' section
const fetchCards = async (args: FetchCardsArgs): Promise<string[]> => {
  const { browser, url } = args;
  // navigate to page
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url);

  // find new cards id
  const maxTry = 5;
  let currentTry = 0;
  const rawNewCards = await retryAsync(
    async () => {
      currentTry += 1;
      console.log(`Attempt ${currentTry}/${maxTry}`);
      return await page.locator("div#newcards").textContent();
    },
    { delay: 100, maxTry }
  );
  if (!rawNewCards) {
    throw new Error("new cards not found");
  }

  console.log("Success!");

  context.close();

  // parse raw text (disclaimer: i hate this)

  // get each line
  const newCardLines = rawNewCards.substring(13).split("\n");

  // parse raw text to get each new card name
  let newCards = newCardLines.map((line) => {
    // lines may be prefixed with synergy text
    let trimmedCardLine = line.split("synergy").pop();
    if (!trimmedCardLine) {
      trimmedCardLine = line;
    }
    // get card name up until first digit
    const cardName = /^\D+/.exec(trimmedCardLine);
    if (!cardName) {
      return;
    }
    return cardName[0];
  });

  newCards.pop(); // last element is always bogus
  return newCards.flatMap((card) => (card ? [card] : [])); // get rid of undefined
};
