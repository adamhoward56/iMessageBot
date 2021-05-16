import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { parseMessages } from './messages.js'
import { userInfo } from 'os'



var username = userInfo().username
var dbPath = `/Users/${username}/Library/Messages/chat.db`
var chatDb = null
var prevRowId = -1


/**
 * Queries a predefined number of latest messages from chat.db
 * @param {int} count The number of messages to load
 */
async function getLastMessages (count) {
    if (count < 0)
        throw RangeError('Message query count must be > 0.')
    
    let raw_messages = await chatDb.all(`
        SELECT
            M.text, M.is_from_me,
            C.guid, C.chat_identifier, C.display_name
        FROM message M
        INNER JOIN 
            chat_message_join CM
            ON CM.message_id = M.ROWID
        INNER JOIN 
            chat C
            ON  CM.chat_id = C.ROWID

        ORDER BY M.ROWID
        DESC LIMIT ${count}
    `)
    
    parseMessages(raw_messages.reverse())
}


/**
 * Polls the database and triggers a callback each time the database.
 */
async function pollDb () {
    let rowId = await chatDb.get('SELECT ROWID FROM message ORDER BY ROWID DESC LIMIT 1')
    rowId = rowId.ROWID

    // Update the previous row ID on startup
    if (prevRowId == -1) prevRowId = rowId;
    if (rowId != prevRowId) {
        getLastMessages(rowId - prevRowId)
        prevRowId = rowId
    }
}


function initDb(db) {
    chatDb = db
    console.log('Successfully connected to iMessage chat.db!\nListening...')

    // Poll the database
    pollDb()
    setInterval(pollDb, 1000)
}


// Connect to the iMessage database
console.log(`Attempting to connect to ${dbPath}...`)
open({
    filename: dbPath,
    driver: sqlite3.cached.Database,
    mode: sqlite3.OPEN_READONLY
})
    .then(db => initDb(db))
    .catch(err => console.log(err))
