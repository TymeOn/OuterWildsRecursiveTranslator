import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import fs from 'fs';
import { config } from './config.js';
import translate from '@iamtraction/google-translate';

let data = null;


// LOAD AND PARSE XML FUNCTION
// ---------------------------

function loadAndParseXML() {
	const xmlParser = new XMLParser();
	try {  
		var rawData = fs.readFileSync(config.inputFile, 'utf8');
		data = xmlParser.parse(rawData);
	} catch(e) {
		console.error('Error when parsing XML input :', e.stack);
		process.exit(1);
	}
}


// TRANSLATION FUNCTION
// --------------------

async function translateEntry(entry, index, length) {
	for (let i = 0; i < config.langChain.length; i++) {
		process.stdout.write(`>> ${index + 1} / ${length} entries (${i + 1} / ${config.langChain.length} languages)     \r`);
		try {
			const translation = await translate(entry.value, {to: config.langChain[i]});
			entry.value = translation.text;
		} catch (e) {
			console.error(`Error when translating "${entry.value}" to "${config.langChain[i]}": `, e.stack);
			process.exit(1);
		}
	}
	process.stdout.clearLine(1);
}


// SEQUENTIAL ENTRIES PROCESS FUNCTION
// -----------------------------------

async function processEntries(entries) {
	for (let i = 0; i < entries.length; i++) {
		await translateEntry(entries[i], i, entries.length);

		if (config.saveInterval > 0) {
			if (((i + 1) % config.saveInterval) === 0) {
				buildAndSaveXML();
			}
		}
	}
}


// BUILD AND SAVE XML FUNCTION
// ---------------------------

function buildAndSaveXML() {
	try {
		const xmlBuilder = new XMLBuilder({format: true});  // Create an instance of XMLBuilder
		const updatedXML = xmlBuilder.build(data);
		fs.writeFileSync(config.outputFile, updatedXML, 'utf8');
	} catch (e) {
		console.error('Error when saving XML file:', e.stack);
		process.exit(1);
	}
}


// MAIN FUNCTION
// -------------

async function main() {

	console.log(`-> Loading "${config.inputFile}".`)
	loadAndParseXML();

	if (data.TranslationTable_XML.entry !== undefined) {
		console.log(`-> Processing ${data.TranslationTable_XML.entry.length} base entries.`)
		await processEntries(data.TranslationTable_XML.entry);
	}

	if (data.TranslationTable_XML.table_shipLog !== undefined) {
		console.log(`-> Processing ${data.TranslationTable_XML.table_shipLog.TranslationTableEntry.length} ship log entries.`)
		await processEntries(data.TranslationTable_XML.table_shipLog.TranslationTableEntry);
	}

	if (data.TranslationTable_XML.table_ui !== undefined) {
		console.log(`-> Processing ${data.TranslationTable_XML.table_ui.TranslationTableEntryUI.length} UI entries.`)
		await processEntries(data.TranslationTable_XML.table_ui.TranslationTableEntryUI);
	}

	console.log(`-> Writing "${config.outputFile}".`)
	buildAndSaveXML();

	console.log('=> Translation complete !');
}

main();
