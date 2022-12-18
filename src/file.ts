import { homedir } from "os";

import * as fs from "fs";
import * as path from "path";

import { Commander } from "./types/index.js";

const userHomeDir = homedir();

export const constructPath = (filepath: string): string => {
  return path.join(userHomeDir, filepath);
};

export const readJson = (path: string): any | undefined => {
  if (!fs.existsSync(path)) {
    console.log(`file does not exist at ${path}`);
    return;
  }
  return JSON.parse(fs.readFileSync(path, "utf-8"), reviver);
};

export const writeJson = (filepath: string, data: any) => {
  var dirname = path.dirname(filepath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname);
  }
  fs.writeFileSync(filepath, JSON.stringify(data, replacer));
};

export const printJson = (data: any) => {
  if (!data) {
    return;
  }
  console.log(JSON.stringify(data, null, "  "));
};

function replacer(key: any, value: any) {
  if (value instanceof Map<Commander, string[]>) {
    return {
      dataType: "Map",
      value: Array.from(value.entries()),
    };
  } else {
    return value;
  }
}

function reviver(key: any, value: any) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}
