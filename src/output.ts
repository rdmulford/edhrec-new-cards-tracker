import chalk from "chalk";
import { Commander, NewCardMap, TrackingResults } from "./types/index.js";

const h1 = chalk.bold.underline;
const h2 = chalk.bold;

export const outputResults = (
  newResults: TrackingResults,
  previousResults: TrackingResults | undefined
) => {
  console.log();
  console.log(h1("PREVIOUS RESULTS"));
  if (previousResults && previousResults.cards.size > 0) {
    printResultMap(previousResults);
  } else {
    console.log();
    console.log("No previous results to compare to");
    console.log();
    console.log(h1("NEW RESULTS"));

    if (!newResults.cards) {
      console.log();
      console.log("No commanders/cards found");
      return;
    }

    printResultMap(newResults);
    return;
  }

  console.log(h1("NEW RESULTS"));
  if (!newResults.cards) {
    console.log();
    console.log("No commanders/cards found");
    return;
  }
  printResultMap(newResults);

  const diffResults = resultDiff(newResults, previousResults);

  console.log(h1("NEW ADDITIONS"));
  printResultMap(diffResults);
};

const resultDiff = (
  newResults: TrackingResults,
  previousResults: TrackingResults
): TrackingResults => {
  // im certain there is a better way to do all this
  let diffResults: NewCardMap = new Map<Commander, string[]>();
  let matchedCommanders: Commander[] = [];
  for (let [newCommander, newCards] of newResults.cards) {
    for (let [previousCommander, previousCards] of previousResults.cards) {
      if (
        newCommander.name === previousCommander.name &&
        newCommander.theme === previousCommander.theme
      ) {
        const newAndUniqueCards = newCards.filter((obj) => {
          return previousCards.indexOf(obj) == -1;
        });
        diffResults.set(newCommander, newAndUniqueCards);
        matchedCommanders.push(newCommander);
      }
    }
  }
  console.log("matched commanders:", matchedCommanders);
  for (let [newCommander, newCards] of newResults.cards) {
    if (!matchedCommanders.includes(newCommander)) {
      diffResults.set(newCommander, newCards);
    }
  }
  return {
    timestamp: newResults.timestamp,
    cards: diffResults,
  };
};

const printResultMap = (result: TrackingResults) => {
  console.log();
  console.log("Timestamp:", result.timestamp);
  console.log();

  for (let [commander, cards] of result.cards) {
    console.log(
      h2(commander.name.toUpperCase(), commander.theme?.toUpperCase())
    );
    if (cards.length <= 0) {
      console.log("No cards found");
      continue;
    }
    for (const card of cards) {
      console.log(card);
    }
    console.log();
  }
  console.log();
};
