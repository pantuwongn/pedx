import "animate.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { appWithTranslation } from "next-i18next";
import Layout from "@/components/layout/layout";
import "@/styles/app.scss";
import store from "@/app/store";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";
import { fetchJson } from "@/lib/fetchJson";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <SWRConfig
        value={{
          fetcher: fetchJson,
          onError: (err) => {
            console.log("error = ", err);
          },
        }}
      >
        <div className="app-main">
          <Head>
            <title>DX Engineer Apps</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/pe-dx-logo.ico" />
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </div>
      </SWRConfig>
    </Provider>
  );
}

export default appWithTranslation(MyApp);
