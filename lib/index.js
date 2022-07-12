const fs = require('fs');
const request  = require('request');
const StreamZip = require('node-stream-zip');
const chalk = require('chalk');
const boxen = require('boxen');
const gitGitConfig = require('../lib/getGitConfig');


const url = 'https://www.iconfont.cn/api/project/download.zip';

const warning = (message) => chalk`{yellow WARNING:} ${message}`;
const info = (message) => chalk`{magenta INFO:} ${message}`;
const error = (message) => chalk`{red ERROR:} ${message}`;
const log = console.log

module.exports = class Downloader {
    constructor(options) {
        this.options = options || {};
        this.printOutBox('Icontfont Download');
        fs.readFile('./.iconfontrc', (err, data) => {
            if(err) {
                throw new Error(err);
            }
            const config = JSON.parse(data.toString());
            this.start({
                pid: config.pid,
                headers: {
                    Cookie: config.cookie
                }
            });
        })
    }
    printOutBox(message){
        const helloBox = boxen(chalk.magenta(message),{
            padding: 1,
            borderColor: 'green',
            margin: 1
        });
        log(helloBox);
    }
    timer = null;
    start(options) {
        log(warning('Download Ready \n'));
        this.timer = setInterval(() => {
            process.stdout.write('-');
        }, 100)
        const stream = request(`${url}?pid=${options.pid}`, {
            headers: options.headers,
        });
        stream.on('response', function (response) {
            log(chalk.green(response.statusCode)); // 200
        });
        
        stream.pipe(fs.createWriteStream('./iconfont.zip', 'utf-8'));
        let downloading = '.';
        stream.on('data', function (data) {
            downloading += '.';
            log(chalk.green('Downloading!'+downloading))
        });
        stream.on('complete', ()=>{
            if(this.timer) {
                clearInterval(this.timer);
                process.stdout.clearLine();
            }
            const zip = new StreamZip.async({file: './iconfont.zip'});
            zip.entries().then(res => {
                const findKey = Object.keys(res).find(key => {
                    // console.log(key);
                    return key.endsWith('.js');
                });
                if(!findKey) {
                    log(error('not found iconfont.js'));
                    return false;
                }
                zip.entryData(findKey)
                .then(buffer => {
                    const data = buffer.toString();
                    const username = gitGitConfig('global')?.user?.name;
                    const comment = `/**\n * ${username}\n * update at ${new Date().toString()}\n*/\n${data}
                    `
                    
                    fs.writeFileSync(this.options.output+'/iconfont.js', comment);
                    log(info('unzip complete 😄'));
                })
                .finally((err) => {
                    zip.close();
                });
            });
        });
        stream.on('error', function () {
            log(error('download failed'));
        });
    }
}
