import scryfall from "scryfall-client";

export const typeahead = async (input: string): Promise<string[]> => {
  await new Promise((resolve) => setTimeout(resolve, 100)); // add rate limit per https://scryfall.com/docs/api
  return scryfall
    .autocomplete(input)
    .then((list: string[]) => {
      return list;
    })
    .catch((err) => {
      throw new Error(err);
    });
};
