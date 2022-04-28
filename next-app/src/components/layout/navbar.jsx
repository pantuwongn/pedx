import React, { FC } from "react";
import Image from "next/image";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";

const LanguageSelector = () => {
  const router = useRouter();
  return (
    <div className="language-selector">
      {router.locales?.map((locale, index) => {
        if (router.locale !== locale) {
          return (
            <Link href={"/"} locale={locale} key={index}>
              {locale.toLowerCase()}
            </Link>
          );
        }
      })}
    </div>
  );
};

const LogoLink = React.forwardRef(({ onClick, href }, ref) => {
  return (
    <a href={href} onClick={onClick} ref={ref}>
      <div className="logo-link">
        <Image src="/pe-dx-logo.svg" width={40} height={40} />
        <b>PE BPK APPS</b>
      </div>
    </a>
  );
});

const Navbar = () => {
  return (
    <nav className="level nav-bar">
      <div className="level-left">
        <div className="level-item">
          <Link href="/home" passHref>
            {/* <>
            <Image src="/pe-dx-logo.svg" width={40} height={40} /> */}
            <LogoLink />
            {/* abc</> */}
          </Link>
        </div>
      </div>
      <div className="level-right">
        <LanguageSelector />
      </div>
    </nav>
  );
};

export default Navbar;
