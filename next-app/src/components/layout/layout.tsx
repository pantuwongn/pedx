import React from "react";
import Navbar from "./navbar";
import Footer from "./footer";
import { Button } from "antd";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <main className="main-content">
        {router.pathname !== "/home" && (
          <div className="back-button__wrapper">
            <div className="back-button">
              <abbr title="Back">
                <FontAwesomeIcon
                  icon={solid("arrow-left-long")}
                  onClick={() => router.back()}
                />
              </abbr>
            </div>
          </div>
        )}
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;
