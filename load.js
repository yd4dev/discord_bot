const fs = require('fs');
const path = require('path');

/*
This file loads commands and schemas into
client.commands and client.schemas for easy access
and runs every feature inside ./features
*/

function loadCommands(dir, client) {
	fs.readdir(dir, function(err, files) {
		if (err) throw err;
		files.forEach(file => {
			const filepath = path.join(dir, file);
			fs.stat(filepath, function(err, stats) {
				if (stats.isDirectory()) {
					loadCommands(filepath, client);
				}
				else if (file.endsWith('.js')) {
					console.log(`Enabling command "${file}"`);
					const command = require('./'.concat(filepath));
					const category = filepath.split(/\/|\\/);
					command.category = category[category.length - 2];
					client.commands.set(command.name, command);
				}
			});
		});
	});
}

function loadFeatures(dir, client) {
	const files = fs.readdirSync(path.join(__dirname, dir));
	for (const file of files) {
		const stat = fs.lstatSync(path.join(__dirname, dir, file));
		if (stat.isDirectory()) {
			loadFeatures(path.join(dir, file), client);
		}
		else if (file !== 'load-features.js') {
			const feature = require(path.join(__dirname, dir, file));
			console.log(`Enabling feature "${file}"`);
			feature(client);
		}
	}
}

function loadSchemas(dir, client) {
	const schemas = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

	for (const file of schemas) {
		const schemaName = file.substring(0, file.length - 3);
		console.log(`Enabling schema "${schemaName}"`);
		const schema = require(`${dir}/${file}`);
		client.schemas.set(schemaName, schema);
	}
}

module.exports = (client) => {
	loadCommands('./commands', client);
	loadFeatures('./features', client);
	loadSchemas('./schemas', client);
};