import React from "react";
import useUser from "@/lib/useUser";

const _5M1E = () => {
  const { user } = useUser({
    redirectTo: "/user/login",
  });

  return (
    <div className="_5m1e center-main">
      <button className="button is-primary">button</button>
    </div>
  );
};

export default _5M1E;
