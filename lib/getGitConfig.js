const fs = require('fs');
const os = require('os');
const ini = require('ini');
const path = require('path');

function getGitFilePath(type) {
    let configPath = '';
    const workDir = process.cwd();

    if (type === 'global') {
        configPath = path.join(os.homedir(), '.gitconfig');
    } else {
        configPath = path.resolve(workDir, '.git/config');
    }

    if (!fs.existsSync(configPath)) {
        configPath = path.join(os.homedir(), '.config/git/config');
    }

    return fs.existsSync(configPath) ? configPath : null;
}

module.exports = function (type) {
    const path = getGitFilePath(type)
    if (path) {
        const file = fs.readFileSync(path, 'utf8');
        return ini.parse(file);
    }
    return {};
};