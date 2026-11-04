/// <reference types="vite/client" />
import "react";

// Allow CSS custom properties in inline styles, e.g. style={{ "--tilt": "15deg" }}
declare module "react" {
  interface CSSProperties {
    [name: `--${string}`]: string | number | undefined;
  }
}
