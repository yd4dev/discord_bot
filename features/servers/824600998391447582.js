// Fabios Kartoffel Server

const path = require('path');
const scriptName = path.basename(__filename, '.js');

module.exports = client => {

	client.on('voiceStateUpdate', async (oldState, newState) => {

		if (newState.guild?.id != scriptName) return;

		if (newState.member.id != '104537226192371712') return;

		if (newState.serverDeaf || newState.serverMute) {
			newState.setDeaf(false);
			newState.setMute(false);

			const auditLog = (await newState.guild.fetchAuditLogs({ limit: 1, user: newState.member, type: 'MEMBER_UPDATE' })).entries.first();

			if (auditLog.target === newState.member.user) {
				const e_member = newState.guild.members.cache.find(m => m.id === auditLog.executor.id);
				if (!e_member) return;
				e_member.voice.setDeaf(true);
				e_member.voice.setMute(true);
			}

		}

	});

};