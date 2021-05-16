import {runAppleScriptAsync} from 'run-applescript'
import { commands } from './commands.js'


// Regex to determine whether a message belongs to a group chat
const gcRegex = new RegExp('^chat[0-9]*$')


/**
 * Helper function to process a list of messages queried from chat.db
 * @param {Array} messages 
 */
export function parseMessages(messages) {
    for (let m of messages) {
        parse(m)
    }
}


/**
 * Gets the recipient of a message's context (including if it is being sent)
 * to a group chat.
 * @param {Object} context 
 * @returns {Object} { target: String, isGroup: Boolean }
 */
export function getRecipient(context) {
    let isGroup = gcRegex.test(context.chat_identifier)
    return {
        target: isGroup ? context.guid : context.chat_identifier,
        isGroup: isGroup
    }
}


/**
 * Sends an iMessage to the provided recipient via AppleScript.
 * @param {string} recipient 
 * @param {string} body
 */
export async function sendMessage(recipient, body, groupChat = false) {
    var messageScript = ''
    if (!groupChat)
        messageScript = `
            tell application "Messages"
                set targetService to 1st service whose service type = iMessage
                set targetBuddy to buddy "${recipient}" of targetService
                send "${body}" to targetBuddy
            end tell`
    else
        messageScript = `
            tell application "Messages"
                set targetService to 1st service whose service type = iMessage
                set targetBuddy to a reference to chat id "${recipient}"
                send "${body}" to targetBuddy
            end tell`

    const result = await runAppleScriptAsync(messageScript)
}


/**
 * Sends a message to recipients based on the provided context
 * @param {Object} context 
 * @param {string} body 
 */
export function sendResponse(context, message) {
    context = getRecipient(context)
    sendMessage(context.target, message, context.isGroup)
}


/**
 * Parses messages for commands
 * @param {Object} m The raw message object to parse
 * @returns 
 */
function parse (m) {
    // Sanity checks
    // if (m.is_from_me != 0) return
    if (m.text[0] != '/') return

    let body = m.text.substring(1)
    let args = body.split(' ')
    let responseTarget = m.chat_identifier
    
    // Execute corresponding command
    let commandName = args[0].toLowerCase()
    if (args[0] in commands) {
        let command = commands[commandName]
        let response = ""
        
        switch (command.type) {
            // Simple string response.
            case 'text':
                response = command.run
                break

            // Function-generated strings! More customization.
            case 'func':
                response = command.run(args)
                break

            // Fully custom action. Controls message sending.
            case 'action':
                try { command.run(m, args); return }
                catch (e) { response = commands['help'].run(['', commandName]) }
                break

            default:
                console.log(`Invalid command type '${command.type}'!`)
                response = `Encountered internal error processing:\n'${m.text}'\n\n:(`
                break
        }

        // Communicate result back to the user
        sendResponse(m, response)

    } else {
        let commandMessage = `Command '${commandName}' does not exist!\n\n`
            + `Run /commands to list all available commands.`
        
        sendResponse(m, commandMessage)
    }
}