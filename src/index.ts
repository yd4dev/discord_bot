import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Collection, Intents } from 'discord.js';

require('dotenv').config();

import { guildLoad, guildSave } from './db';
export class DataClient extends Client {
	commands: Record<string, any> = new Collection();
	contexts: Record<string, any> = new Collection();
	db = {
		loadGuild: guildLoad,
		saveGuild: guildSave,
	};
}

const client = new DataClient({ intents: new Intents(32767), partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

require('./db').connect(client);

const commands: {}[] = [];
client.commands = new Collection();
client.contexts = new Collection();

(async function loadCommands(dir) {
	for (const file of fs.readdirSync(`./src/${dir}`)) {
		if (file.endsWith('.ts') || file.endsWith('.js')) {
			const command = require(`./${dir}/${file}`);
			// set a new item in the Collections
			// with the key as the command name and the value as the exported module
			if (command.command) {
				commands.push(command.command.toJSON());
				client.commands.set(command.command.name, command);
			}
			if (command.context) {
				commands.push(command.context.toJSON());
				client.contexts.set(command.context.name, command);
			}
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

(async function loadFeatures(dir) {
	for (const file of fs.readdirSync(`./src/${dir}`)) {
		if (file.endsWith('.ts') || file.endsWith('.js')) {
			require(`./${dir}/${file}`)(client);
		}
		else {
			fs.stat(`./src/${dir}/${file}`, (err, stats) => {
				if (err) return console.log(err);
				if (stats.isDirectory()) {
					loadFeatures(`${dir}/${file}`);
				}
			});
		}
	}
})('features');

const rest = new REST({ version: '9' }).setToken(process.env.token!);

client.on('ready', async () => {

	if (!client.user) return;

	if (process.env.devServer) {
		try {
			console.log('Started refreshing dev server application (/) commands.');

			await rest.put(
				Routes.applicationGuildCommands(client.user.id, process.env.devServer),
				{ body: commands },
			);

			await rest.put(
				Routes.applicationCommands(client.user.id),
				{ body: {} },
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
	if (interaction.isCommand() || interaction.isContextMenu()) {
		const { commandName } = interaction;

		try {
			if (interaction.isCommand() && client.commands.has(commandName)) await client.commands.get(commandName).execute(interaction, client);
			else if (interaction.isContextMenu() && client.contexts.has(commandName)) await client.contexts.get(commandName).execute(interaction, client);
			else return;
		}
		catch (error: any) {
			console.error(error);
			if (interaction.replied || interaction.deferred) { await interaction.editReply({ content: 'There was an error while executing this command!' }); }
			else { await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }); }
			const botOwner = interaction.guild?.members.cache.get(process.env.botOwner || '');
			if (botOwner) await botOwner.send(`Error while executing command ${commandName}: ${error.message}`);
		}
	}
});
client.login(process.env.token);