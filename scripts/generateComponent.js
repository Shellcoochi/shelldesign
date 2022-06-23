#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const { exec } = require("node:child_process");
const { generateFile, mkdir } = require("./generateFile");
const { execSync } = require("child_process");

const ejsRender = (tmp, data = {}) => {
  return ejs.render(tmp.toString(), data, {});
};

function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * 生成标准组件
 */
const generatePages = async (componentConfig) => {
  const packageJson = {
    template: ejsRender(
      fs.readFileSync(
        path.resolve(__dirname, "./template/template.package.json.ejs")
      ),
      componentConfig
    ),
    filePath: `libs/${componentConfig.name}/package.json`,
  };
  const indexTsx = {
    template: ejsRender(
      fs.readFileSync(
        path.resolve(__dirname, "./template/template.index.tsx.ejs")
      ),
      componentConfig
    ),
    filePath: `libs/${componentConfig.name}/src/index.tsx`,
  };
  const indexLess = {
    template: ejsRender(
      fs.readFileSync(
        path.resolve(__dirname, "./template/template.index.less.ejs")
      ),
      componentConfig
    ),
    filePath: `libs/${componentConfig.name}/src/index.less`,
  };
  const storiesTsx = {
    template: ejsRender(
      fs.readFileSync(
        path.resolve(__dirname, "./template/template.stories.tsx.ejs")
      ),
      componentConfig
    ),
    filePath: `libs/${componentConfig.name}/src/${componentConfig.name}.stories.tsx`,
  };

  //生成package.json
  await generateFile(packageJson);
  //生成入口文件index.tsx
  await generateFile(indexTsx);
  //生成样式文件
  await generateFile(indexLess);
  //生成文档文件
  await generateFile(storiesTsx);
  //生成静态资源目录
  await mkdir(`libs/${componentConfig.name}/src/assets`);
  //将组建在register.path.json中注册
  await comRegister({
    [`@supdesign/com-${componentConfig.name}`]: [
      `libs/${componentConfig.name}/src/index.tsx`,
    ],
  });
  // 更新多组件单包输出入口
  await updateComponentsEntry();
  // 将组件添加到多组件单包输出对应的package.json
  await addComponentsPkgJson(componentConfig);
  sleep();
  console.log(`组件：${componentConfig.name} 创建成功`);
  console.log(`
  组件名称：${componentConfig.name}
  版本号：${componentConfig.version}
  创建者：${componentConfig.author}
  `);
  sleep();
  console.log(`正在安装 ${componentConfig.name} 依赖`);
  sleep();
  installChildPkg(`@supdesign/com-${componentConfig.name}`);
  console.log(`${componentConfig.name} 依赖安装完成`);
};

/**
 * 安装子包依赖
 */
const installChildPkg = (name) => {
  execSync(`pnpm install -r --filter ${name}`);
};

/**
 * 注册组件用于多组件单包输出
 */
const comRegister = async (config, rewrite = false) => {
  const tsconfigPath = path.resolve(__dirname, "../register.path.json");
  const tsconfig = fs.readFileSync(tsconfigPath);
  const tsconfigJson = JSON.parse(tsconfig.toString());
  const { paths } = tsconfigJson.compilerOptions;
  const newPaths = {
    ...paths,
    ...config,
  };
  tsconfigJson.compilerOptions.paths = rewrite ? config : newPaths;
  await generateFile(
    {
      template: ejsRender(JSON.stringify(tsconfigJson, null, "\t")),
      filePath: tsconfigPath,
    },
    true
  );
};

// 将组件添加到多组件单包输出对应的package.json
const addComponentsPkgJson = async (componentConfig) => {
  const pkgPath = path.resolve(__dirname, "../libs/components/package.json");
  const packageJsonFile = fs.readFileSync(pkgPath);
  const packageJson = JSON.parse(packageJsonFile.toString());
  const { dependencies } = packageJson;
  const newDependencies = {
    ...dependencies,
    [`@supdesign/com-${componentConfig.name}`]: "workspace:*",
  };
  packageJson.dependencies = newDependencies;
  await generateFile(
    {
      template: ejsRender(JSON.stringify(packageJson, null, "\t")),
      filePath: pkgPath,
    },
    true
  );
};

const getLibsPkgs = () =>
  fs
    .readdirSync(path.join(__dirname, "../libs"))
    .filter((pkg) => pkg.charAt(0) !== "." && pkg !== "components");

// 更新多组件单包输出入口
const updateComponentsEntry = async () => {
  const libsPkgs = getLibsPkgs();
  const entryPath = path.resolve(__dirname, "../libs/components/src/index.tsx");
  const newEntry = getPkgName(libsPkgs).reduce((entry, pkgName) => {
    return (
      entry +
      `export * from "${pkgName}";\n` +
      `export { default as ${pkgName
        .replace("@supdesign/com-", "")
        .replace(/\w/, (c) => c.toUpperCase())} } from "${pkgName}";\n`
    );
  }, "");
  await generateFile(
    {
      template: ejsRender(newEntry),
      filePath: entryPath,
    },
    true
  );
};

// 获取所有组件package.json 字段
const getPkgName = (pkgs, type = "name") => {
  const pkgsTypes = pkgs.reduce((pkgsTypes, pkg) => {
    const pkgPath = path.resolve(__dirname, `../libs/${pkg}/package.json`);
    const packageJsonFile = fs.readFileSync(pkgPath);
    const packageJson = JSON.parse(packageJsonFile.toString());
    return [...pkgsTypes, packageJson[type]];
  }, []);
  return pkgsTypes;
};

//更新多组件单包输出 package.json
const updateComPkg = async () => {
  const pkgPath = path.resolve(__dirname, "../libs/components/package.json");
  const packageJsonFile = fs.readFileSync(pkgPath);
  const packageJson = JSON.parse(packageJsonFile.toString());
  const libsPkgs = getLibsPkgs();
  const pkgNames = getPkgName(libsPkgs);
  const newDependencies = pkgNames.reduce((newDependencies, pkgName) => {
    return (newDependencies = {
      ...newDependencies,
      [`${pkgName}`]: "workspace:*",
    });
  }, {});
  packageJson.dependencies = newDependencies;
  await generateFile(
    {
      template: ejsRender(JSON.stringify(packageJson, null, "\t")),
      filePath: pkgPath,
    },
    true
  );
};

//更新组件注册列表
const updateRegister = async () => {
  const libsPkgs = getLibsPkgs();
  libsPkgs.forEach((pkg) => {
    const [name] = getPkgName([pkg]);
  });
  const newPath = libsPkgs.reduce((newPath, pkg) => {
    const [name] = getPkgName([pkg]);
    return (newPath = { ...newPath, [name]: [`libs/${pkg}/src/index.tsx`] });
  }, {});
  comRegister(newPath, true);
};

//更新当前组件库组件注册情况
const updateComponentsList = async () => {
  try {
    await updateComponentsEntry();
    await updateComPkg();
    await updateRegister();
    console.log("组件注册文件已更新");
  } catch (e) {
    console.error(e);
  }
};

module.exports = {
  generatePages,
  updateComponentsList,
  getLibsPkgs,
  ejsRender,
  getPkgName,
  installChildPkg,
  sleep
};
