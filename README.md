# 汽配云MEX组件库

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

## 内置命令：

`pnpm install`
安装项目依赖

`pnpm start`
在开发模式下运行应用程序。
打开[http://localhost:6006](http://localhost:6006 "http://localhost:6006") 在浏览器中查看。
如果您进行编辑，该页面将重新加载。

`pnpm init:com [componentName]`
快速创建一个标准组件
使用此命令将会创建标准组件并自动进行全局注册。

`pnpm update:reg`
更新组件全局注册信
若通过手动方式添加组件后，可使用此命令进行全局组件注册信息的更新

`pnpm inject [componentName]`
注入依赖到 [componentName]中
使用此命令可快速实现子包之间的依赖关系

`pnpm build`
打包项目输出ESM、UMD、CJS
此命令会先执行pnpm update:reg和pnpm install 后在进行打包

`pnpm build:pure`
打包项目输出ESM、UMD、CJS
与pnpm build对应，此命令不会做其他处理而是会直接进行打包

`pnpm build:storybook`
打包组件文档

## 快速创建标准组件
在根目录运行
`pnpm init:com`

```bash
$ pnpm init:com
? 请输入组件名称 button
? 请输入版本号 1.0.0
? 请输入创建者名称 (@supdesign)
```
输入完上面的信息后会自动在libs中创建组件，并在全局中注册（在全局注册后可供其他组件以用该组件）。之后会自动对刚创建的组件安装基础依赖

## 依赖其他组件
在实际开发中可能会出现，组件A依赖组件B的情况。
此时我们可以在根目录执行命令：`pnpm inject [componentName]`
例如：
```bash
$ pnpm inject demo
? 请选择要注入到demo中的依赖 (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
>( ) button
 ( ) label
```
此示例会将选择的组件自动注入到demo中

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

## 注意事项
**- 如果使用宿主环境中的依赖应该如何配置？**

若组件中存在需要使用宿主项目中的依赖时（例入，react 很多时候我们希望我们的组件中不安装react依赖，而是直接使用宿主项目中的react。）在开发时我们需要将react在项目空间进行全局安装，并修改使用react组件的package.json文件增加以下配置：
```bash
  "peerDependencies": {
    "react": ">=18.1.0", //这里会对宿主环境的react做出要求，如果不符合安装组件时则会爆出警告
    "react-dom": ">=18.1.0"
  }
```
**- 如何通过手动方式创建一个组件？**

- 首先所有的组件都应该在libs目录下创建。   
```markdown
    		|   |-- xxxx
    		|       |-- package.json
    		|       |-- src
    		|           |-- xxxx.stories.tsx    //组件文档
    		|           |-- index.less
    		|           |-- index.tsx    //组件打包入口
    		|           |-- assets    //组件静态在原目录
```
- 组件目录的名称规范：首字母必须为英文字符、尾字符必须为英文、数字，不能为字符、字符仅允许“-_”
- package.json，name字段必须遵守以下规范     ` "name": "@supdesign/com-xxxx",`其中xxxx为组件目录名称
- 组件创建完成后我们需要执行命令`pnpm update:reg` 用来更新  多组件单包发布入口以及组件全局引用的配置文件

**- 为什么没有使用css modules？**

在组件实际使用中，可能会出现组件使用者需要覆盖修改组件样式的场景，而css modules会使得我们的组件样式难以被覆盖，因此没有使用css modules。这里建议组件开发者使用BEM 命名规范，避免样式冲突。

**- 宿主项目是否必须使用less-loader？**

不是必须的，但建议使用less-loader，因为组件库样式是使用less编写的，如果宿主项目没有安装less-loader可能会出现组件样式无法加载的情况。
如果不想安装less-loader，可以在宿主项目中手动引入样式例如：
`import "@supdesign/com-demo/dist/demo.css";`
或
`import "@supdesign/components/dist/components.css";`