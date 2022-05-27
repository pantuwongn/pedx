import React from "react";
import useUser from "@/lib/useUser";
import fetchJson from "@/lib/fetchJson";
import { Button,message } from "antd";
import { FetchError } from "@/lib/fetchJson";

const _5M1E = () => {
  const { user } = useUser({
    redirectTo: "/user/login",
  });

  async function getCurrent() {
    try {
      const data = await fetchJson("/api/user/getCurrentUser", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log(data);
    } catch (error) {
      if (error instanceof FetchError) {
        message.error(error.data.detail);
      } else {
        console.error("An unexpected error happened:", error);
      }
    }
  }

  if (!user || user.isLoggedIn === false) {
    return (
      <div className="_5m1e center-main">
        <p>Not logged in yet, please log in before use this page.</p>
      </div>
    );
  }

  return (
    <div className="_5m1e center-main">
      <Button type="primary" onClick={getCurrent}>
        Get
      </Button>
    </div>
  );
};

export default _5M1E;
