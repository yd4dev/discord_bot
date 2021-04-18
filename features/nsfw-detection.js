const deepai = require('deepai');

module.exports = client => {

	deepai.setApiKey('a1e0e3fe-6ef1-432e-98a1-d50fd7854072');

	client.on('message', async message => {

		if (message.attachments.size > 0) {
			const resp = await deepai.callStandardApi('nsfw-detector', {
				image: message.attachments.first().url,
			});
			console.log(resp.output.detections);
			message.channel.send((resp.output.nsfw_score * 100).toFixed(2) + '% ' + resp.output.detections.map(e => e.name).join(', '));
			if (resp.output.nsfw_score > 0.6) message.delete();
		}
	});
};