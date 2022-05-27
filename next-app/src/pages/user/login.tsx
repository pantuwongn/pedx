import type { NextPage, GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Form, Input, Button,message } from "antd";
import useUser from "@/lib/useUser";
import fetchJson, { FetchError } from "@/lib/fetchJson";
import { useState } from "react";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();
  const { t } = useTranslation("user");
  const [form] = Form.useForm();
  const { mutateUser } = useUser({
    redirectTo: "",
    redirectIfFound: true,
  });

  async function onFinish(values: any) {
    const body = {
      username: values.username,
      password: values.password,
    };
    try {
      await mutateUser(
        await fetchJson("/api/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
      // router.push("/home");
      router.back()
    } catch (error) {
      if (error instanceof FetchError) {
        message.error(error.data.detail);
      } else {
        console.error("An unexpected error happened:", error);
      }
    }
  }

  return (
    <div className="login center-main">
      <div className="login__form">
        <Form form={form} name="login" onFinish={onFinish} scrollToFirstError>
          <Form.Item
            name="username"
            label="Username"
            rules={[
              {
                required: true,
                message: t("login.message.username.require"),
              },
            ]}
            hasFeedback
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: t("login.message.password.require") },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let loc = "";
  if (locale) {
    loc = locale;
  }
  return {
    props: {
      ...(await serverSideTranslations(loc, ["user"])),
    },
  };
};

export default Login;
