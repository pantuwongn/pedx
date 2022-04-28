import React, { AnchorHTMLAttributes } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

interface PropsLinkForwardRef {
  onClick: React.MouseEventHandler;
  href: string | undefined;
}

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

const LogoLink = React.forwardRef(
  ({ onClick, href }: PropsLinkForwardRef, ref: any) => {
    return (
      <a href={href} onClick={onClick} ref={ref}>
        <Image src="/pe-dx-logo.svg" width={40} height={40}></Image>
        <b>PE BPK APPS</b>
      </a>
    );
  }
);

const Navbar = () => {
  return (
    <nav className="level nav-bar">
      <div className="level-left">
        <div className="level-item">
          <Link href="/home" passHref>
            <LogoLink />
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
