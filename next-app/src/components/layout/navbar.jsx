import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { regular, solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useRouter } from "next/router";
import { Col, Row, Switch } from "antd";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  isThemeLight,
  setIsThemeLight,
} from "@/app/features/themeSwitch/themeSwitch";

const LogoLink = React.forwardRef(({ onClick, href }, ref) => {
  return (
    <a href={href} onClick={onClick} ref={ref}>
      <abbr title="Home">
        <div className="logo-link">
          <Image src="/pe-dx-logo.svg" width={40} height={40} />
          <b>PE BPK APPS</b>
        </div>
      </abbr>
    </a>
  );
});

const LanguageSelector = () => {
  const router = useRouter();

  return (
    <div className="language-selector">
      {router.locales?.map((locale, index) => {
        if (router.locale !== locale) {
          return (
            <Link href={`${router.basePath}`} locale={locale} key={index}>
              {locale.toUpperCase()}
            </Link>
          );
        }
      })}
    </div>
  );
};

const ThemeSwitcher = () => {
  const dispatch = useAppDispatch();
  const isLight = useAppSelector(isThemeLight);

  useEffect(() => {
    const lsTheme = localStorage.getItem("theme");
    dispatch(setIsThemeLight(lsTheme !== "dark"));
  }, []);

  useEffect(() => {
    if (isLight) {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "");
    } else {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  }, [isLight]);

  return (
    <div className="theme-switcher">
      <Switch
        defaultChecked={true}
        checked={isLight}
        checkedChildren={<FontAwesomeIcon icon={solid("sun")} />}
        unCheckedChildren={<FontAwesomeIcon icon={solid("moon")} />}
        onChange={() => dispatch(setIsThemeLight(!isLight))}
      />
    </div>
  );
};

const Navbar = () => {
  return (
    <Row className="nav-bar">
      <Col span={8} className="nav-bar__left">
        <div className="logo-link__wrapper">
          <Link href="/home" passHref>
            <LogoLink />
          </Link>
        </div>
      </Col>
      <Col span={8} offset={8} className="nav-bar__right">
        <ThemeSwitcher />
        <LanguageSelector />
      </Col>
    </Row>
  );
};

export default Navbar;
