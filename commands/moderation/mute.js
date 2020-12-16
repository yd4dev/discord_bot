module.exports = {
	name: 'mute',
    description: 'Lets you mute users.',
    args: 2,
    permissions: 'MANAGE_MESSAGES',
    usage: '%prefixmute [@Target] [Time]',
	async execute(message, args, client, prefix) {

        args.shift();
        const target = message.mentions.members.first();

        if(!target) return message.reply('please provide a user.')

        const currentlyMuted = await client.schemas.get('mute').find({
            guildId: message.guild.id,
            userId: target.id
            })

        if(currentlyMuted.length) return message.reply('that user is already muted.');

        if(target.roles.highest.comparePositionTo(message.guild.member(client.user).roles.highest) >= 0) return message.channel.send('It seems that I am not high enough in the role hierarchy to mute that member.')
        if(target.roles.highest.comparePositionTo(message.member.roles.highest) >= 0) return message.channel.send('You cannot mute members that are higher than you.')

        
        const time = args[0].split(/(?<=[A-Za-z])/);

        const types = {
            m: 60,
            h: 3600,
            d: 86400
        }

        for (var i = 0; i < time.length; i++) {

            element = time[i];

            elementType = element.slice(-1);

            if (!types.hasOwnProperty(elementType)) {
                message.reply('Please provide a valid duration.');
                break;
            }

        }

        let timestamp = Date.now();

        time.forEach(function(element) {
            elementType = element.slice(-1);
            number = element.substring(0, element.length - 1);
            
            timestamp = timestamp + number * types[elementType] * 1000;
        })

        const expirationDate = new Date(timestamp);

        const mutedRole = message.guild.roles.cache.find(role => role.name === 'Muted')

        const everyoneRole = message.guild.roles.cache.find(role => role.name === '@everyone')

        const userRoles = target.roles.cache.array();

        userRoles.splice(userRoles.indexOf(everyoneRole, 1))

        if(!mutedRole) return message.channel.send(`I could not find a \`Muted\` role. Let me set up one by using \`${prefix}setup mute\``)

        await client.schemas.get('mute').findOneAndUpdate({

            guildId: message.guild.id,
            userId: target.id,
        }, {

            guildId: message.guild.id,
            userId: target.id,
            moderatorId: message.author.id,
            userRoles: userRoles,
            expires: expirationDate
        }, {
            upsert: true
        })

        userRoles.forEach(element => {
            target.roles.remove(element)
        });

        target.roles.add(mutedRole)

        message.channel.send(`I have muted ${target} until ${expirationDate.toDateString()}, ${expirationDate.toTimeString()}`);

	}
};