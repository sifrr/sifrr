export type SifrrConfig = {
  elementsFolder?: string;
  elementMap?: string;
  elementNameToFileName?: (elementName: string) => string;
};

export type Command = (argv: { [x: string]: any }, config: SifrrConfig) => void;

declare global {
  namespace NodeJS {
    interface Global {
      ENV: string;
    }
  }
}
