import "animate.css";
import "react-datepicker/dist/react-datepicker.css";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import Layout from "@/components/layout/layout";
import "@/styles/app.scss";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className="app-main">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </div>
  );
}

export default appWithTranslation(MyApp);
