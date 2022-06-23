const path = require("path");
const fs = require("fs");
const { getLibsPkgs, ejsRender } = require("./generateComponent");
const { generateFile } = require("./generateFile");

const libsPkgs = getLibsPkgs();

const cssDist = libsPkgs.reduce((cssDist, pkg) => {
  const pkgCss = fs
    .readFileSync(path.resolve(__dirname, `../libs/${pkg}/dist/${pkg}.css`))
    .toString();
  return cssDist + pkgCss;
}, "");

const css = {
  template: ejsRender(cssDist),
  filePath: `libs/components/dist/components.css`,
};
generateFile(css);
