/* eslint-disable max-nested-callbacks */
const Discord = require('discord.js');

module.exports = {
	name: 'race',
	description: 'Start a horse race (with rockets).',
	guild: true,
	args: false,
	execute(message, args, client, prefix) {

		const horses = [0, 0, 0, 0, 0];
		const raceLength = 20;
		const raceSpeed = 1;

		function printRace(arr) {
			let string = '';
			arr.forEach(horse => {
				string += ('▫️'.repeat(horse) + '🚀' + '▫️'.repeat(raceLength - 1 - horse < 0 ? 0 : raceLength - 1 - horse) + (raceLength - horse > 0 ? '🏁\n' : '\n'));
			});
			return string;
		}

		message.channel.send('A horse race is about to start. Choose which horse you think will win.')
			.then(betsMessage => {

				message.channel.send(printRace(horses))
					.then((raceMessage) => {

						betsMessage.react('1️⃣');
						betsMessage.react('2️⃣');
						betsMessage.react('3️⃣');
						betsMessage.react('4️⃣');
						betsMessage.react('5️⃣');

						function printBets(winners = []) {

							let string = 'A horse race is about to start. Choose which horse you think will win.\n';
							string += `${winners.includes(1) ? '🥇' : '1️⃣'}: ${bets.get('1️⃣').length > 0 ? '<@' : ''}${bets.get('1️⃣').join('>, <@')}${bets.get('1️⃣').length > 0 ? '>' : ''}\n`;
							string += `${winners.includes(2) ? '🥇' : '2️⃣'}: ${bets.get('2️⃣').length > 0 ? '<@' : ''}${bets.get('2️⃣').join('>, <@')}${bets.get('2️⃣').length > 0 ? '>' : ''}\n`;
							string += `${winners.includes(3) ? '🥇' : '3️⃣'}: ${bets.get('3️⃣').length > 0 ? '<@' : ''}${bets.get('3️⃣').join('>, <@')}${bets.get('3️⃣').length > 0 ? '>' : ''}\n`;
							string += `${winners.includes(4) ? '🥇' : '4️⃣'}: ${bets.get('4️⃣').length > 0 ? '<@' : ''}${bets.get('4️⃣').join('>, <@')}${bets.get('4️⃣').length > 0 ? '>' : ''}\n`;
							string += `${winners.includes(5) ? '🥇' : '5️⃣'}: ${bets.get('5️⃣').length > 0 ? '<@' : ''}${bets.get('5️⃣').join('>, <@')}${bets.get('5️⃣').length > 0 ? '>' : ''}\n`;

							betsMessage.edit(string);

						}

						const bets = new Map();
						bets.set('1️⃣', []);
						bets.set('2️⃣', []);
						bets.set('3️⃣', []);
						bets.set('4️⃣', []);
						bets.set('5️⃣', []);

						const collector = betsMessage.createReactionCollector(((reaction, user) => { return ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && !user.bot; }), { time: 15000 });
						collector.on('collect', (reaction, user) => {
							bets.forEach((value, key) => {
								const index = value.indexOf(user.id);
								if (index > -1) {
									value.splice(index, 1);
									betsMessage.reactions.cache.get(key).users.remove(user);
								}
								bets.set(key, value);
							});
							const arr = bets.get(reaction.emoji.name) ?? [];
							arr.push(user.id);
							bets.set(reaction.emoji.name, arr);
							printBets();
						});

						collector.on('end', () => {

							betsMessage.reactions.removeAll();

							(function myLoop() {
								setTimeout(function() {
									horses.forEach((value, horse) => {
										const move = Math.round(Math.random());
										if (move !== 0) {
											horses[horse] = value + raceSpeed;
											if (horses[horse] >= raceLength) horses[horse] = raceLength;
										}
									});
									raceMessage.edit(printRace(horses));
									if (!horses.some(e => e >= raceLength)) {
										myLoop();

									}
									else {

										const winners = [];

										for (let i = 0; i <= 4; i++) {

											const horse = horses[i];

											if (horse >= raceLength) {
												winners.push(i + 1);
											}
										}
										printBets(winners);
									}
								}, 2000);
							})();
						});
					});
			});
	},
};