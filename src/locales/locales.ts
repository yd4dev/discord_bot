import { Interaction } from 'discord.js';
import fs from 'fs';

const path = './src/locales';

const langs: Record<string, Record<string, string>> = {};

fs.readdirSync(path).forEach(file => {
	if (file.endsWith('.json')) {
		langs[file.split('.')[0]] = JSON.parse(fs.readFileSync(path + '/' + file).toString());
	}
});

export default function getLocale(msg: string, interaction: Interaction, vars?: Array<any>): string {
	const lang = (interaction.guild?.features.includes('COMMUNITY') ? interaction.guildLocale : interaction.locale.slice(0, 2)) || 'en';
	const m = langs[lang] ? langs[lang][msg] : langs['en'][msg];

	if (m) {
		if (vars && m.match(/%VAR%/g)?.length === vars.length) {
			let count = -1;
			return m.replace(/%VAR%/g, () => {
				count++;
				return vars[count];
			});
		}
		else {
			return m;
		}
	}
	else {
		throw new Error(`Missing locale for ${msg}`);
	}
}