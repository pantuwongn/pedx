import type { NextPage, GetStaticProps } from "next";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Message from "@/components/common/message";

const LinkGroup = () => {
  return (
    <div className="link-group">
      <Link href={"/qar"}>
        <p>
          <b>Q</b>uality <b>A</b>uto <b>R</b>ecord
        </p>
      </Link>
      <Link href={"/5m1e"}>
        <p>
          <b>5M1E</b> Report
        </p>
      </Link>
      {/* <Link href={"/dea"}>
        <p>
          <b>D</b>ocument <b>E</b>asy <b>A</b>ccess
        </p>
      </Link> */}
      <Link href={"/energy"}>
        <p>
          <b>E</b>nergy <b>V</b>isualization
        </p>
      </Link>
    </div>
  );
};

const Home: NextPage = () => {
  const { t } = useTranslation("common");
  let msg: Message = new Message({});

  return (
    <div className="home center-main">
      <main className="home-content">
        <div className="link-content">
          <h1>
            {t("welcome")} <b>DX Engineer Application</b>
          </h1>
          <LinkGroup />
        </div>
      </main>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let loc = "";
  if (locale) {
    loc = locale;
  }
  return {
    props: {
      ...(await serverSideTranslations(loc, ["common"])),
    },
  };
};

export default Home;
