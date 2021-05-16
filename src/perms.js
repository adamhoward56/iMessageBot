import permissions from 'node-mac-permissions'
import prompt from 'prompt'

prompt.start()
if (permissions.getAuthStatus('full-disk-access') != 'authorized') {
    console.log('The iMessage bot cannot run without full disk access permissions.')
    console.log('Open system preferences to provide full access? (y/n): ')

    prompt.get(['openPrefs'], function (err, result) {
        if (err) { return onErr(err); }
        if (result.openPrefs.toLowerCase() == 'y') {
            permissions.askForFullDiskAccess()
        }
    })
}
