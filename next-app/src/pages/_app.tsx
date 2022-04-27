import "../styles/globals.css";
import "animate.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import "@/styles/main.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default appWithTranslation(MyApp);
