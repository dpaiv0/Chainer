const { Command, Embed } = require('../../structures')
const { Constants } = require('../../utils')

const prefixRegex = (prefix) => new RegExp(`^(?:${prefix})?(.+)`)

module.exports = class Help extends Command {
  constructor (client) {
    super(client)
    this.name = 'help'
    this.aliases = ['commands', 'ajuda']
    this.category = 'info'
  }

  async run (message, args, strings) {
    const embed = new Embed(message.author)
    const prefix = process.env.PREFIX
    const validCommands = this.client.commands.filter(c => !c.hidden)
    const validStrings = this.client.strings.commands
    let cmd = args[0]

    if (cmd) {
      const regexMatch = cmd.match(prefixRegex(prefix))
      cmd = regexMatch && regexMatch[1]
      const command = cmd.split(' ').reduce((o, ca) => {
        const arr = (Array.isArray(o) && o) || (o && o.subcommands)
        if (!arr) return o
        return arr.find(c => c.name === ca || c.aliases.includes(ca))
      }, validCommands)
      if (command) {
        const description = [
          validStrings[command.name]._description ? validStrings[command.name]._description : strings.noDescription,
          '',
          `**${strings.howToUse}:**` + (validStrings[command.name]._usage ? `\`${validStrings[command.name]._usage}\`` : strings.noUsage)
        ]

        if (command.aliases.length > 0) description.push(`**${strings.aliases}:** ${command.aliases.map(a => `\`${prefix}${a}\``).join(', ')}`)
        if (command.subcommands.length > 0) description.push(`**${strings.subcommands}:** ${command.subcommands.map(a => `\`${prefix}${command.name} ${a.name}\``).join(', ')}`)

        embed.setTitle(prefix + command.name)
          .setDescription(description.join('\n'))
      } else {
        embed.setColor(Constants.ERROR_COLOR)
          .setTitle(strings.commandNotFound)
      }
    } else {
      const cryptoCommands = validCommands.filter(c => c.category === 'crypto').map(c => `\`${c.name}\``).sort((a, b) => a.localeCompare(b)).join('**, **')
      const infoCommands = validCommands.filter(c => c.category === 'info').map(c => `\`${c.name}\``).sort((a, b) => a.localeCompare(b)).join('**, **')
      embed.setAuthor(strings.listTitle, this.client.user.displayAvatarURL)
        .setDescription([
          `**${strings.crypto}**`,
          `${cryptoCommands}`,
          ``,
          `**${strings.info}**`,
          `${infoCommands}`
        ].join('\n'))
    }
    message.channel.send(embed)
  }
}
