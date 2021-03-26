const Discord = require('discord.js');

module.exports = client => {

	client.on('messageReactionAdd', async (reaction, user) => {

		if(user.bot) return;

		const ticketCategory = await client.schemas.get('ticketCategory').findOne({
			guild_id: reaction.message.guild.id,
			category_message: reaction.message.id,
		});

		if(!ticketCategory) return;
		let title = '';

		if(ticketCategory.title) {
			title = ticketCategory.title;
		}
		else {
			title = ticketCategory.category_name;
		}

		reaction.message.guild.channels.create(ticketCategory.category_name, { type: 'text' })
			.then((channel) => {

				if(channel.guild.members.resolve(client.user).hasPermission('ADMINISTRATOR')) {

					channel.updateOverwrite(reaction.message.guild.everyone, { VIEW_CHANNEL: false });

					channel.updateOverwrite(user, { VIEW_CHANNEL: true });

					ticketCategory.staff_roles.forEach(element => {
						channel.updateOverwrite(element, { VIEW_CHANNEL: true });

					});
				}
				else {channel.send('I am missing `ADMINISTRATOR` permission to overwrite channel permissions.');}

				const TicketCreatedEmbed = new Discord.MessageEmbed()
					.setTitle(title)
					.setColor('#9cdcfe')
					.setAuthor(user.username, user.displayAvatarURL({ dynamic : true }))
					.setTimestamp(Date.now());

				if(ticketCategory.embed_message) {
					TicketCreatedEmbed.setDescription(ticketCategory.embed_message);
				}

				channel.send(TicketCreatedEmbed);
				channel.send(`<@${user.id}>`);

			}).catch(err => reaction.message.channel.send(`Couldn't create new channel. **Error**: \`${err}\``));
	});

};