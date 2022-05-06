import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";

const Dashboard = () => {
  const router = useRouter();
  const pathQuery = router.query;
  var socket: Socket;

  useEffect(() => {
    console.log(pathQuery);
  }, [pathQuery]);

  useEffect(() => {
    socketInitialize();
  }, []);

  async function socketInitialize() {
    // await fetch("/api/socket");
    socket = io("http://127.0.0.1:8000/", {
      path: "/ws/socket.io/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 15000,
      reconnectionDelayMax: 300000,
    });

    socket.on("connect", () => {
      console.log("connected");
    });

    // socket.on("update", (msg: { data: string }) => {
    //   console.log(msg);
    //   setMsg(msg.data);
    // });

    // socket.on("update_table", (msg: { data: string }) => {
    //   console.log(msg);
    //   setUpdateList(JSON.parse(msg.data));
    // });
  }

  return (
    <div className="center-main _5m1e__dashboard">Dashboard {pathQuery.id}</div>
  );
};

export default Dashboard;
