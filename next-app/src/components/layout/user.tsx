import React from "react";
import Link from "next/link";
import useUser from "@/lib/useUser";
import fetchJson from "@/lib/fetchJson";

const User = () => {
  const { user, mutateUser } = useUser();
  console.log(user);

  async function onLogout() {
    mutateUser(
      await fetchJson("/api/user/logout", {
        method: "POST",
      }),
      false
    );
    // router.push('/')
  }

  return (
    <div className="user">
      {user?.isLoggedIn ? (
        <a href="/api/user/logout" onClick={onLogout}>
          Logout
        </a>
      ) : (
        <Link href="/user/login">Login</Link>
      )}
    </div>
  );
};

export default User;
