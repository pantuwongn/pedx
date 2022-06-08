import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const Energy = () => {
  const router = useRouter();
  return (
    <div className="energy center-main">
      <div className="link-content">
        <h2>Energy Visualization</h2>
        <div className="link-group">
          <Link href={`${router.pathname}/demo`}>Demo</Link>
        </div>
      </div>
    </div>
  );
};

export default Energy;
