  module.exports = client => {

      client.on('message', async message => {

          try {
              if (message.member.hasPermission('MANAGE_MESSAGES')) return
          } catch (err) {
              console.log('ERROR + \n' + err)
              console.log('MESSAGE THAT CAUSED THE ERROR: \n' + message)
              console.log('ERROR END \n')
          }
    
        let result = await client.schemas.get('guild').findOne({ _id: message.member.guild.id})  
            
        if (!result.bannedWords) return;        
    
        if (result.bannedWords.some(word => message.content.toLowerCase().replace(/\s+/g, '').includes(word.replace(/\s+/g, '')))) {
            message.delete();

        }
      })
      
      client.on('messageUpdate', async (oldMessage, message) => {

        try {
            if (message.member.hasPermission('MANAGE_MESSAGES')) return
        } catch (err) {
            console.log('ERROR + \n' + err)
            console.log('MESSAGE THAT CAUSED THE ERROR: \n' + message.url)
            console.log('ERROR END \n')
        }
  
      let result = await client.schemas.get('guild').findOne({ _id: message.member.guild.id})  
          
      if (!result.bannedWords) return;        
  
      if (result.bannedWords.some(word => message.content.toLowerCase().replace(/\s+/g, '').includes(word.replace(/\s+/g, '')))) {
          message.delete();

      }
  })
}