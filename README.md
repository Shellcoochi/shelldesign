# 组件库

此项目采用单仓库多包架构，使用pnpm并集成changesets进行多包管理，并支持多组件单包发布。集成storybook支持本地实时预览。打包输出ESM、UMD、CJS

`为确保项目正确运行请先安装pnpm：
npm install -g pnpm`

## 目录结构：
```markdown
|-- supdesign
    |-- libs
    |   |-- components  
    |   |   |-- package.json
    |   |   |-- src
    |   |       |-- index.tsx    //多组件单包发布入口
    |   |-- 组件1
    |       |-- package.json
    |       |-- dist    //打包输出UMD目录
    |       |-- es    //打包输出ESM目录
    |       |-- lib    //打包输出CJS目录
    |       |-- src
    |           |-- xxxx.stories.tsx    //组件文档
    |           |-- index.less
    |           |-- index.tsx    //组件打包入口
    |           |-- assets    //组件静态在原目录
    |   |-- 组件2
    |-- scripts    //组件库预处理脚本
    |-- tools
        |-- storybook
            |-- package.json
            |-- .storybook    //storybook配置文件存放目录
            |-- storybook-static    //storybook打包输出目录
     |-- .gitignore
    |-- .npmrc
    |-- package.json
    |-- pnpm-lock.yaml
    |-- pnpm-workspace.yaml
    |-- README.md
    |-- register.path.json    //组件全局注册配置文件
    |-- tsconfig.json
    |-- typings.d.ts
    |-- webpack.config.js
    |-- .changeset    //changeset配置文件存放目录
```

## 可用脚本：

`pnpm install`
安装项目依赖

`pnpm start`
在开发模式下运行应用程序。
打开http://localhost:6006在浏览器中查看。
如果您进行编辑，该页面将重新加载。

`pnpm init:com [componentName]`
快速创建一个标准组件
使用此命令将会创建标准组件并自动进行全局注册。

`pnpm update:reg`
更新组件全局注册信
若通过手动方式添加组件后，可使用此命令进行全局组件注册信息的更新

`pnpm build`
打包项目输出ESM、UMD、CJS
此命令会先执行pnpm update:reg和pnpm install 后在进行打包

`pnpm build:pure`
打包项目输出ESM、UMD、CJS
与pnpm build对应，此命令不会做其他处理而是会直接进行打包

`pnpm build:storybook`
打包组件文档

## 发布流程：

1. 根目录中执行 `pnpm changeset`

1. 运行` pnpm changeset version` 
这将提高先前使用 pnpm changeset （以及它们的任何依赖项）的版本，并更新变更日志文件。

1. 执行`pnpm update:reg`
确保所有组件都已进行全局注册

1. 执行. pnpm install
确保所有依赖均已安装且正确

1. 执行打包命令`pnpm build`或`pnpm build:pure`
如使用pnpm build:pure进行打包，以上两个步骤必须执行

1. 运行` pnpm publish -r`
此命令将发布所有包含被更新版本且尚未出现在包注册源中的包




