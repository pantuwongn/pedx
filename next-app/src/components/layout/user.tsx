import React from "react";
import Link from "next/link";
import useUser from "@/lib/useUser";
import fetchJson from "@/lib/fetchJson";
import { useRouter } from "next/router";

const User = () => {
  const { user, mutateUser } = useUser();
  const router = useRouter();

  async function onLogout() {
    mutateUser(
      await fetchJson("/api/user/logout", {
        method: "POST",
      }),
      false
    );
    router.push("/home");
  }

  return (
    <div className="user">
      {user?.isLoggedIn ? (
        <Link href={"#"} passHref>
          <a onClick={onLogout}>
            Logout
          </a>
        </Link>
      ) : (
        <Link href={"/user/login"}>Login</Link>
      )}
    </div>
  );
};

export default User;
