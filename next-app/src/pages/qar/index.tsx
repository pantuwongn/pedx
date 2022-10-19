import React from "react";
import type { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Button } from "antd";
import { useTranslation } from "next-i18next";

const Qar = () => {
  const {t} =useTranslation("qar")
  return (
    <div className="qar center-main">
      <b>{t("topic")}</b>
      <Button type="primary">Test</Button>
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
      ...(await serverSideTranslations(loc, ["qar"])),
    },
  };
};

export default Qar;
