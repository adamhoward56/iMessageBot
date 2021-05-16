# iMessage Bot
A simple iMessage chat bot for MacOS. Works for both individual conversations and groupchats.


## How it works

This bot repeatedly polls iMessage's `chat.db` SQLite database. New messages in the database are sent to a callback function and matched against a predefined set of commands.

For any matching commands, responses are generated and sent back to their respective conversations via AppleScript.

## Setup
```bash
# Install dependencies
$ npm install
```

__Note:__ Accessing iMessages SQLite database requires giving your terminal application full disk access permissions in system preferences. An automatic setup tool to prompt for these permissions will be included in an upcoming version (see `src/perms.js`).

## Usage

```bash
# Start the bot (monitors chat.db changes)
$ node src/bot.js
```

## Default commands

Below are the commands included with the iMessage bot. Customization is fairly simple, you can create new definitions for your own commands in `commands.js`.

See the format of the existing commands for implementation details.

```bash
# Send back received message info
/barf

# List all commands
/commands

# Get usage info about a specific command
/help <command>

# Useful for quick tests
/ping

# Generate a random emoji
/random-emoji

# Re-send a message multiple times simultaneously
/spam <amount> <message>
```
