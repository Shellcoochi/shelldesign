import React from "react";
import classNames from "classnames";
import header from "./assets/head.jpg";
import "./index.less";

export type DemoProps = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  primary?: boolean;
};

const Demo = (props: DemoProps) => {
  const { className: demoClassName, style, children, primary } = props;

  const className = classNames(
    {
      "supdesign-demo": true,
      "supdesign-demo-primary": primary,
    },
    demoClassName
  );

  return (
    <div className={className} style={style}>
      <img src={header} width={100}/>
      <p>{children}</p>
    </div>
  );
};

export default Demo;
