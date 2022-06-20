const commander = require("commander");
const program = new commander.Command();
const initComponent = require('./initComponent');

//注册命令
function registerCommand() {
  program.name("supdesign").usage("<command> [options]");
  program
    .command("init [comName]")
    .action(initComponent);
  program.parse(process.argv);
}

registerCommand();
