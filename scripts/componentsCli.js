const commander = require("commander");
const program = new commander.Command();
const initComponent = require("./initComponent");
const inject = require("./inject");

//注册命令
function registerCommand() {
  program.name("supdesign").usage("<command> [options]");
  program.command("init [comName]").action(initComponent);
  program.command("inject [comName]").action(inject);
  program.parse(process.argv);
}

try {
  registerCommand();
} catch (error) {
  console.log(error);
}
