const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Collection, Intents } = require('discord.js');

require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const commands = [];
client.commands = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.token);

client.on('ready', async () => {

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