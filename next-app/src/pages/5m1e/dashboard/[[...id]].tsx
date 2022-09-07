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
  Timeline,
} from "antd";
import type { ColumnsType, TableProps } from "antd/lib/table";
import type { FilterValue, SorterResult } from "antd/lib/table/interface";
import { fetcher } from "@/functions/fetch";
import type {
  RequestDashboardType,
  SupporterDataType,
  TableDataType,
} from "@/types/5m1e";
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
  StateTypeType,
  ModelCustomerType,
  ListItemType,
  LineDataType,
} from "@/types/static";
import useUser from "@/lib/useUser";
import { getSymbol } from "@/components/scsymbols/symbols";
import { ClockCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

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
  processes_symbols: ProcessSymbolType;
  products: ProductType;
  parts: PartType;
  models: ModelType;
  models_parts: ModelPartType;
  models_customers: ModelCustomerType;
  customers_join_plants: CustomerJoinPlantType;
  request_processes: RequestProcessType;
  list_items_problem: ListItemType;
  list_items_changepoint: ListItemType;
  state_types: StateTypeType;
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

const categories = [
  "Man",
  "Machine",
  "Method",
  "Material",
  "Measurement",
  "Environment",
];

const sups = ["PE", "QA", "SAFETY", "DESIGN", "FAC"];
const supporterColor: { [key: string]: string } = {
  PE: "purple",
  QA: "cyan",
  SAFETY: "green",
  DESIGN: "volcano",
  FAC: "magenta",
};
const stateTypes: StateTypeType = {
  "1": { state_type_name: "Start" },
  "2": { state_type_name: "Normal" },
  "3": { state_type_name: "Complete" },
  "4": { state_type_name: "Rejected" },
  "5": { state_type_name: "Cancelled" },
};
const statusList: { [status: string]: string } = {
  Start: "green",
  Normal: "green",
  Complete: "green",
  Rejected: "green",
  Cancelled: "green",
};

const actionTypes: { [action: string]: string } = {
  Approve: "green",
  Reject: "green",
  Cancel: "green",
  Resolve: "green",
  "Reject to requester": "green",
};

function getNameFormat(firstname: string, lastname: string): string {
  const newFirstname = firstname[0].toUpperCase() + firstname.slice(1);
  return `${newFirstname}.${lastname[0].toUpperCase()}`;
}

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
    processes_symbols,
    products,
    parts,
    models,
    models_parts,
    models_customers,
    customers_join_plants,
    request_processes,
    list_items_problem,
    list_items_changepoint,
    state_types,
    states_join_types,
    actions_join_types,
    transitions_join_transitions_actions,
  }: DashboardPropsTypes = props;
  const list_items: {
    [type: string]: ListItemType;
  } = {
    problem: list_items_problem,
    changepoint: list_items_changepoint,
  };
  const { t } = useTranslation("5m1e");
  const router = useRouter();
  const pathQuery = router.query;
  var socket: Socket;
  const [form] = Form.useForm();
  const [tableColumns, setTableColumns] = useState<ColumnsType<TableDataType>>(
    []
  );
  const [tableData, setTableData] = useState<TableDataType[]>();
  const [tableType, setTableType] = useState<string>("problem");
  const [tablePages, setTablePages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filteredInfo, setFilteredInfo] = useState<
    Record<string, FilterValue | null>
  >({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<TableDataType>>({});

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

  function CreateColumns() {
    const columns: ColumnsType<TableDataType> = [
      {
        key: "created",
        title: "Created",
        dataIndex: "createdAt",
        fixed: "left",
        width: 150,
        sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
        sortOrder: sortedInfo.columnKey === "created" ? sortedInfo.order : null,
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
        sorter: (a, b) => a.type.localeCompare(b.type),
        sortOrder: sortedInfo.columnKey === "type" ? sortedInfo.order : null,
        render: (_, { type }) => (
          <div className="table-column__type">
            <Tag color={type === "Problem" ? "volcano" : "geekblue"}>
              {type}
            </Tag>
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
        sorter: (a, b) => a.category.localeCompare(b.category),
        sortOrder:
          sortedInfo.columnKey === "category" ? sortedInfo.order : null,
      },
      {
        key: "product",
        title: "Product",
        dataIndex: "productName",
        width: 115,
        filters: [
          { text: "STA", value: "STA" },
          { text: "ALT", value: "ALT" },
          { text: "ECC", value: "ECC" },
          { text: "PART", value: "PART" },
        ],
        onFilter: (value: any, record) =>
          record.productName.short_name.indexOf(value.toString()) >= 0,
        filteredValue: filteredInfo.productName || null,
        sorter: (a, b) =>
          a.productName.short_name.localeCompare(b.productName.short_name),
        sortOrder: sortedInfo.columnKey === "product" ? sortedInfo.order : null,
        render: (productName) => (
          <Tooltip title={productName.full_name}>
            {productName.short_name}
          </Tooltip>
        ),
      },
      {
        key: "part",
        title: "Part",
        dataIndex: "partName",
        width: 150,
        ellipsis: {
          showTitle: false,
        },
        onFilter: (value: any, record) =>
          record.partName.indexOf(value.toString()) >= 0,
        filteredValue: filteredInfo.partName || null,
        sorter: (a, b) => a.partName.localeCompare(b.partName),
        sortOrder: sortedInfo.columnKey === "part" ? sortedInfo.order : null,
        render: (part) => (
          <Tooltip placement="topLeft" title={part}>
            {part}
          </Tooltip>
        ),
      },
      {
        key: "line",
        title: "Line",
        dataIndex: "line",
        width: 150,
        ellipsis: {
          showTitle: false,
        },
        onFilter: (value: any, record) =>
          record.line.line_name.indexOf(value.toString()) >= 0,
        filteredValue: filteredInfo.line || null,
        sorter: (a, b) => a.line.line_name.localeCompare(b.line.line_name),
        sortOrder: sortedInfo.columnKey === "line" ? sortedInfo.order : null,
        render: (line: LineDataType) => (
          <Tooltip
            placement="topLeft"
            title={`${sections[line.section_id].section_code} : ${
              line.work_center_code
            }`}
          >
            {line.line_name}
          </Tooltip>
        ),
      },
      {
        key: "topic",
        title: "Topic",
        dataIndex: "listItem",
        width: 250,
        onFilter: (value: any, record) =>
          record.listItem.indexOf(value.toString()) >= 0,
        filteredValue: filteredInfo.listItem || null,
      },
      {
        key: "informer",
        title: "Informer",
        dataIndex: "requesterName",
        width: 150,
        onFilter: (value: any, record) =>
          record.requesterName.indexOf(value.toString()) >= 0,
        filteredValue: filteredInfo.requesterName || null,
      },
      {
        key: "manager",
        title: "Manager",
        dataIndex: "mgr",
        width: 150,
        filterSearch: true,
        onFilter: (value: any, record) =>
          record.mgr.filter(
            (user) => user.firstname.indexOf(value.toString()) >= 0
          ).length > 0,
        filteredValue: filteredInfo.manager || null,
        render: (_, { mgr }) => (
          <div className="table-column__manager">
            {mgr.map((user, idx) => (
              <span key={idx}>{user.firstname}</span>
            ))}
          </div>
        ),
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
            {supporter.map((sup) => {
              let tagColor = "";
              Object.entries(supporterColor).some(([sect, color]) => {
                if (sup.group_name.indexOf(sect) >= 0) {
                  tagColor = color;
                  return true;
                }
              });
              return (
                <Tag color={tagColor} key={sup.group_id}>
                  {sup.group_name}
                </Tag>
              );
            })}
          </div>
        ),
      },
      {
        key: "status",
        title: "Status",
        dataIndex: "status",
        width: 120,
        fixed: "right",
        filters: Object.entries(stateTypes).map(
          ([state_type_id, { state_type_name }]) => ({
            text: state_type_name,
            value: state_type_id,
          })
        ),
        onFilter: (value: any, record) =>
          record.requestStatus.state_type_id == value,
        filteredValue: filteredInfo.status || null,
        sorter: (a, b) =>
          a.requestStatus.state_type_id - b.requestStatus.state_type_id,
        sortOrder: sortedInfo.columnKey === "status" ? sortedInfo.order : null,
        render: (_, { requestStatus }) => {
          const fontColor = statusList[requestStatus.state_type_name];
          return (
            <div className="table-column__status" style={{ color: fontColor }}>
              {requestStatus.state_type_name}
            </div>
          );
        },
      },
    ];
    setTableColumns(columns);
  }

  const loadAllRequestData = async () => {
    function get_sc_symbols(process_id: string): SCSymbolDataType[] {
      if (processes_symbols[process_id] == undefined) {
        return [{ character: "-", shape: "none", remark: "" }];
      }
      return processes_symbols[process_id].data.map(
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    // console.log("data = ", data);
    if (!data || Object.keys(data).length === 0) return;
    // TODO check data fetched from backend
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
        // TODO check request_process_id
        let requestType = request_processes[
          request_process_id
        ].request_process_tag_name
          .replace(/\s+/g, "")
          .toLowerCase();
        let tl: UserJoinRolePositionDataType[] = [];
        let mgr: UserJoinRolePositionDataType[] = [];
        let fm: UserJoinRolePositionDataType[] = [];
        lines_users[line_id.toString()].data.forEach(({ user_uuid }) => {
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
        let modelId =
          part_no !== "-"
            ? Object.values(models_parts).filter(
                ({ part_no: pno }) => pno === part_no
              )[0]?.model_id
            : undefined;
        let customers = modelId
          ? models_customers[modelId].data.map(
              ({ customer_id }) => customers_join_plants[customer_id]
            )
          : undefined;

        let fetchScSymbol = get_sc_symbols(process_id);

        return {
          key: idx,
          id: request_id,
          type: request_processes[request_process_id].request_process_tag_name,
          request_id: request_id,
          request_no: request_no,
          is_locked: is_locked,
          createdAt: req_created_at,
          updatedAt: req_updated_at,
          productName: products[product_id],
          partNo: part_no,
          partName: part_no !== "-" ? parts[part_no].part_name : "-",
          modelId: modelId,
          modelData: modelId ? models[modelId] : undefined,
          process: process_id !== "-" ? processes_join_types[process_id] : "-",
          scSymbol: fetchScSymbol[0].character !== "-" ? fetchScSymbol : "-",
          mcNo: machine_no,
          mcData: machines[machine_no],
          deptName:
            departments[sections[lines[line_id].section_id].department_id]
              .department_name,
          sectionCode: sections[lines[line_id].section_id].section_code,
          line: lines[line_id],
          requestDataId: request_data_id,
          requestDataCreated: data_created_at,
          requestDataUpdated: data_updated_at,
          category: category,
          listItem: list_items[requestType][category].data.filter(
            (item) => item.list_item_id.toString() === list
          )[0].list_item_name,
          itemDetail: detail,
          requestFile: files,
          requestNote: note,
          requesterName: users_join_roles_positions[req_user_uuid].firstname,
          tl: tl,
          mgr: mgr,
          fm: fm,
          supporter: concerneds.map(
            ({ concerned_user_uuid, group_id }) =>
              ({
                concerned_user_uuid: concerned_user_uuid,
                group_id: group_id,
                group_name: groups[group_id].group_name,
                group_members: group_members[group_id].data,
              } as SupporterDataType)
          ),
          requestStatus: states_join_types[current_state_id],
          requestConcern: concerneds,
          customers: customers,
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
    setTablePages(rearrangedData.length);
  };

  const onTableChange: TableProps<TableDataType>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("Various parameters", pagination, filters, sorter, extra);
    console.log("sorterBefore = ", sorter);
    console.log("sortedInfoBefore = ", sortedInfo);

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
    console.log("this is filteredInfo in onSearchSubmit: ", filteredInfo);
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

  useEffect(() => {
    // initialize socket connection
    socketInitialize();

    // initialize columns of table
    CreateColumns();

    async function InitialLoadAllRequestsData() {
      setIsLoading(true);
      await loadAllRequestData();
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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

  useEffect(() => {
    console.log("sortedInfoAfter = ", sortedInfo);
    CreateColumns()
  }, [filteredInfo,sortedInfo]);

  if (!user || user.isLoggedIn === false) {
    return (
      <div className="_5m1e center-main">
        <p>Not logged in yet? Please log in before using this page.</p>
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
                    <Radio.Button value="All">All</Radio.Button>
                    <Radio.Button value="problem">Problem</Radio.Button>
                    <Radio.Button value="changepoint">
                      Change point
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item label="Category" name="category">
                  <Select
                    mode="multiple"
                    allowClear
                    placeholder="select category"
                    style={{ width: "100%" }}
                  >
                    {categories.map((cat) => (
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
            <Button type="ghost" onClick={() => loadAllRequestData()}>
              Refresh
            </Button>
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
          columns={tableColumns}
          dataSource={tableData}
          size="large"
          loading={isLoading}
          pagination={{
            position: ["none" as TablePaginationPosition, "bottomRight"],
            showSizeChanger: true,
            onShowSizeChange: onShowSizeChange,
            hideOnSinglePage: false,
            total: tableData?.length || 0,
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
          <span>{record.deptName}</span>
        </div>

        <div className="header__person">
          <span>TL</span>
          <span>
            {record.tl
              .map(({ firstname, lastname }) =>
                getNameFormat(firstname, lastname)
              )
              .join(", ")}
          </span>
          <span>MGR</span>
          <span>
            {record.mgr
              .map(({ firstname, lastname }) =>
                getNameFormat(firstname, lastname)
              )
              .join(", ")}
          </span>
          <span>FM</span>
          <span>
            {record.fm
              .map(({ firstname, lastname }) =>
                getNameFormat(firstname, lastname)
              )
              .join(", ")}
          </span>
        </div>

        <div className="header__process">
          <span>Process</span>
          <span>
            {typeof record.process === "string"
              ? record.process
              : record.process.process_name}
          </span>
          <span>SC Point</span>
          <span>
            <div className="header__process__scsymbol">
              {typeof record.scSymbol === "string"
                ? record.scSymbol
                : record.scSymbol.map(({ character, shape, remark }, idx) =>
                    getSymbol(character, shape, remark, idx)
                  )}
            </div>
          </span>
          <span>MC No</span>
          <span>
            <Tooltip
              title={() => (
                <div>
                  <span>Name: {record.mcData.machine_name}</span>
                  <span>Type: {record.mcData.machine_type}</span>
                  <span>Brand: {record.mcData.machine_maker}</span>
                  <span>Model: {record.mcData.machine_model}</span>
                </div>
              )}
            >
              <span>{record.mcNo}</span>
            </Tooltip>
          </span>
        </div>

        <div className="header__part">
          <span>Part name</span>
          <span>
            <Tooltip title={record.partNo}>
              <span>{record.partName}</span>
            </Tooltip>
          </span>
          <span>Model</span>
          <span>
            {record.modelData ? (
              <Tooltip
                title={() => (
                  <span>Model name: {record.modelData?.model_name || "-"}</span>
                )}
              >
                <span>{record.modelData.model_code}</span>
              </Tooltip>
            ) : (
              "-"
            )}
          </span>
          <span>Customer</span>
          <span>
            <div>
              {record.customers
                ? record.customers.map((customer, idx) => (
                    <span key={idx}>{`${customer.customer_name}(${
                      customer.customer_short_name || "-"
                    }) [${customer.data
                      .filter((data) => data.customer_plant_name !== null)
                      .join(", ")}]`}</span>
                  ))
                : "-"}
            </div>
          </span>
        </div>
      </div>
      <div className="table__expand-row__detail">
        <span>{record.type}</span>
        <span>{record.listItem}</span>
        <span>{`Detail`}</span>
        <div className="detail__detail">
          <ul>
            {record.itemDetail.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <span>{`Attachment`}</span>
        <div className="detail__attachment">
          <ul>
            {record.requestFile.map((file, idx) => (
              <li key={idx}>{file.request_file_name}</li>
            ))}
          </ul>
        </div>
        <span>{`Note`}</span>
        <span>{record.requestNote}</span>
        <span>{`Supporter`}</span>
        <div className="detail__supporter">
          {record.supporter.map((sup) => {
            let tagColor = "";
            Object.entries(supporterColor).some(([sect, color]) => {
              if (sup.group_name.indexOf(sect) >= 0) {
                tagColor = color;
                return true;
              }
            });
            return (
              <Tag color={tagColor} key={sup.group_id}>
                {sup.group_name}
              </Tag>
            );
          })}
        </div>
      </div>
      {/* <div className="table__expand-row__history">
        <p>History</p>
        <Timeline mode="left">
          <Timeline.Item color="green" label="2022-06-22 16:00:00">
            <div>
              <p>Mr. LL</p>
              <p title="Submitted">Submitted</p>
            </div>
            <p>Lorem ipsum dolor sit amet.</p>
          </Timeline.Item>
          <Timeline.Item
            color="red"
            dot={<CloseCircleOutlined style={{ fontSize: "16px" }} />}
            label="2022-06-22 16:00:00"
          >
            <div>
              <p>Mr. TL</p>
              <p title="Rejected"> Rejected</p>
            </div>
            <p>Lorem ipsum dolor sit amet.</p>
          </Timeline.Item>
          <Timeline.Item color="green" label="2022-06-22 16:00:00">
            <div>
              <p>Mr. LL</p>
              <p title="Submitted">Submitted</p>
            </div>
            <p>Lorem ipsum dolor sit amet.</p>
          </Timeline.Item>
          <Timeline.Item color="green" label="2022-06-22 16:00:00">
            <div>
              <p>Mr. TL</p>
              <p title="Checked">Checked</p>
            </div>
            <p>Lorem ipsum dolor sit amet.</p>
          </Timeline.Item>
          <Timeline.Item
            color="blue"
            dot={<ClockCircleOutlined style={{ fontSize: "16px" }} />}
            label="2022-06-22 16:00:00"
          >
            <div>
              <p>Mr. MGR</p>
              <p title="Waiting">Waiting approve</p>
            </div>
            <p>Lorem ipsum dolor sit amet.</p>
          </Timeline.Item>
        </Timeline>
      </div> */}
      {/* <div className="table__expand-row__action">
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
      </div> */}
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
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
