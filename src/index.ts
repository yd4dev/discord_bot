import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Collection, Intents } from 'discord.js';

require('dotenv').config();

export class DataClient extends Client {
	commands: Record<string, any> = new Collection();
	db: Record<string, Collection<any, any>> = {};
}

const client = new DataClient({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const commands: {}[] = [];
client.commands = new Collection();

(async function loadCommands(dir) {
	for (const file of fs.readdirSync(`./src/${dir}`)) {
		if (file.endsWith('.ts')) {
			const command = require(`./${dir}/${file}`);
			// set a new item in the Collection
			// with the key as the command name and the value as the exported module
			client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		}
		else {
			fs.stat(`./src/${dir}/${file}`, (err, stats) => {
				if (err) return console.log(err);
				if (stats.isDirectory()) {
					loadCommands(`${dir}/${file}`);
				}
			});
		}
	}
})('commands');

const rest = new REST({ version: '9' }).setToken(process.env.token!);

client.on('ready', async () => {

	if (!client.user) return;

	require('./db.ts').connect(client);

	if (process.env.devServer) {
		try {
			console.log('Started refreshing dev server application (/) commands.');

			await rest.put(
				Routes.applicationGuildCommands(client.user.id, process.env.devServer),
				{ body: commands },
			);

			console.log('Successfully reloaded dev server application (/) commands.');
		}
		catch (error) {
			console.error(error);
		}
	}
	else {
		console.log('Started refreshing global application (/) commands.');

		await rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: commands },
		);

		console.log('Successfully reloaded global application (/) commands.');
	}

});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (!client.commands.has(commandName)) return;

	try {
		await client.commands.get(commandName).execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.token);