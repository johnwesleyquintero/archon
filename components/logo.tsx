import Image from "next/image";
import React from "react";

interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const Logo: React.FC<LogoProps> = ({ width = 24, height = 24, ...props }) => (
  <Image
    src="/favicon.ico"
    alt="Archon Logo"
    width={width as number}
    height={height as number}
    {...props}
  />
);

export default Logo;
