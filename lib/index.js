const fs = require('fs');
const request  = require('request');
const StreamZip = require('node-stream-zip');
const chalk = require('chalk');
const boxen = require('boxen');

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
        const str = boxen(chalk.magenta(message),{
            padding: 1,
            borderColor: 'green',
            margin: 1
        });
        console.log(str);
    }
    start(options) {
        const stream = request(`${url}?pid=${options.pid}`, {
            headers: options.headers,
        }).on('response', function (response) {
            // log(chalk.green(response.statusCode)); // 200
        });
        
        stream.pipe(fs.createWriteStream('./iconfont.zip', 'utf-8'));
        let downloading = '.';
        stream.on('data', function (data) {
            downloading += '.';
            log(chalk.green('Downloading!'+downloading))
        });
        stream.on('complete', ()=>{
            const zip = new StreamZip.async({file: './iconfont.zip'});
            zip.entries().then(res => {
                const findKey = Object.keys(res).find(key => {
                    // console.log(key);
                    return key.endsWith('.js');
                });
                if (findKey) {
                    zip.entryData(findKey)
                        .then(buffer => {
                            const data = buffer.toString();
                            fs.writeFileSync(this.options.output+'/iconfont.js', data);
                        })
                        .finally(() => {
                            chalk.green('unzip complete 😄');
                            zip.close();
                        });
                }
            });
        });
        stream.on('error', function () {
            error('download failed');
        });
    }
}
