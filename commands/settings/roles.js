module.exports = {
	name: 'roles',
    description: 'Set different roles for the server.',
    args: false,
    async execute(message, args, client, prefix) {

        if (!message.member.hasPermission('ADMINISTRATOR')) return message.reply('you do not have enough permissions to run this command. [ADMINISTRATOR]');
        
        switch (args[0]) {
            case 'join':

                const mentionedRoles = message.mentions.roles.array()
                console.log(mentionedRoles.length)
                if (mentionedRoles.length == 0) return message.channel.send('Please mention roles you want to assign.')
                await client.schemas.get('guild').findOneAndUpdate({
                    _id: message.guild.id
                }, {
                    _id: message.guild.id,
                    joinRoles: mentionedRoles
                }, {
                    upsert: true
                })

                message.channel.send(`${mentionedRoles} will now be assigned on join.`)

            break;
        }

	},
};