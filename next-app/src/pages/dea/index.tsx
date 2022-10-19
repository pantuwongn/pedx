import React, { useState, useEffect } from "react";
import Qrscanner from "@/components/camera/qrscanner";
import PDFObject from "pdfobject";
import { PDFDocument } from "pdf-lib";
import { DatePicker } from "antd";
import moment, { Moment } from "moment";

const Cam = () => {
  const dateFormat = "DD/MM/YYYY";
  const [qrResult, setQrResult] = useState<string>("");
  const [startDate, setStartDate] = useState<Moment | null>(moment());

  useEffect(() => {
    console.log(startDate?.format(dateFormat));
  }, [startDate]);

  return (
    <div className="dea center-main">
      <Qrscanner setResult={setQrResult} />
      <p>{qrResult}</p>
      <DatePicker
        defaultValue={moment()}
        onChange={(date: Moment | null) => setStartDate(moment(date))}
        format={dateFormat}
      />
    </div>
  );
};

export default Cam;
