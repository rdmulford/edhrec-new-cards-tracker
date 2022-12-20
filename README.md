# edhrec-new-cards-tracker

Tool to help track edhrec new card lists across many commanders.

Disclaimer: this is pretty quick and dirty, code is not great, no testing, not a great UX - lots of room for improvement. It works well enough though!

## install

via npm:

```sh
npm i edhrec-new-cards-tracker -g
```

via yarn:

```sh
yarn global add edhrec-new-cards-tracker
```

run:

```sh
nct --help
```

## usage

```sh
nct track
```

Follow the prompts to generate a config that contains a list of commanders and their theme to track.

Next the tool will scan each commander/theme url for new cards, the results will be output and saved to a result file.

The next time the tool is ran, it will compare the new results against the previous result and display any differences.
