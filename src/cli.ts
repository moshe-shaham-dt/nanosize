#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const fse = require('fs-extra');

yargs(hideBin(process.argv))
    .command('new <project-name>', 'Create a new project in a new folder', () => {
        return yargs.option('projectName', {
            type: "string"
        })
    }, (argv) => {
        const srcDir = __dirname + "/../samples/hello-world";
        const destDir = process.cwd() + '/' + argv.projectName;
        console.log(srcDir, destDir);
        try {
            fse.copySync(srcDir, destDir)
            console.log('success!')
        } catch (err) {
            console.error(err)
        }
    })
    .demandCommand(1)
    .parse()