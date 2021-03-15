/* eslint-disable max-nested-callbacks */
const Discord = require('discord.js');

module.exports = {
	name: 'race',
	description: 'Start a horse race (with rockets).',
	guild: true,
	args: false,
	execute(message, args, client, prefix) {

		const emotes = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

		const horses = [0, 0, 0, 0, 0, 0, 0, 0, 0];
		const raceLength = 20;
		const raceSize = 5;
		const raceSpeed = 1;

		function printRace(arr) {
			let string = '';
			for (let i = 0; i < raceSize; i++) {
				string += ('▫️'.repeat(horses[i]) + '🚀' + '▫️'.repeat(raceLength - 1 - horses[i] < 0 ? 0 : raceLength - 1 - horses[i]) + (raceLength - horses[i] > 0 ? '🏁\n' : '\n'));
			}
			return string;
		}

		message.channel.send('A horse race is about to start. Choose which horse you think will win.')
			.then(betsMessage => {

				message.channel.send(printRace(horses))
					.then((raceMessage) => {

						for (let i = 0; i < raceSize; i++) {
							betsMessage.react(emotes[i]);
						}

						function printBets(winners = []) {

							let string = 'A horse race is about to start. Choose which horse you think will win.\n';
							for (let i = 0; i < raceSize; i++) {
								string += `${winners.includes(i) ? '🥇' : emotes[i]}: ${bets.get(i).length > 0 ? '<@' : ''}${bets.get(i).join('>, <@')}${bets.get(i).length > 0 ? '>' : ''}\n`;
							}

							betsMessage.edit(string);
						}

						const bets = new Map();

						for (let i = 0; i < raceSize; i++) {
							bets.set(i, []);
						}

						const collector = betsMessage.createReactionCollector(((reaction, user) => { return emotes.includes(reaction.emoji.name) && !user.bot; }), { time: 15000 });
						collector.on('collect', (reaction, user) => {
							bets.forEach((value, key) => {
								const index = value.indexOf(user.id);
								if (index > -1) {
									value.splice(index, 1);
									betsMessage.reactions.cache.get(emotes[key]).users.remove(user);
								}
								bets.set(key, value);
							});
							const arr = bets.get(emotes.indexOf(reaction.emoji.name)) ?? [];
							arr.push(user.id);
							bets.set(emotes.indexOf(reaction.emoji.name), arr);
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
												winners.push(i);
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