const Discord = require('discord.js');

require('dotenv').config();

module.exports = client => {

	client.on('message', async message => {

		if (message.channel.type != 'dm') return;
		if (message.author.bot || message.author.id === process.env.botOwnerId) return;

		const MessageDMEmbed = new Discord.MessageEmbed()
			.setAuthor(message.author.tag, message.author.displayAvatarURL())
			.setTimestamp(message.createdTimestamp);

		if (message.content) MessageDMEmbed.setDescription(message.content);
		if (message.attachments.size != 0) MessageDMEmbed.addField('Attachment:', message.attachments.first().url);

		client.users.cache.get(process.env.botOwnerId).send(MessageDMEmbed);

	});
};