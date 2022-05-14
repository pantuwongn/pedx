import React, { ComponentProps } from "react";
import { message } from "antd";

class Message extends React.Component {
  loading = (msg: string, key: string = "", duration: number) => {
    message.loading({ content: msg, key: key, duration: duration });
  };

  success = (msg: string, key: string = "", duration: number) => {
    message.success({ content: msg, key: key, duration: duration });
  };
}

export default Message;
