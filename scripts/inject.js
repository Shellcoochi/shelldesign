const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const {
  getLibsPkgs,
  getPkgName,
  installChildPkg,
  sleep,
} = require("./generateComponent");
const { generateFile } = require("./generateFile");

async function inject() {
  const args = Array.from(arguments);
  const inputName = args[0];
  if (!inputName) {
    console.log("请输入组件名称,例入：pnpm injet button");
    return false
  }
  const ligsPkgs = getLibsPkgs();
  const ligsPkgsName = getPkgName(ligsPkgs);
  if (!ligsPkgs.includes(inputName) && !ligsPkgsName.includes(inputName)) {
    const msg = `未能找到组件:${inputName}，请确保该组件已被创建`;
    throw new Error(msg);
  }
  const choices = ligsPkgsName.reduce((choices, pkgName) => {
    const name = pkgName.replace("@supdesign/com-", "");
    if (name === inputName || pkgName === inputName) {
      return choices;
    }
    return [...choices, { name, value: pkgName }];
  }, []);
  if (choices.length === 0) {
    console.log("暂无其他可用组件");
    return false;
  }
  const injectPrompt = [
    {
      type: "checkbox",
      name: "dependencies",
      message: `请选择要注入到${inputName}中的依赖`,
      choices: choices,
    },
  ];
  const inquirerData = await inquirer.prompt(injectPrompt);
  if (inquirerData?.dependencies.length) {
    injectDependencies(
      inputName.replace("@supdesign/com-", ""),
      inquirerData?.dependencies
    );
  }
}

async function injectDependencies(pkg, dependencies) {
  const pkgJson = fs.readFileSync(
    path.resolve(__dirname, `../libs/${pkg}/package.json`)
  );
  const pkgJsonParse = JSON.parse(pkgJson);
  const appends = dependencies.reduce((appends, pkg) => {
    return { ...appends, [pkg]: "workspace:*" };
  }, {});
  pkgJsonParse.dependencies = { ...pkgJsonParse.dependencies, ...appends };
  const newPkgJson = {
    template: JSON.stringify(pkgJsonParse, null, "\t"),
    filePath: `libs/${pkg}/package.json`,
  };
  try {
    console.log(`正在将依赖注入到 ${pkg}`);
    await generateFile(newPkgJson, true);
    sleep();
    installChildPkg(`@supdesign/com-${pkg}`);
    console.log(dependencies,`已被注入到 ${pkg}`);
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = inject;
