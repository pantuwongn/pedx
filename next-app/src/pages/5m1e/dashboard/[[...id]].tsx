import React, { useEffect, useState, FC } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
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
import type { FilterValue, SorterResult } from "antd/lib/table/interface";
import { fetcher } from "@/functions/fetch";
import type { RequestDashboardType,SupporterDataType,TableDataType } from "@/types/5m1e";
import type {
  DepartmentType,
  SectionType,
  LineType,
  LineUserType,
  MachineType,
  SCSymbolType,
  ProcessJoinTypeType,
  ProcessSymbolType,
  ModelType,
  ModelPartType,
  RequestProcessType,
  StateJoinTypeType,
  ActionJoinTypeType,
  UserJoinRolePositionType,
  PartType,
  ProductType,
  SCSymbolDataType,
  UserJoinRolePositionDataType,
  GroupMemberType,
  GroupType,
  CustomerJoinPlantType,
  TransitionJoinTransitionActionType,
} from "@/types/static";
import useUser from "@/lib/useUser";

const { Option } = Select;
const { Panel } = Collapse;
const { Step } = Steps;

type DashboardPropsTypes = {
  users_join_roles_positions: UserJoinRolePositionType;
  groups: GroupType;
  group_members: GroupMemberType;
  departments: DepartmentType;
  sections: SectionType;
  lines: LineType;
  lines_users: LineUserType;
  machines: MachineType;
  processes_join_types: ProcessJoinTypeType;
  sc_symbols: SCSymbolType;
  processes_symbol: ProcessSymbolType;
  products: ProductType;
  parts: PartType;
  models: ModelType;
  models_parts: ModelPartType;
  customers_join_plants: CustomerJoinPlantType;
  request_processes: RequestProcessType;
  states_join_types: StateJoinTypeType;
  actions_join_types: ActionJoinTypeType;
  transitions_join_transitions_actions: TransitionJoinTransitionActionType;
};

type TablePaginationPosition =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";

const sups = ["PE", "QA", "SAFETY", "DESIGN", "FAC"];
const supporterColor: { [key: string]: string } = {
  PE: "purple",
  QA: "cyan",
  SAFETY: "green",
  DESIGN: "volcano",
  FAC: "magenta",
};

const Dashboard = (props: typeof getStaticProps & DashboardPropsTypes) => {
  const { user } = useUser({
    redirectTo: "/user/login",
  });
  const {
    users_join_roles_positions,
    groups,
    group_members,
    departments,
    sections,
    lines,
    lines_users,
    machines,
    processes_join_types,
    sc_symbols,
    processes_symbol,
    products,
    parts,
    models,
    models_parts,
    customers_join_plants,
    request_processes,
    states_join_types,
    actions_join_types,
    transitions_join_transitions_actions,
  }: DashboardPropsTypes = props;
  const { t } = useTranslation("5m1e");
  const router = useRouter();
  const pathQuery = router.query;
  var socket: Socket;
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState<TableDataType[]>();
  const [tableType, setTableType] = useState<string>("problem");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<TableDataType>>({});

  const columns: ColumnsType<TableDataType> = [
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
            <Tag color={supporterColor[sup]} key={sup}>
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

    async function InitialLoadAllRequestsData() {
      setIsLoading(true);
      await loadAllRequestData();
      setIsLoading(false);
    }
    InitialLoadAllRequestsData();
  }, []);

  useEffect(() => {
    const { t, c, p, l, li, i, m } = pathQuery;
    if (typeof t === "string") {
      setTableType(t);
    }
    const selector = {
      type: t,
      category: c,
      part: p,
      line: l,
      list: li,
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

  const loadAllRequestData = async () => {
    function get_sc_symbols(process_id: string): SCSymbolDataType[] {
      return processes_symbol[process_id].map(
        ({ sc_symbol_id }) => sc_symbols[sc_symbol_id.toString()]
      );
    }

    const body = {
      t: "1,2",
      t_name: "5M1E",
      access_token: user?.access_token,
    };
    const data: RequestDashboardType = await fetcher(
      "/api/5m1e/dashboard/getallrequests",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    // rearrange for table data format
    const rearrangedData: TableDataType[] = Object.entries(data).map(
      (
        [
          request_id,
          {
            is_locked,
            request_process_id,
            line_id,
            current_state_id,
            request_data_id,
            request_data_value: {
              category,
              list,
              detail,
              product_id,
              process_id,
              machine_no,
              part_no,
              note,
            },
            req_created_at,
            req_updated_at,
            req_user_uuid,
            data_created_at,
            data_updated_at,
            request_no,
            actions,
            files,
            concerneds,
          },
        ],
        idx
      ) => {
        let tl: UserJoinRolePositionDataType[] = [];
        let mgr: UserJoinRolePositionDataType[] = [];
        let fm: UserJoinRolePositionDataType[] = [];
        lines_users[line_id].forEach(({ user_uuid }) => {
          if (users_join_roles_positions[user_uuid].position_name === "TL") {
            tl.push(users_join_roles_positions[user_uuid]);
          } else if (
            users_join_roles_positions[user_uuid].position_name === "MGR"
          ) {
            mgr.push(users_join_roles_positions[user_uuid]);
          } else if (
            users_join_roles_positions[user_uuid].position_name === "FM"
          ) {
            fm.push(users_join_roles_positions[user_uuid]);
          }
        });
        let modelData =
          models[
            Object.values(models_parts).filter(
              ({ part_no: pno }) => pno === part_no
            )[0].model_id
          ];
        return {
          key: idx,
          id: request_id,
          type: request_processes[request_process_id].request_process_short_name,
          request_id: request_id,
          request_no: request_no,
          is_locked: is_locked,
          createdAt: req_created_at,
          updatedAt: req_updated_at,
          productName: products[product_id],
          partNo: part_no,
          partName: part_no !== "-" ? parts[part_no].part_name : "-",
          processName:
            process_id !== "-" ? processes_join_types[process_id] : "-",
          scSymbol: process_id !== "-" ? get_sc_symbols(process_id) : "-",
          mcNo: machines[machine_no],
          deptName:
            departments[sections[lines[line_id].section_id].department_id]
              .department_name,
          sectionCode: sections[lines[line_id].section_id].section_code,
          lineName: lines[line_id],
          requestDataId: request_data_id,
          requestDataCreated: data_created_at,
          requestDataUpdated: data_updated_at,
          category: category,
          listItem: list,
          itemDetail: detail,
          requestFile: files,
          requestNote: note,
          requesterName: users_join_roles_positions[req_user_uuid].firstname,
          tlName: tl,
          mgrName: mgr,
          fmName: fm,
          supporter: concerneds.map(({ concerned_user_uuid, group_id }) => ({
            concerned_user_uuid: concerned_user_uuid,
            group_id: group_id,
            group_name: groups[group_id].group_name,
            group_members: group_members[group_id],
          } as SupporterDataType)) ,
          requestStatus: states_join_types[current_state_id],
          requestConcern: concerneds,
          modelName: modelData,
          customerName: customers_join_plants[modelData.customer_id],
          actions: actions,
          actionButton: Object.entries(
            transitions_join_transitions_actions
          ).reduce(
            (acc, [id, data]) =>
              data.current_state_id === current_state_id
                ? { ...acc, [id]: data }
                : {},
            {} as TransitionJoinTransitionActionType
          ),
        };
      }
    );
    setTableData(rearrangedData);
  };

  const onTableChange: TableProps<TableDataType>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<TableDataType>);
    // check current data source is zero
    // then increase margin for prevent overlap
    // with clear button
    // checkDataForTableMargin(extra.currentDataSource);
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
    // checkDataForTableMargin(data);
  };

  const clearSorters = () => {
    setSortedInfo({});
    // checkDataForTableMargin(data)
  };

  const checkDataForTableMargin = (data: TableDataType[]) => {
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

  if (!user || user.isLoggedIn === false) {
    return (
      <div className="_5m1e center-main">
        <p>Not logged in yet, please log in before use this page.</p>
      </div>
    );
  }

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
          loading={isLoading}
          pagination={{
            position: ["none" as TablePaginationPosition, "bottomRight"],
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

const TableExpand: FC<{ record: TableDataType }> = ({ record }) => {
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
            <Tag color={supporterColor[sup]} key={sup}>
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

  const data = await fetch(
    `${process.env.BASE_URL_FRONTEND}/api/5m1e/static/dashboard`,
    { method: "GET" }
  );
  const resp: DashboardPropsTypes = await data.json();

  return {
    props: {
      ...(await serverSideTranslations(loc, ["5m1e"])),
      ...resp,
    },
  };
};

export default Dashboard;
