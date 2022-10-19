// @ts-nocheck
import React, { FC, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { useRouter } from "next/router";
import { Button, Col, Row, Switch } from "antd";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  isThemeLight,
  setIsThemeLight,
} from "@/app/features/themeSwitch/themeSwitch";
// import User from './user'
import useUser from "@/lib/useUser";
import { fetcher } from "@/functions/fetch";

const User = () => {
  const { user, mutateUser } = useUser();
  const router = useRouter();

  async function onLogout() {
    await router.push("/home");
    mutateUser(
      await fetcher("/api/user/logout", {
        method: "POST",
      })
    );
  }

  return (
    <div className="user">
      <div className="user__avatar">
        {user?.isLoggedIn ? (
          <p>Hi, {<b>{user?.firstname} {user?.lastname}</b>}</p>
        ) : (
          "Hi guest !"
        )}
      </div>
      <div className="user__button">
        {user?.isLoggedIn ? (
          <Button type="default" shape="round" onClick={onLogout}>Logout</Button>
        ) : (
          <Button type="default" shape="round" onClick={() => router.push("/user/login")}>Login</Button>
        )}
      </div>
    </div>
  );
};

const LogoLink = React.forwardRef(function forwardRef({ onClick, href }, ref) {
  return (
    <a href={href} onClick={onClick} ref={ref}>
      <abbr title="Home">
        <div className="logo-link">
          <Image src="/pe-dx-logo.svg" width={40} height={40} />
          <b>DX ENGINEER APPS</b>
        </div>
      </abbr>
    </a>
  );
});

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

const LanguageSelector = () => {
  const router = useRouter();

  return (
    <div className="language-selector">
      {router.locales?.map((locale, index) => {
        if (router.locale !== locale) {
          return (
            <Link href={`${router.pathname}`} locale={locale} key={index}>
              {locale.toUpperCase()}
            </Link>
          );
        }
      })}
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
        <User />
        <>
          <ThemeSwitcher />
          <LanguageSelector />
        </>
      </Col>
    </Row>
  );
};

export default Navbar;
