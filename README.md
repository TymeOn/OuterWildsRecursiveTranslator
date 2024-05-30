# Outer Wilds Recursive Translator

Small utility project to perform a recursive translation on the entirety of the Outer Wilds text.

Using the base game English translation file from [Outer Wilds Translation Mod Utility](https://github.com/xen-42/outer-wilds-localization-utility).

## How to use

1. Create a copy of the `config.js.dist` file and rename it `config.js`.
2. Edit the `config.js` file according to your needs.

| Variable       | Description                                                                |
|----------------|----------------------------------------------------------------------------|
| `inputFile`    | The file path of the original Translation.xml                              |
| `outputFile`   | The file path of the translated XML file                                   |
| `langChain`    | An array of ISO 639-1 language codes, representing the translation "chain" | 
| `saveInterval` | The number of entries between each XML file save (0 = no save)             |
3. Run the program with `node index.js` (depending on the length of your langChain, it may take a while).
4. Profit