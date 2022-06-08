import React, { useEffect, useState, FC } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation, TFunction } from "next-i18next";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import {
  Button,
  Collapse,
  Form,
  Input,
  PaginationProps,
  Radio,
  RadioChangeEvent,
  Select,
  Table,
  Tag,
  Tooltip,
  Steps,
  Popconfirm,
} from "antd";
import type { ColumnsType, TableProps } from "antd/lib/table";
import { randomIntInRange } from "@/functions/common";
import type { FilterValue, SorterResult } from "antd/lib/table/interface";
import { RequestApprovalType } from "@/types/5m1e";
import useUser from "@/lib/useUser";

const { Option } = Select;
const { Panel } = Collapse;
const { Step } = Steps;

interface DataType {
  key: React.Key;
  id: number;
  type: string;
  product: string;
  line: string;
  process: string;
  part: string;
  section: number;
  category: string;
  problem: string;
  detail: string;
  note?: string;
  informer: string;
  manager: string;
  supporter: Array<string>;
  action: Array<string>;
  status: string;
  created_date: string;
  updated_date: string;
}

interface StatusType {
  text: string;
  fontColor: string;
}

const products = ["STA", "ALT", "ECC", "PART"];
const cats = [
  "Man",
  "Machine",
  "Method",
  "Material",
  "Measurement",
  "Environment",
];
const names = ["Lorem", "Ipsum", "Doror", "Sit", "Amet", "Consectetur"];
const sups = ["PE", "QA", "SAFETY", "DESIGN", "FAC"];
const supsColor: { [key: string]: string } = {
  PE: "purple",
  QA: "cyan",
  SAFETY: "green",
  DESIGN: "volcano",
  FAC: "magenta",
};

const statusList: { [id: string]: StatusType } = {
  "1": { text: "During check by TL", fontColor: "#2F8F9D" },
  "2": {
    text: "During approve by MGR",
    fontColor: "#242F9B",
  },
  "3": {
    text: "During action by TL/LL",
    fontColor: "#FAC213",
  },
  "4": {
    text: "During action by supporter",
    fontColor: "#9EB23B",
  },
  "5": {
    text: "During approve Change point",
    fontColor: "#F38BA0",
  },
  "6": { text: "Completed/Resolved", fontColor: "#14C38E" },
  "7": { text: "Cancelled", fontColor: "#F33737" },
};

const data: DataType[] = [];
for (let i = 1; i < 50; i++) {
  let prod = products[randomIntInRange(0, 3)];
  let cat = cats[randomIntInRange(4, 0)];
  let supAmount = randomIntInRange(5, 1);
  let sups_ = [...sups];
  let sup = [];
  for (let i = 1; i <= supAmount; i++) {
    const index = randomIntInRange(sups_.length - 1, 0);
    sup.push(sups_[index]);
    sups_.splice(index, 1);
  }
  sup.sort((a, b) => ("" + a).localeCompare(b));
  data.push({
    key: i,
    id: i,
    type: `${randomIntInRange(20, 1) % 2 ? "Problem" : "Change Point"}`,
    product: prod,
    line: `${prod} line-${randomIntInRange(10, 1)}`,
    process: `${prod} proc-${randomIntInRange(20, 1)}`,
    part: `${prod} part-${randomIntInRange(20, 1)}`,
    section: 411234,
    category: `${cat}`,
    problem: `${cat} problem-${randomIntInRange(5, 1)}`,
    detail: `${cat} detail-${randomIntInRange(5, 1)}`,
    note: `ABCDEF`,
    informer: `${names[randomIntInRange(5, 0)]}`,
    manager: `Mgr. ${names[randomIntInRange(5, 0)]}`,
    supporter: sup,
    action: ["Request", "Show", "Update"],
    status: `${randomIntInRange(7, 1).toString()}`,
    created_date: `${new Date(
      2022,
      4,
      i,
      randomIntInRange(24, 0),
      randomIntInRange(59, 0)
    ).toLocaleString("ja-JP", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    updated_date: `${new Date(
      2022,
      4,
      i + randomIntInRange(6, 0),
      randomIntInRange(24, 0),
      randomIntInRange(59, 0)
    ).toLocaleString("ja-JP", {
      hour12: false,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
  });
}

const Dashboard = () => {
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

  const { t } = useTranslation("5m1e");
  const router = useRouter();
  const pathQuery = router.query;
  var socket: Socket;
  const [form] = Form.useForm();
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<DataType>>({});

  const [tableType, setTableType] = useState<string>("problem");

  const columns: ColumnsType<DataType> = [
    {
      key: "created",
      title: "Created",
      dataIndex: "created_date",
      fixed: "left",
      width: 150,
      sorter: (a, b) => ("" + a.created_date).localeCompare(b.created_date),
      sortOrder:
        sortedInfo.columnKey === "created_date" ? sortedInfo.order : null,
      defaultSortOrder: "descend",
    },
    {
      key: "type",
      title: "Type",
      dataIndex: "type",
      fixed: "left",
      width: 120,
      filters: [
        { text: "All", value: "All" },
        { text: "Problem", value: "problem" },
        { text: "Change Point", value: "changepoint" },
      ],
      onFilter: (value: any, record) => {
        if (value === "All") return true;
        return record.type.replace(/\s+/g, "").toLowerCase() === value;
      },
      filteredValue: filteredInfo.type || null,
      sorter: (a, b) => ("" + a.type).localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === "type" ? sortedInfo.order : null,
      render: (_, { type }) => (
        <div className="table-column__type">
          <Tag color={type === "Problem" ? "volcano" : "geekblue"}>{type}</Tag>
        </div>
      ),
    },
    {
      key: "category",
      title: "Category",
      dataIndex: "category",
      fixed: "left",
      width: 120,
      filters: [
        { text: "Man", value: "Man" },
        { text: "Machine", value: "Machine" },
        { text: "Method", value: "Method" },
        { text: "Material", value: "Material" },
        { text: "Measurement", value: "Measurement" },
        { text: "Environment", value: "Environment" },
      ],
      onFilter: (value: any, record) =>
        record.category.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.category || null,
      sorter: (a, b) => ("" + a.category).localeCompare(b.category),
      sortOrder: sortedInfo.columnKey === "category" ? sortedInfo.order : null,
    },
    {
      key: "product",
      title: "Product",
      dataIndex: "product",
      fixed: "left",
      width: 115,
      filters: [
        { text: "STA", value: "STA" },
        { text: "ALT", value: "ALT" },
        { text: "ECC", value: "ECC" },
        { text: "PART", value: "PART" },
      ],
      onFilter: (value: any, record) =>
        record.product.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.product || null,
      sorter: (a, b) => ("" + a.product).localeCompare(b.product),
      sortOrder: sortedInfo.columnKey === "product" ? sortedInfo.order : null,
    },
    {
      key: "part",
      title: "Part",
      dataIndex: "part",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (part) => (
        <Tooltip placement="topLeft" title={part}>
          {part}
        </Tooltip>
      ),
      onFilter: (value: any, record) =>
        record.part.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.part || null,
      sorter: (a, b) => ("" + a.part).localeCompare(b.part),
      sortOrder: sortedInfo.columnKey === "part" ? sortedInfo.order : null,
    },
    {
      key: "line",
      title: "Line",
      dataIndex: "line",
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (line) => (
        <Tooltip placement="topLeft" title={line}>
          {line}
        </Tooltip>
      ),
      onFilter: (value: any, record) =>
        record.line.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.line || null,
      sorter: (a, b) => ("" + a.line).localeCompare(b.line),
      sortOrder: sortedInfo.columnKey === "line" ? sortedInfo.order : null,
    },
    {
      key: "problem",
      title: "Problem",
      dataIndex: "problem",
      width: 250,
      onFilter: (value: any, record) =>
        record.problem.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.problem || null,
    },
    {
      key: "informer",
      title: "Informer",
      dataIndex: "informer",
      width: 150,
      onFilter: (value: any, record) =>
        record.informer.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.informer || null,
    },
    {
      key: "manager",
      title: "Manager",
      dataIndex: "manager",
      width: 150,
      filterSearch: true,
      onFilter: (value: any, record) =>
        record.manager.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.manager || null,
    },
    {
      key: "supporter",
      title: "Supporter",
      dataIndex: "supporter",
      width: 150,
      filters: sups.map((sup) => ({ text: sup, value: sup })),
      onFilter: (value: any, record) => record.supporter.includes(value),
      filteredValue: filteredInfo.supporter || null,
      render: (_, { supporter }) => (
        <div className="table-column__supporter">
          {supporter.map((sup) => (
            <Tag color={supsColor[sup]} key={sup}>
              {sup}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      width: 120,
      fixed: "right",
      filters: Object.entries(statusList).map(([id, { text }]) => ({
        text: text,
        value: id,
      })),
      onFilter: (value: any, record) =>
        record.status.indexOf(value.toString()) >= 0,
      filteredValue: filteredInfo.status || null,
      sorter: (a, b) => parseInt(a.status) - parseInt(b.status),
      sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
      render: (_, { status }) => {
        const { text, fontColor } = statusList[status];
        return (
          <div className="table-column__status" style={{ color: fontColor }}>
            {text}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    // initialize socket connection
    socketInitialize();
  }, []);

  useEffect(() => {
    const { t, c, p, l, pb, i, m } = pathQuery;
    if (typeof t === "string") {
      setTableType(t);
    }
    const selector = {
      type: t,
      category: c,
      part: p,
      line: l,
      problem: pb,
      informer: i,
      manager: m,
    };
    form.setFieldsValue(selector);
    onSearchSubmit(selector);
  }, [pathQuery]);

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

  const onTableChange: TableProps<DataType>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<DataType>);
    // check current data source is zero
    // then increase margin for prevent overlap
    // with clear button
    checkDataForTableMargin(extra.currentDataSource);
  };

  const onShowSizeChange: PaginationProps["onShowSizeChange"] = (
    current,
    pageSize
  ) => {
    // console.log("on show size change", current, pageSize);
  };

  const onTypeChange = (e: RadioChangeEvent) => {
    setTableType(e.target.value);
  };

  function onSearchSubmit(values: any) {
    setFilteredInfo({
      ...filteredInfo,
      type: values.type ? [values.type] : null,
      category: values.category ? [values.category] : null,
      part: values.part ? [values.part] : null,
      line: values.line ? [values.line] : null,
      problem: values.problem ? [values.problem] : null,
      informer: values.informer ? [values.informer] : null,
      manager: values.manager ? [values.manager] : null,
    });
  }

  const clearFilters = () => {
    form.resetFields();
    setFilteredInfo({});
    checkDataForTableMargin(data);
  };

  const clearSorters = () => {
    setSortedInfo({});
    // checkDataForTableMargin(data)
  };

  const checkDataForTableMargin = (data: DataType[]) => {
    let root: HTMLDivElement | null = document.querySelector(
      "._5m1e__dashboard__table-wrapper > .ant-table-wrapper"
    );

    if (!root) return;

    if (data.length === 0) {
      root.style.marginTop = "4rem";
    } else {
      root.style.marginTop = "0";
    }
  };

  return (
    <div className="center-main _5m1e__dashboard">
      <div className="_5m1e__dashboard__selector__wrapper">
        <Collapse>
          <Panel header="Data selector" key="1">
            <div className="_5m1e__dashboard__selector">
              <Form
                form={form}
                layout="horizontal"
                onFinish={(values) => onSearchSubmit(values)}
              >
                <Form.Item
                  label="Type"
                  name="type"
                  className="selector__type"
                  initialValue={tableType}
                >
                  <Radio.Group onChange={onTypeChange}>
                    <Radio.Button value="problem">Problem</Radio.Button>
                    <Radio.Button value="changepoint">
                      Change point
                    </Radio.Button>
                    <Radio.Button value="All">All</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item label="Category" name="category">
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="select category"
                    style={{ width: "100%" }}
                  >
                    {cats.map((cat) => (
                      <Option key={cat}>{cat}</Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Part" name="part">
                  <Input
                    placeholder="search by part"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Line" name="line">
                  <Input
                    placeholder="search by line"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Problem" name="problem">
                  <Input
                    placeholder="search by problem"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Informer" name="informer">
                  <Input
                    placeholder="search by informer"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item label="Manager" name="manager">
                  <Input
                    placeholder="search by manager"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
                <Form.Item className="selector__button">
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Panel>
        </Collapse>
      </div>
      <div className="_5m1e__dashboard__table-wrapper">
        <div className="clear-buttons__wrapper">
          <div className="clear-buttons">
            <Button type="ghost" onClick={clearFilters}>
              {t("dashboard.clear.filter")}
            </Button>
            <Button type="ghost" onClick={clearSorters}>
              {t("dashboard.clear.sorter")}
            </Button>
          </div>
        </div>
        <Table
          id="dashboard-table"
          columns={columns}
          dataSource={data}
          size="large"
          pagination={{
            position: ["topLeft", "bottomRight"],
            showSizeChanger: true,
            onShowSizeChange: onShowSizeChange,
            hideOnSinglePage: false,
          }}
          expandable={{
            expandedRowRender: (record) => <TableExpand record={record} />,
          }}
          scroll={{ x: 1600, y: 550 }}
          onChange={onTableChange}
        />
      </div>
    </div>
  );
};

const TableExpand: FC<{ record: DataType }> = ({ record }) => {
  const { t } = useTranslation("5m1e");

  return (
    <div className="table__expand-row">
      <p>More details</p>
      <div className="table__expand-row__header">
        <div className="header__dept">
          <span>Dept</span>
          <span>{`department`}</span>
        </div>

        <div className="header__person">
          <span>TL</span>
          <span>{`Team leader`}</span>
          <span>MGR</span>
          <span>{`Manager`}</span>
          <span>FM</span>
          <span>{`Factory Manager`}</span>
        </div>

        <div className="header__process">
          <span>Process</span>
          <span>{`process`}</span>
          <span>SC Point</span>
          <span>{`F`}</span>
          <span>MC No</span>
          <span>{`T6ZZM`}</span>
        </div>

        <div className="header__part">
          <span>Part name</span>
          <span>{`ABC`}</span>
          <span>Model</span>
          <span>{`123A`}</span>
          <span>Customer</span>
          <span>{`TMT`}</span>
        </div>
      </div>
      <div className="table__expand-row__detail">
        <span>{`Problem`}</span>
        <span>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa, facere.
        </span>
        <span>{`Detail`}</span>
        <div className="detail__detail">
          <ul>
            <li>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Error,
              aliquam?
            </li>
            <li>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Error,
              aliquam?
            </li>
            <li>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Error,
              aliquam?
            </li>
          </ul>
        </div>
        <span>{`Attachment`}</span>
        <div className="detail__attachment">
          <ul>
            <li>
              <a>Attachment file 1</a>
            </li>
            <li>
              <a>Attachment file 2</a>
            </li>
            <li>
              <a>Attachment file 3</a>
            </li>
          </ul>
        </div>
        <span>{`Note`}</span>
        <span>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quae eaque,
          voluptatum inventore explicabo ex necessitatibus.
        </span>
        <span>{`Supporter`}</span>
        <div className="detail__supporter">
          {record.supporter.map((sup) => (
            <Tag color={supsColor[sup]} key={sup}>
              {sup}
            </Tag>
          ))}
        </div>
      </div>
      <div className="table__expand-row__history">
        <span>History</span>
        <Steps>
          <Step
            status="finish"
            title="Mr. LL"
            subTitle="Submitted"
            description="
      Lorem ipsum dolor sit amet."
          />
          <Step
            status="error"
            title="Mr. TL"
            subTitle="Rejected"
            description="
      Lorem ipsum dolor sit amet."
          />
        </Steps>
        <Steps>
          <Step
            status="finish"
            title="Mr. LL"
            subTitle="Re-submitted"
            description="
      Lorem ipsum dolor sit amet."
          />
          <Step
            status="finish"
            title="Mr. TL"
            subTitle="Checked"
            description="
      Lorem ipsum dolor sit amet."
          />
          <Step
            status="wait"
            title="Mr. Mgr."
            subTitle="Waiting approve"
            description="
      Lorem ipsum dolor sit amet."
          />
        </Steps>
      </div>
      <div className="table__expand-row__action">
        <Popconfirm
          title={t("dashboard.action.cancel.confirm.title")}
          okText={t("dashboard.action.cancel.confirm.ok")}
          cancelText={t("dashboard.action.cancel.confirm.cancel")}
        >
          <Button type="ghost" className="cancel">
            {t("dashboard.action.cancel.text")}
          </Button>
        </Popconfirm>
        <Popconfirm
          title={t("dashboard.action.reject.confirm.title")}
          okText={t("dashboard.action.reject.confirm.ok")}
          cancelText={t("dashboard.action.reject.confirm.cancel")}
        >
          <Button type="ghost" className="reject">
            {t("dashboard.action.reject.text")}
          </Button>
        </Popconfirm>
        <Popconfirm
          title={t("dashboard.action.approve.confirm.title")}
          okText={t("dashboard.action.approve.confirm.ok")}
          cancelText={t("dashboard.action.approve.confirm.cancel")}
        >
          <Button type="primary" className="approve">
            {t("dashboard.action.approve.text")}
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let loc = "";
  if (locale) {
    loc = locale;
  }
  return {
    props: {
      ...(await serverSideTranslations(loc, ["5m1e"])),
    },
  };
};

export default Dashboard;
