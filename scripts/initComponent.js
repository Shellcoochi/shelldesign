const inquirer = require("inquirer");
const semver = require("semver");
const { generatePages } = require("./generateComponent");

async function initComponent() {
  function isValidName(v) {
    return /^[a-zA-z]+([-][a-zA-z][a-zA-Z0-9]*|[_][a-zA-z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
      v
    );
  }
  let component = {};
  const args = Array.from(arguments);
  const inputName = args[0];
  const componentPrompt = [];
  if (inputName) {
    if (!isValidName(inputName)) {
      console.error("组件名称输入不合法！");
    } else {
      component = { ...component, name: inputName };
    }
  } else {
    componentPrompt.push({
      type: "input",
      name: "name",
      message: `请输入组件名称`,
      default: ``,
      validate: function(v) {
        const done = this.async();
        setTimeout(function() {
          //1.首字母必须为英文字符
          //2.尾字符必须为英文、数字，不能为字符
          //3.字符仅允许“-_”
          if (!isValidName(v)) {
            done(`请输入合法的组件名称`);
            return;
          }
          done(null, true);
        }, 0);
      },
      filter: function(v) {
        return v;
      },
    });
  }
  componentPrompt.push({
    type: "input",
    name: "version",
    message: `请输入版本号`,
    default: "1.0.0",
    validate: function(v) {
      const done = this.async();
      setTimeout(function() {
        if (!!!semver.valid(v)) {
          done("请输入合法的版本号");
          return;
        }
        done(null, true);
      }, 0);
    },
    filter: function(v) {
      if (!!semver.valid(v)) {
        return semver.valid(v);
      } else {
        return v;
      }
    },
  });
  componentPrompt.push({
    type: "input",
    name: "author",
    message: `请输入创建者名称`,
    default: "@supdesign",
  });
  const inquirerData = await inquirer.prompt(componentPrompt);
  component = { ...component, ...inquirerData };
  //创建标准组件
  try {
    generatePages(component);
  } catch (e) {
    console.error(e);
  }
}

module.exports = initComponent;
