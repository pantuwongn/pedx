import React, { useState, useEffect } from "react";
import Qrscanner from "@/components/common/qrscanner";
import PDFObject from "pdfobject";
import { PDFDocument } from "pdf-lib";
import DatePicker from "react-datepicker";

const Cam = () => {
  const [qrResult, setQrResult] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(new Date());

  useEffect(() => {
    console.log(PDFObject.pdfobjectversion);
    console.log(PDFDocument.name);
  }, []);

  return (
    <div className="center-main dea">
      <Qrscanner setResult={setQrResult} />
      <p>{qrResult}</p>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
      />
    </div>
  );
};

export default Cam;
