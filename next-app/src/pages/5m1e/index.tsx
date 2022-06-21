import React from "react";
import useUser from "@/lib/useUser";

import Link from "next/link";

const _5M1E = () => {
  const { user } = useUser({
    redirectTo: "/user/login",
  });

  if (!user || user.isLoggedIn === false) {
    return (
      <div className="_5m1e center-main">
        <p>Not logged in yet, please log in before use this page.</p>
      </div>
    );
  }

  return (
    <div className="_5m1e center-main">
      <div className="link-content">
        <h2>5M1E Report system</h2>
        <div className="link-group">
          <Link href="/5m1e/dashboard?t=problem">
            <p>
              <b>D</b>ashboard
            </p>
          </Link>
          <Link href="/5m1e/report/problem">
            <p>
              <b>R</b>eport - <b>P</b>roblem
            </p>
          </Link>
          <Link href="/5m1e/report/changepoint">
            <p>
              <b>R</b>eport - <b>C</b>hange <b>P</b>oint
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default _5M1E;
