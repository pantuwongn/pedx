import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Button,
  Form,
  Space,
  Input,
  Radio,
  Checkbox,
  Dropdown,
  Menu,
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

const { TextArea } = Input;
const { Option } = Select;

interface LineType {
  [lineid: string]: {
    name: string;
    code: string;
    wc: string;
  };
}

interface PartType {
  no: string;
  name: string;
}

const categories = [
  "Man",
  "Machine",
  "Method",
  "Material",
  "Measurement",
  "Environment",
];

const problems: {
  [key: string]: { [key: string]: { tag: string; details: string[] } };
} = {
  Man: {
    "1": {
      tag: "เกิดอุบัติเหตุกับพนักงาน",
      details: ["Man1-1", "Man1-2", "Man1-3"],
    },
    "2": {
      tag: "พนักงานไม่พอ ผลิตงานแบบปกติไม่ได้",
      details: ["Man2-1", "Man2-2", "Man2-3"],
    },
    "3": {
      tag: "พนักงานไม่พอ ต้องหยุดการผลิต",
      details: ["Man3-1", "Man3-2", "Man3-3"],
    },
  },
  Machine: {
    "1": {
      tag: "เครื่องจักรเสียต้องหยุดการผลิต",
      details: ["Machine1-1", "Machine1-2", "Machine1-3"],
    },
    "2": {
      tag: "Jig ประกอบเสียใช้งานไม่ได้",
      details: ["Machine2-1", "Machine2-2", "Machine2-3"],
    },
    "3": {
      tag: "Die/Mold เสีย ต้องหยุดการผลิต",
      details: ["Machine3-1", "Machine3-2", "Machine3-3"],
    },
    "4": {
      tag: "Tooling เสีย ใช้งานไม่ได้",
      details: ["Machine4-1", "Machine4-2", "Machine4-3"],
    },
    "5": {
      tag: "Sensor เสีย ใช้งานไม่ได้",
      details: ["Machine5-1", "Machine5-2", "Machine5-3"],
    },
  },
  Method: {
    "1": {
      tag: "ผลิตงานด้วย Condition/Parameter เดิมไม่ได้ ต้องหยุดการผลิต",
      details: ["Method1-1", "Method1-2", "Method1-3"],
    },
    "2": {
      tag: "ผลิตงานด้วยวิธีการเดิมไม่ได้",
      details: ["Method2-1", "Method2-2", "Method2-3"],
    },
  },
  Material: {
    "1": {
      tag: "Material/Part ที่ใช้ประกอบเสีย ต้องหยุดการผลิต",
      details: ["Material1-1", "Material1-2", "Material1-3"],
    },
    "2": {
      tag: "Material/Part ผิด spec",
      details: ["Material2-1", "Material2-2", "Material2-3"],
    },
  },
  Measurement: {
    "1": {
      tag: "เครื่องมือวัดเสีย ใช้วัดชิ้นงานไม่ได้",
      details: ["Meas1-1", "Meas1-2", "Meas1-3"],
    },
    "2": {
      tag: "Jig เช็คงานเสีย ใช้งานไม่ได้",
      details: ["Meas2-1", "Meas2-2", "Meas2-3"],
    },
    "3": {
      tag: "Master เสีย ใช้งานไม่ได้",
      details: ["Meas3-1", "Meas3-2", "Meas3-3"],
    },
    "4": {
      tag: "Pokayoke เสีย ใช้ป้องกันไม่ได้",
      details: ["Meas4-1", "Meas4-2", "Meas4-3"],
    },
    "5": {
      tag: "นำเครื่องมือวัดไปทำการสอบเทียบ",
      details: ["Meas5-1", "Meas5-2", "Meas5-3"],
    },
    "6": {
      tag: "นำ Master ไปทำการสอบเทียบ",
      details: ["Meas6-1", "Meas6-2", "Meas6-3"],
    },
  },
  Environment: {
    "1": { tag: "ไฟดับ", details: ["Envi1-1", "Envi1-2", "Envi1-3"] },
    "2": {
      tag: "อุณหภูมิ หรือ ความชื้น เกินกว่าที่กำหนด",
      details: ["Envi2-1", "Envi2-2", "Envi2-3"],
    },
    "3": { tag: "โยกย้าย Machine", details: ["Envi3-1", "Envi3-2", "Envi3-3"] },
    "4": {
      tag: "หยุดไลน์เพื่อทำการผลิตงาน Trial",
      details: ["Envi4-1", "Envi4-2", "Envi4-3"],
    },
  },
};

const products = ["STA", "ALT", "ECC", "PART"];

const lines: {
  [product: string]: LineType;
} = {
  STA: {
    "1": { name: "STA-Line1", code: "4201", wc: "S100" },
    "2": { name: "STA-Line2", code: "4202", wc: "S101" },
    "3": { name: "STA-Line3", code: "4203", wc: "S102" },
  },
  ALT: {
    "1": { name: "ALT-Line1", code: "4101", wc: "A100" },
    "2": { name: "ALT-Line2", code: "4102", wc: "A101" },
    "3": { name: "ALT-Line3", code: "4103", wc: "A102" },
  },
  ECC: {
    "1": { name: "ECC-Line1", code: "4001", wc: "E100" },
    "2": { name: "ECC-Line2", code: "4002", wc: "E101" },
    "3": { name: "ECC-Line3", code: "4003", wc: "E102" },
  },
  PART: {
    "1": { name: "PART-Line1", code: "4301", wc: "P100" },
    "2": { name: "PART-Line2", code: "4302", wc: "P101" },
    "3": { name: "PART-Line3", code: "4303", wc: "P102" },
  },
};

const procs: { [lineId: string]: string[] } = {
  "1": ["Line_1_Proc_1", "Line_1_Proc_2", "Line_1_Proc_3"],
  "2": ["Line_2_Proc_1", "Line_2_Proc_2", "Line_2_Proc_3"],
  "3": ["Line_3_Proc_1", "Line_3_Proc_2", "Line_3_Proc_3"],
};

const machines: { [process: string]: string[] } = {
  "1": ["Proc_1_MC_1", "Proc_1_MC_2", "Proc_1_MC_3"],
  "2": ["Proc_2_MC_1", "Proc_2_MC_2", "Proc_2_MC_3"],
  "3": ["Proc_3_MC_1", "Proc_3_MC_2", "Proc_3_MC_3"],
};

const parts: { [lineid: string]: PartType[] } = {
  "1": [
    { no: "TG100001", name: "Line1_part-1" },
    { no: "TG100002", name: "Line1_part-2" },
    { no: "TG100003", name: "Line1_part-3" },
  ],
  "2": [
    { no: "TG200001", name: "Line2_part-1" },
    { no: "TG200002", name: "Line2_part-2" },
    { no: "TG200003", name: "Line2_part-3" },
  ],
  "3": [
    { no: "TG300001", name: "Line3_part-1" },
    { no: "TG300002", name: "Line3_part-2" },
    { no: "TG300003", name: "Line3_part-3" },
  ],
};

const Report = () => {
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
  const [form] = Form.useForm();
  const [detailList, setDetailList] = useState<string[]>([]);
  const [lineList, setLineList] = useState<LineType>();
  const [processList, setProcessList] = useState<string[]>([]);
  const [machineList, setMachineList] = useState<string[]>([]);
  const [partList, setPartList] = useState<PartType[]>();

  const [categoryValue, setCategoryValue] = useState<string>();
  const [problemSelectedValue, setProblemSelectedValue] = useState<string>();
  const [detailSelectedValues, setDetailSelectedValues] = useState<string[]>(
    []
  );
  const [product, setProduct] = useState<string>();
  const [lineId, setLineId] = useState<string>();
  const [process, setProcess] = useState<string>();
  const [machine, setMachine] = useState<string>();
  const [part, setPart] = useState<string>();
  const [previewUploadVisible, setPreviewUploadVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [attachChanged, setAttachChange] = useState(false);
  const [noteChanged, setNoteChanged] = useState(false);
  const [inputChanged, setInputChanged] = useState(false);
  const [inputCompleted, setInputCompleted] = useState(false);

  const uploadButton = (
    <div className="upload-button">
      <FontAwesomeIcon icon={solid("plus")} />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  useEffect(() => {
    console.log(pathQuery);
  }, [pathQuery]);

  useEffect(() => {
    // reset "List" when change "Category"
    setProblemSelectedValue(undefined);
    form.resetFields(["problem"]);
  }, [categoryValue]);

  useEffect(() => {
    // reset "Detail" list when change "List"
    if (!categoryValue) return;
    if (!problemSelectedValue) return;

    setDetailList(problems[categoryValue][problemSelectedValue]["details"]);
    setDetailSelectedValues([])
    form.resetFields(["detail"]);
  }, [problemSelectedValue]);

  useEffect(() => {
    if (!product) return;

    setLineList(lines[product]);
    // reset "Line"
    setLineId(undefined)
    form.resetFields(["line"]);
  }, [product]);

  useEffect(() => {
    if (!lineId) return;

    setProcessList(procs[lineId]);
    // reset "Process"
    form.resetFields(["process"]);
  }, [lineId]);

  useEffect(() => {
    if (!process) return;

    setMachineList(machines[process.charAt(process.length - 1)]);
    // reset "Machine"
    form.resetFields(["machine"]);
  }, [process]);

  useEffect(() => {
    if (!machine) return;

    setPartList(parts[machine.charAt(machine.length - 1)]);
    // reset "Part"
    form.resetFields(["part"]);
  }, [machine]);

  useEffect(() => {
    // set inputChanged status
    setInputChanged(true);
    // set completed status
    if (
      !categoryValue ||
      !problemSelectedValue ||
      !(detailSelectedValues.length > 0) ||
      !product ||
      !lineId
    ) {
      setInputCompleted(false);
      return;
    }

    setInputCompleted(true);
  }, [
    categoryValue,
    problemSelectedValue,
    detailSelectedValues,
    product,
    lineId,
  ]);

  useEffect(() => {}, []);

  // TODO status isChanged for confirm back or discard

  function onSubmit(values: any) {
    console.log("onSubmit");
    console.log(values);
  }

  function onSave() {
    console.log("onSave");
  }

  function onCancel(values: any) {
    console.log("onCancel");
    console.log(values);
  }

  function onCategoryChange(e: RadioChangeEvent) {
    setCategoryValue(e.target.value);
  }

  function onProblemChange(e: RadioChangeEvent) {
    setProblemSelectedValue(e.target.value);
  }

  function onDetailChange(e: CheckboxChangeEvent) {
    let newSelected = [...detailSelectedValues];
    if (newSelected.includes(e.target.value)) {
      newSelected.filter((v) => v !== e.target.value);
    } else {
      newSelected.push(e.target.value);
    }
    setDetailSelectedValues(newSelected);
  }

  function clearDetail() {
    setDetailSelectedValues([]);
  }

  function onProductChange(value: string) {
    setProduct(value);
  }

  function onLineChange(value: string) {
    setLineId(value);
  }

  function onProcessChange(value: string) {
    setProcess(value);
  }

  function onMachineChange(value: string) {
    setMachine(value);
  }

  function onPartChange(value: string) {
    setPart(value);
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

  return (
    <div className="_5m1e__report center-main">
      <h3>5M1E Report system - Report {pathQuery.t}</h3>
      <Form
        className="_5m1e__report__form"
        form={form}
        name="5m1e-report-form"
        onFinish={onSubmit}
        scrollToFirstError
        onReset={onCancel}
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
            name="problem"
            className="_5m1e__report__form__problem"
            label={t("report.problem.label")}
            required
          >
            <div className="_5m1e__report__form__problem__wrapper">
              <Radio.Group
                value={problemSelectedValue}
                onChange={onProblemChange}
              >
                {Object.entries(problems[categoryValue])?.map(
                  ([key, val], idx) => (
                    <Radio key={idx} value={key}>
                      {val.tag}
                    </Radio>
                  )
                )}
              </Radio.Group>
            </div>
          </Form.Item>
        )}
        {problemSelectedValue && (
          <Form.Item
            name="detail"
            className="_5m1e__report__form__detail _5m1e__report__form__detail__wrapper"
            label={t("report.detail.label")}
            required
          >
            <Checkbox.Group>
              {detailList.map((detail, idx) => (
                <Checkbox
                  key={idx}
                  value={detail}
                  defaultChecked={false}
                  checked={detailSelectedValues.includes(detail)}
                  onChange={(e) => onDetailChange(e)}
                >
                  {detail}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>
        )}
        {detailSelectedValues.length > 0 && (
          <div className="_5m1e__report__form__addition">
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
              >
                {products.map((product, idx) => (
                  <Option value={product} key={idx}>
                    {product}
                  </Option>
                ))}
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
                  Object.entries(lineList).map(([id, detail], idx) => (
                    <Option value={id} key={idx}>
                      {detail.code} : {detail.name}
                    </Option>
                  ))}
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
                {lineList &&
                  processList.map((detail, idx) => (
                    <Option value={detail} key={idx}>
                      {detail}
                    </Option>
                  ))}
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
                {lineList &&
                  machineList.map((detail, idx) => (
                    <Option value={detail} key={idx}>
                      {detail}
                    </Option>
                  ))}
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
                  Object.entries(partList).map(([id, detail], idx) => (
                    <Option value={detail.name} key={idx}>
                      {detail.no} : {detail.name}
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
              Cancel
            </Button>
            <Button type="primary" htmlType="button" onClick={() => onSave()}>
              Save
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              style={{ backgroundColor: "#34D76D" }}
              disabled={!inputCompleted}
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
  return {
    props: {
      ...(await serverSideTranslations(loc, ["5m1e"])),
    },
  };
};

export default Report;
