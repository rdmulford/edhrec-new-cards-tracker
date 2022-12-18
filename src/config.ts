import { homedir } from 'os'

export type TrackConfig = {
  commanders: Commander[];
  resultPath: string;
}

export type Commander = {
  name: string;
  theme?: string;
}
