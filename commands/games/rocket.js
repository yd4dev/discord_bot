const Discord = require('discord.js');

module.exports = {
	name: 'rocket',
	description: 'Lets a rocket fly across the channel.',
	guild: true,
	args: false,
	execute(message, args, client, prefix) {

		const horses = [0, 0, 0, 0, 0];
		const raceLength = 20;
		const raceSpeed = 1;

		function printRace(arr) {
			let string = '';
			arr.forEach(horse => {
				string += ('•'.repeat(horse === raceLength ? horse + 1 : horse) + '🚀' + '•'.repeat(raceLength - 1 - horse < 0 ? 0 : raceLength - 1 - horse) + (raceLength - 1 - horse > 0 ? '🏁\n' : '\n'));
			});
			return string;
		}

		message.channel.send('A horse race is about to start. Choose which horse you think will win.')
			.then(msg => {
				msg.react('1️⃣');
				msg.react('2️⃣');
				msg.react('3️⃣');
				msg.react('4️⃣');
				msg.react('5️⃣');

				function printBets(reaction, user) {
					console.log(bets);

					const string = 'A horse race is about to start. Choose which horse you think will win.';
					// Hier weiterarbeiten
					// Für jeden key (emoji) in bets eine Zeile erstellen und User auflisten yeah

				}

				const bets = new Map({
					'1️⃣': [],
					'2️⃣': [],
					'3️⃣': [],
					'4️⃣': [],
					'5️⃣': [],
				});

				const collector = msg.createReactionCollector(((reaction, user) => { return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && !user.bot; }), { time: 5000 });
				collector.on('collect', (reaction, user) => {
					bets.forEach((value, key) => {
						const index = value.indexOf(user.id);
						if (index > -1) value.splice(index, 1);
						bets.set(key, value);
					});
					const arr = bets.get(reaction.emoji.name) ?? [];
					arr.push(user.id);
					bets.set(reaction.emoji.name, arr);
					printBets(bets);
				});


				// .then(collected => {
				// 	const bets = new Map();

				// 	collected.forEach(reactions => {
				// 		if (!bets.get(reaction.user.id)) bets.set(reaction.user.id, reaction.emoji.name);
				// 	});

				// 	// if (reaction.emoji.name === '👍') {
				// 	// 	message.reply('you reacted with a thumbs up.');
				// 	// }
				// 	// else {
				// 	// 	message.reply('you reacted with a thumbs down.');
				// 	// }
				// })
				// .catch(collected => {
				// 	message.reply('you reacted with neither a thumbs up, nor a thumbs down.');
				// });


			});

		message.channel.send(printRace(horses))
			.then((msg) => {
				(function myLoop() {
					setTimeout(function() {
						horses.forEach((value, horse) => {
							const move = Math.round(Math.random());
							if (move !== 0) {
								horses[horse] = value + raceSpeed;
								if (horses[horse] >= raceLength) horses[horse] = raceLength;
							}
						});
						msg.edit(printRace(horses));
						if (!horses.some(e => e >= raceLength)) myLoop();
					}, 2000);
				})();
			});
	},
};