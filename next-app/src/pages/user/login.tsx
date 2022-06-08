import type { NextPage, GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Form, Input, Button, message } from "antd";
import useUser from "@/lib/useUser";
import { fetcher } from "@/functions/fetch";
import fetchJson, { FetchError } from "@/lib/fetchJson";
import { useState } from "react";
import { useRouter } from "next/router";

const Login = () => {
  const router = useRouter();
  const { t } = useTranslation("user");
  const [form] = Form.useForm();
  const { mutateUser } = useUser({
    redirectTo: "/home",
    redirectIfFound: true,
  });

  async function onFinish(values: any) {
    const body = {
      user_id: values.id,
      user_pass: values.password,
    };
    try {
      await mutateUser(
        await fetcher(
          "/api/user/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          },
          true
        )
      );
      router.back();
    } catch {
      message.error("Login failed");
    }
  }

  return (
    <div className="login center-main">
      <div className="login__form">
        <Form form={form} name="login" onFinish={onFinish} scrollToFirstError>
          <Form.Item
            name="id"
            label="Username"
            rules={[
              {
                required: true,
                message: t("login.message.username.require"),
              },
            ]}
            hasFeedback
          >
            <Input autoComplete="false" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: t("login.message.password.require") },
            ]}
            hasFeedback
          >
            <Input.Password autoComplete="false" />
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
