import { GetStaticPaths, GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Button,
  Form,
  Input,
  Radio,
  Checkbox,
  Upload,
  message,
  Modal,
  Select,
} from "antd";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import type { RadioChangeEvent } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import type { RcFile, UploadProps, UploadChangeParam } from "antd/lib/upload";
import type { UploadFile } from "antd/lib/upload/interface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { getBase64 } from "@/functions/common";
import { useRouter } from "next/router";
import useUser from "@/lib/useUser";
import type { ReportDataType } from "@/types/5m1e";
import { fetcher } from "@/functions/fetch";
import {
  ProductType,
  LineType,
  ProcessType,
  MachineType,
  PartType,
  CategoryType,
  ListItemType,
  ListItemDataType,
  ItemDetailType,
  LinePartType,
  ProcessMachineType,
  PartMachineType,
  RequestProcessType,
  KPIType,
} from "@/types/static";

const { TextArea } = Input;
const { Option } = Select;

const categories = [
  "Man",
  "Machine",
  "Method",
  "Material",
  "Measurement",
  "Environment",
];

const kpiList = ["Safety", "Quality", "Cost", "Delivery"];

type ReportPropsTypes = {
  request_processes: RequestProcessType;
  list_items_problem: ListItemType;
  list_items_changepoint: ListItemType;
  item_details: ItemDetailType;
  products: ProductType;
  lines: LineType;
  lines_parts: LinePartType;
  processes: ProcessType;
  processes_machines: ProcessMachineType;
  machines: MachineType;
  parts: PartType;
  parts_machines: PartMachineType;
};

const Report = (props: typeof getStaticProps & ReportPropsTypes) => {
  const { user } = useUser({
    redirectTo: "/user/login",
  });
  const {
    request_processes,
    list_items_problem,
    list_items_changepoint,
    item_details,
    products,
    lines,
    lines_parts,
    processes,
    processes_machines,
    machines,
    parts,
    parts_machines,
  }: ReportPropsTypes = props;
  const list_items: {
    [type: string]: ListItemType;
  } = {
    problem: list_items_problem,
    changepoint: list_items_changepoint,
  };

  const { t } = useTranslation("5m1e");
  const router = useRouter();
  const { type: path_t } = router.query;
  const [form] = Form.useForm();
  const [itemList, setItemList] = useState<ListItemDataType[]>([]);
  const [detailList, setDetailList] = useState<ItemDetailType>();
  const [lineList, setLineList] = useState<LineType>();
  const [processList, setProcessList] = useState<ProcessType>();
  const [machineList, setMachineList] = useState<MachineType>();
  const [partList, setPartList] = useState<PartType>();

  const [categoryValue, setCategoryValue] = useState<CategoryType>();
  const [listItemSelectedValue, setListItemSelectedValue] = useState<string>();
  const [detailSelectedValues, setDetailSelectedValues] = useState<string[]>(
    []
  );
  const [kpiValue, setKPIValue] = useState<string[]>([]);
  const [productId, setProductId] = useState<string>();
  const [lineId, setLineId] = useState<string>();
  const [processId, setProcessId] = useState<string>();
  const [machineNo, setMachineNo] = useState<string>();
  const [partNo, setPartNo] = useState<string>();
  const [previewUploadVisible, setPreviewUploadVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [attachChanged, setAttachChange] = useState(false);
  const [noteChanged, setNoteChanged] = useState(false);
  const [inputChanged, setInputChanged] = useState(false);
  const [inputCompleted, setInputCompleted] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const uploadButton = (
    <div className="upload-button">
      <FontAwesomeIcon icon={solid("plus")} />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  useEffect(() => {
    console.log(path_t);
  }, [path_t]);

  useEffect(() => {
    if (!path_t) return;
    if (!categoryValue) return;

    setItemList(list_items[path_t.toString()][categoryValue].data);

    // reset "List" when change "Category"
    setListItemSelectedValue(undefined);
    form.resetFields(["list"]);
  }, [categoryValue]);

  useEffect(() => {
    if (!categoryValue) return;
    if (!listItemSelectedValue) return;

    setDetailList(
      Object.entries(item_details)
        .filter(
          ([id, data]) =>
            data.list_item_id?.toString() === listItemSelectedValue
        )
        .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {})
    );
    // reset "Detail" list when change "List"
    setDetailSelectedValues([]);
    form.resetFields(["detail"]);
  }, [listItemSelectedValue]);

  useEffect(() => {
    if (!productId) return;

    // product to part
    const partsProducts = Object.entries(parts)
      .filter(([, data]) => data.product_id.toString() === productId)
      .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {});
    // part to lines_parts
    const linesProduct = Object.entries(lines_parts)
      .filter(([, data]) => Object.keys(partsProducts).includes(data.part_no))
      .map((data) => data[1].line_id?.toString());
    setLineList(
      Object.entries(lines)
        .filter((line) => linesProduct.includes(line[0]))
        .reduce(
          (acc, cur) => ({
            ...acc,
            [cur[0]]: cur[1],
          }),
          {}
        )
    );
    // reset "Line"
    setLineId(undefined);
    form.resetFields(["line"]);
  }, [productId]);

  useEffect(() => {
    if (!lineId) {
      setProcessList(undefined);
    } else {
      setProcessList(
        Object.entries(processes)
          .filter(([, data]) => data.line_id?.toString() === lineId)
          .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {})
      );
    }
    // reset "Process"
    setProcessId(undefined);
    form.resetFields(["process"]);
  }, [lineId]);

  useEffect(() => {
    if (!processId) {
      setMachineList(undefined);
    } else {
      // process to machine
      const processesMachines = Object.entries(processes_machines)
        .filter(([, data]) => data.process_id?.toString() === processId)
        .map((data) => data[1].machine_no);
      setMachineList(
        Object.entries(machines)
          .filter(([no]) => processesMachines.includes(no))
          .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {})
      );
    }
    // reset "Machine"
    setMachineNo(undefined);
    form.resetFields(["machine"]);
  }, [processId]);

  useEffect(() => {
    if (!machineNo) {
      setPartList(undefined);
    } else {
      // machine to part
      const machinesParts = Object.entries(parts_machines)
        .filter(([, data]) => data.machine_no?.toString() === machineNo)
        .map((data) => data[1].part_no);
      setPartList(
        Object.entries(parts)
          .filter(([no]) => machinesParts.includes(no))
          .reduce((acc, cur) => ({ ...acc, [cur[0]]: cur[1] }), {})
      );
    }
    // reset "Part"
    setPartNo(undefined);
    form.resetFields(["part"]);
  }, [machineNo]);
  //TODO submit report
  useEffect(() => {
    // set inputChanged status
    setInputChanged(true);
    // set completed status
    if (
      !categoryValue ||
      !listItemSelectedValue ||
      !(detailSelectedValues.length > 0) ||
      !kpiValue ||
      !productId ||
      !lineId
    ) {
      setInputCompleted(false);
      return;
    }

    setInputCompleted(true);
  }, [
    categoryValue,
    listItemSelectedValue,
    detailSelectedValues,
    kpiValue,
    productId,
    lineId,
  ]);

  useEffect(() => {}, []);

  // TODO status isChanged for confirm back or discard

  async function onSubmit(values: any) {
    console.log("onSubmit");
    console.log(values);
    setSubmitting(true);
    const reportData = { ...getReportData(values), user: user };

    const data = await fetcher("/api/5m1e/report/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });
    console.log("sent data = ", data);
    if (data) {
      message.success(`Submit completed, Request id: ${data.request_no}`, 5);
      onReset();
    } else {
      message.error(`Submit response return was error (response is ${data})`);
    }

    setSubmitting(false);
  }

  async function onSave() {
    console.log("onSave");
    const values = form.getFieldsValue(true);
    const reportData = getReportData(values);
  }

  function onReset() {
    console.log("onCancel");
    form.resetFields();
    setCategoryValue(undefined);
    setItemList([]);
    setListItemSelectedValue(undefined);
    setKPIValue([]);
    setDetailSelectedValues([]);
    setProductId(undefined);
  }

  function getReportData(values: any): ReportDataType {
    const detailValue: string[] = values.detail.map((detail: string) =>
      detail === "other"
        ? `${detail} : ${
            (document.getElementById("detail-input") as HTMLInputElement).value
          }` //seem to not right
        : detail
    );

    const request_process_id = path_t === "problem" ? 1 : 2;
    return {
      request_process_id: request_process_id,
      request_process_name:
        request_processes[request_process_id].request_process_short_name,
      state_id: path_t === "problem" ? 1 : 9,
      category: values.category,
      list: values.list,
      detail: detailValue,
      kpi: values.kpi,
      product_id: values.product,
      line_id: parseInt(values.line),
      process_id: values.process || "-",
      machine_no: values.machine || "-",
      part_no: values.part || "-",
      attachment: values.attachment || [],
      note: values.note || "",
    };
  }

  function onCategoryChange(e: RadioChangeEvent) {
    setCategoryValue(e.target.value);
  }

  function onListItemChange(e: RadioChangeEvent) {
    setListItemSelectedValue(e.target.value);
  }

  function onDetailChange(e: CheckboxChangeEvent) {
    let newSelected = [...detailSelectedValues];
    if (e.target.checked) {
      newSelected.push(e.target.value);
    } else {
      newSelected = newSelected.filter((v) => v !== e.target.value);
    }
    setDetailSelectedValues(newSelected);
  }

  function onProductChange(value: string) {
    setProductId(value);
  }

  function onLineChange(value: string) {
    setLineId(value);
  }

  function onProcessChange(value: string) {
    setProcessId(value);
  }

  function onMachineChange(value: string) {
    setMachineNo(value);
  }

  function onPartChange(value: string) {
    setPartNo(value);
  }

  const beforeUpload = (file: RcFile) => {
    const availableType = ["image/jpeg", "image/png", "image/bmp", "image/gif"];
    const isJpgOrPng = availableType.includes(file.type);
    if (!isJpgOrPng) {
      message.error(
        "File type not support, file must be JPG/PNG/BMP/GIF file only."
      );
    }

    const isLessThan5M = file.size / 1024 / 1024 < 5;
    if (!isLessThan5M) {
      message.error("File must less than 5MB.");
    }

    return isJpgOrPng && isLessThan5M;
  };

  const onUploadChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);
    setAttachChange(true);
  };

  const cancelPreview = () => setPreviewUploadVisible(false);

  const showPreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewUploadVisible(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  if (!user || user.isLoggedIn === false) {
    return (
      <div className="_5m1e center-main">
        <p>Not logged in yet? Please log in before using this page.</p>
      </div>
    );
  }

  // TODO define minimum position level for report
  // if (!user || user.position_id)

  return (
    <div className="_5m1e__report center-main">
      <h3>
        5M1E Report system - Report{" "}
        {path_t === "problem" ? "Problem" : "Change point"}
      </h3>
      <Form
        className="_5m1e__report__form"
        form={form}
        name="5m1e-report-form"
        onFinish={onSubmit}
        scrollToFirstError
        onReset={onReset}
      >
        <Form.Item
          name="category"
          className="_5m1e__report__form__category"
          label={t("report.category.label")}
          required
        >
          <Radio.Group
            onChange={onCategoryChange}
            value={categoryValue}
            size={"large"}
          >
            {categories.map((cat, idx) => (
              <Radio.Button key={idx} value={cat}>
                {cat}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>
        {categoryValue && (
          <Form.Item
            name="list"
            className="_5m1e__report__form__list"
            label={t("report.list.label")}
            required
          >
            <div className="_5m1e__report__form__list__wrapper">
              <Radio.Group
                value={listItemSelectedValue}
                onChange={onListItemChange}
              >
                {Object.entries(itemList)?.map(
                  ([, { list_item_id, list_item_name }], idx) => (
                    <Radio key={idx} value={list_item_id}>
                      {list_item_name}
                    </Radio>
                  )
                )}
              </Radio.Group>
            </div>
          </Form.Item>
        )}
        {listItemSelectedValue && (
          <Form.Item
            name="detail"
            className="_5m1e__report__form__detail _5m1e__report__form__detail__wrapper"
            label={t("report.detail.label")}
            required
          >
            <Checkbox.Group value={detailSelectedValues}>
              {detailList &&
                Object.entries(detailList).map(([, { item_detail }], idx) => (
                  <Checkbox
                    key={idx}
                    value={item_detail}
                    defaultChecked={false}
                    checked={detailSelectedValues.includes(item_detail)}
                    onChange={(e) => onDetailChange(e)}
                  >
                    {item_detail}
                  </Checkbox>
                ))}
              <Checkbox
                value={"other"}
                defaultChecked={false}
                checked={detailSelectedValues.includes("other")}
                onChange={(e) => onDetailChange(e)}
                className="detail__other"
              >
                <div className="detail__other__inner">
                  Other
                  {detailSelectedValues.includes("other") && (
                    <Input
                      id="detail-input"
                      placeholder="detail ..."
                      required
                    />
                  )}
                </div>
              </Checkbox>
            </Checkbox.Group>
          </Form.Item>
        )}
        {detailSelectedValues.length > 0 && (
          <div className="_5m1e__report__form__addition">
            <Form.Item
              name="kpi"
              className="_5m1e__report__form__kpi"
              label={t("report.kpi.label")}
              required
            >
              <Checkbox.Group>
                {kpiList &&
                  kpiList.map((item, idx) => (
                    <Checkbox
                      key={idx}
                      value={item}
                      defaultChecked={false}
                      onChange={(e) => onDetailChange(e)}
                    >
                      {item}
                    </Checkbox>
                  ))}
              </Checkbox.Group>
            </Form.Item>
            <Form.Item
              name="product"
              className="addition__product"
              label={t("report.product.label")}
              required
            >
              <Select
                dropdownClassName="dropdown"
                placeholder="..."
                onChange={onProductChange}
                value={productId}
              >
                {Object.entries(products).map(
                  ([id, { full_name, short_name }], idx) => (
                    <Option value={id} key={idx}>
                      {`${short_name} : ${full_name}`}
                    </Option>
                  )
                )}
              </Select>
            </Form.Item>
            <Form.Item
              name="line"
              className="addition__line"
              label={t("report.line.label")}
              required
            >
              <Select
                dropdownClassName="dropdown"
                placeholder="..."
                onChange={onLineChange}
              >
                {lineList &&
                  Object.entries(lineList).map(
                    (
                      [id, { section_id, line_name, work_center_code }],
                      idx
                    ) => (
                      <Option value={id} key={idx}>
                        {`${section_id} [${work_center_code}] : ${line_name}`}
                      </Option>
                    )
                  )}
              </Select>
            </Form.Item>
            <Form.Item
              name="process"
              className="addition__process"
              label={t("report.process.label")}
            >
              <Select
                dropdownClassName="dropdown"
                placeholder="..."
                onChange={onProcessChange}
              >
                {processList &&
                  Object.entries(processList).map(
                    ([id, { process_name }], idx) => (
                      <Option value={id} key={idx}>
                        {process_name}
                      </Option>
                    )
                  )}
              </Select>
            </Form.Item>
            <Form.Item
              name="machine"
              className="addition__machine"
              label={t("report.machine.label")}
            >
              <Select
                dropdownClassName="dropdown"
                placeholder="..."
                onChange={onMachineChange}
              >
                {machineList &&
                  Object.entries(machineList).map(
                    ([no, { machine_no }], idx) => (
                      <Option value={no} key={idx}>
                        {machine_no}
                      </Option>
                    )
                  )}
              </Select>
            </Form.Item>
            <Form.Item
              name="part"
              className="addition__part"
              label={t("report.part.label")}
            >
              <Select
                dropdownClassName="dropdown"
                placeholder="..."
                onChange={onPartChange}
              >
                {partList &&
                  Object.entries(partList).map(([no, { part_name }], idx) => (
                    <Option value={no} key={idx}>
                      {no} : {part_name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="attachment"
              className="addition__attachment"
              label={t("report.attachment.label")}
            >
              <Upload
                name="attachment"
                listType="picture-card"
                fileList={fileList}
                className="attachment-uploader"
                showUploadList={true}
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                beforeUpload={beforeUpload}
                onPreview={showPreview}
                onChange={onUploadChange}
                disabled
              >
                {fileList.length >= 5 ? null : uploadButton}
              </Upload>
            </Form.Item>
            <Form.Item
              name="note"
              className="addition__note"
              label={t("report.note.label")}
            >
              <TextArea
                rows={2}
                placeholder="Input note here ...."
                allowClear
                autoComplete="false"
                autoSize
                onChange={() => setInputChanged(true)}
              />
            </Form.Item>
          </div>
        )}

        <Form.Item className="_5m1e__report__form__button">
          <div className="button-wrapper">
            <Button type="primary" htmlType="reset" danger>
              Reset
            </Button>
            {/* <Button
              type="primary"
              htmlType="button"
              onClick={() => onSave()}
              disabled
            >
              Save
            </Button> */}
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#34D76D" }}
              disabled={!inputCompleted}
              loading={submitting}
            >
              Submit
            </Button>
          </div>
        </Form.Item>
      </Form>
      <Modal
        visible={previewUploadVisible}
        title={previewTitle}
        footer={null}
        onCancel={cancelPreview}
      >
        <img alt="file" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  let loc = "";
  if (locale) {
    loc = locale;
  }

  const data = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL_FRONTEND}/api/5m1e/static/report`,
    { method: "GET" }
  );
  const resp: ReportPropsTypes = await data.json();

  return {
    props: {
      ...(await serverSideTranslations(loc, ["5m1e"])),
      ...resp,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  return {
    paths: [],
    fallback: true,
  };
};

export default Report;
