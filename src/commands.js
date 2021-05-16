import { sendResponse } from './messages.js'

export const commands = {
    // Simple ping command to verify the bot is working
    'ping': {
        type: 'text',
        desc: 'Never hurts to check.',
        run: 'pong',
        usage: '/ping'
    },
    
    // Picks a random emoji to send back to the user
    'random-emoji': {
        type: 'func',
        desc: 'Sends a random emoji! 😜',
        run: () => {
            let emoji = Math.floor((128512 + Math.random() * 50)).toString(16)
            return String.fromCodePoint(parseInt(emoji, 16))
        },

        usage: '/random-emoji'
    },

    // Spams messages with the same run a fixed number of times
    'spam': {
        type: 'action',
        desc: 'Repeats text over and over and over and...',
        run: (context, args) => {
            if (args.length < 3) throw SyntaxError()
            
            let message = []
            for (let i = 2; i < args.length; i++) message.push(args[i])
            message = message.join(' ')

            let amount = Math.min(args[1], 10)
            for (let i = 0; i < amount; i++) {
                sendResponse(context, message)
            }
        },

        usage: '/spam <amount> <message>'
    },

    // Provides usage information for commands
    'help':  {
        type: 'func',
        desc: 'Provides command usage info.',
        run: (args) => {
            let usageString = ''
            if (args.length < 2) args.push('help')
            let cName = args[1]
            if (commands[cName] === undefined) return `Command '${cName}' not found!`
            if (commands[cName].usage !== undefined)
                usageString = `== ${cName} ==\n${commands[cName].desc}\n\nUsage: ${commands[cName].usage}`
            else usageString = `No guide available for the command '${cName}.'`
            return usageString
        },

        usage: `/help <command>\nUse /commands for a list of all commands.`
    },

    // Provides a message info dump
    'barf': {
        type: 'action',
        desc: 'Provides message context info.',
        run: (context, args) => {
            let response = "{"
            for (let key of Object.keys(context))
                response += `${key}: ${context[key]}, `
            
            sendResponse(context, response + "}")
        },

        usage: '/barf 🤮'
    },

    // Lists all commands
    'commands': {
        type: 'func',
        desc: 'Lists all commands',
        run: () => {
            let response = "== Available Commands ==\n"
            for (let command of Object.keys(commands).sort()) {
                response += `\n/${command} - ${commands[command].desc}\n`
            }

            return response
        },

        usage: '/commands'
    }
}
