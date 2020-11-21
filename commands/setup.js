module.exports = {
	name: 'setup',
    description: 'A command to setup certain things on your server.',
    args: false,
	async execute(message, args, client, prefix) {

        if(!message.member.hasPermission('ADMINISTRATOR')) return message.reply('you do not have enough permissions to run this command.')
        
        switch(args[0]) {
            case 'mute':

                let mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted');

                let changedChannels = 0;

                if(mutedRole) {
                    message.guild.channels.cache.forEach(element => {

                        if(element.type != 'text') return;

                        element.updateOverwrite(mutedRole, { SEND_MESSAGES: false });

                        changedChannels = changedChannels + 1;

                    });

                    message.channel.send(`Successfully set up the Muted role for ${changedChannels} channels.`)
                } else {

                        mutedRole = await message.guild.roles.create({data: { name: 'Muted', permissions: 0 }})

                    console.log(mutedRole)

                    message.guild.channels.cache.forEach(element => {

                        if(element.type != 'text') return;

                        element.updateOverwrite(mutedRole, { SEND_MESSAGES: false });

                        changedChannels = changedChannels + 1;

                    });

                    message.channel.send(`Successfully created the ${mutedRole} role and set it up for ${changedChannels} channels.`)
                }
                break;

            default:
                message.reply('vald options are `mute`.')
        }

	},
};