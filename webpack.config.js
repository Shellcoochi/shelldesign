const path = require("path");
const fs = require("fs");
const { readdirSync } = fs;
const { exec } = require("node:child_process");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");

const { copyDirectory } = require("./scripts/copyDirectory");

const devMode = process.env.NODE_ENV !== "production";

const libsPkgs = readdirSync(path.join(__dirname, "libs")).filter(
  (pkg) => pkg.charAt(0) !== "."
);

// 从输出的 bundle 中排除依赖（组件）
const externals =libsPkgs.reduce((externals, pkg) => {
  const pkgFile = require(`./libs/${pkg}/package.json`);
  return {
    ...externals,
    [pkgFile.name]:pkgFile.name
  };
}, {});

const webPackConfigList = [];
libsPkgs.forEach((pkg) => {
  const entry = {};
  entry[`${pkg}`] = `./libs/${pkg}/src/index.tsx`;
  if (!(!process.env.NODE_ENV || process.env.NODE_ENV === "development")) {
    entry[`${pkg}.min`] = `./libs/${pkg}/src/index.tsx`;
  }
  const umdconfig = {
    entry,
    output: {
      filename: "[name].js",
      library: `com${pkg
        .toLowerCase()
        .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())}`,
      libraryTarget: "umd",
      path: path.resolve(__dirname, "libs", pkg, "dist"),
      globalObject: "this",
    },
    mode: devMode ? "development" : "production",
    // devtool: devMode ? "inline-source-map" : "hidden-source-map",
    resolve: {
      extensions: [".ts", ".tsx", ".json", ".css", ".js", ".less"],
    },
    optimization: {
      minimizer: devMode
        ? []
        : [
            // 压缩js代码
            new TerserJSPlugin({
              // cache: true, // 启用文件缓存并设置缓存目录的路径
              parallel: true, // 使用多进程并行运行
            }),
            // 用于优化或者压缩CSS资源
            new CssMinimizerPlugin(),
          ],
      sideEffects: false,
    },
    module: {
      rules: [
        {
          test: /\.(png|jpg|gif|svg)$/i,
          type: "asset",
        },
        {
          test: /\.tsx?$/,
          use: [
            "babel-loader?cacheDirectory",
            {
              loader: "ts-loader",
              options: {
                configFile: "tsconfig.json",
              },
            },
          ],
        },
        {
          test: /\.(c|le)ss$/,
          use: [
            {
              // 将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，使用此loader就不需要用style-loader，即使用了也不会有效果
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: "css-loader",
              options: {
                modules: {
                  auto: true,
                  localIdentName: "[path][name]__[local]",
                },
                importLoaders: 2, // 一个css中引入了另一个css，也会执行之前两个loader，即postcss-loader和less-loader
              },
            },
            {
              loader: "less-loader", // 使用 less-loader 将 less 转为 css
            },
          ],
        },
      ],
    },
    externals: [
      {
        react: "React",
        "react-dom": "ReactDOM",
        antd: "antd",
        ...externals
      },
    ],
    plugins: [
      new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[id].css",
      }),
    ],
  };
  const cjsConfig ={
    ...umdconfig,
    output: {
      filename: "[name].js",
      library: `com${pkg
        .toLowerCase()
        .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())}`,
      libraryTarget: "commonjs",
      path: path.resolve(__dirname, "libs", pkg, "lib"),
      globalObject: "this",
    },
  }
  const esmConfig = JSON.stringify({
    compilerOptions: {
      target: "es2015", // 指定ECMAScript目标版本 "ES3"（默认）， "ES5"， "ES6"/ "ES2015"， "ES2016"， "ES2017"或 "ESNext"
      lib: [
        // 编译过程中需要引入的库文件的列表
        "dom",
        "esnext",
      ],
      module: "es2015", // 指定生成哪个模块系统代码:"None"， "CommonJS"， "AMD"， "System"， "UMD"， "ES6"或 "ES2015"
      allowJs: true, // 指定是否允许编译JS文件，默认false,即不编译JS文件
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noFallthroughCasesInSwitch: true,
      moduleResolution: "node",
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: false, // 不生成输出文件
      jsx: "react", // 在 .tsx文件里支持JSX
      newLine: "lf", // 当生成文件时指定行结束符： "crlf"（windows）或 "lf"（unix）
      declaration: true, // 指定是否在编译的时候生成相应的d.ts声明文件，如果设为true,编译每个ts文件之后会生成一个js文件和一个声明文件，但是declaration和allowJs不能同时设为true
      declarationMap: false, // 指定编译时是否生成.map文件
      sourceMap: false, // 编译时是否生成.map文件
      // outDir: ".",
    },
    include: ["src/**/*.ts", "src/**/*.tsx"],
    exclude: ["node_modules", "src/**/*.stories.*"],
  });
  esmBuild(pkg, esmConfig);
  webPackConfigList.push(umdconfig,cjsConfig);
});
module.exports = webPackConfigList;

function esmBuild(pkg, esmConfig) {
  fs.writeFileSync(
    `./libs/${pkg}/tsconfig.build.json`,
    esmConfig,
    { flag: "a+" },
    (err) => {}
  );
  exec(
    `pnpm build:tsc  -p libs/${pkg}/tsconfig.build.json --target ES5 --outDir  libs/${pkg}/es`,
    (error, stdout, stderr) => {
      fs.unlink(`./libs/${pkg}/tsconfig.build.json`, (e) => {
        if (e) {
          return false;
        }
      });
    }
  );
  copyDirectory(`./libs/${pkg}/src`, `./libs/${pkg}/es`);
}

