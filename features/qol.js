module.exports = client => {

    client.on('message', (message) => {
        if(message.content.includes('<@104537226192371712>') || message.content.includes('<@!104537226192371712>')) {
            const pingReee = client.emojis.cache.find(emoji => emoji.id == '758043433666478231')
            if(!pingReee) return
            message.react(pingReee)
        }
    })

}