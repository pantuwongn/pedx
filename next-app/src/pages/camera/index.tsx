import React, { useState } from "react";
import Qrscanner from "@/components/common/qrscanner"


const Cam = () => {
  const [qrResult,setQrResult] = useState<string>("")

  return (
    <div className="cam-test">
      <Qrscanner setResult={setQrResult}/>
      <p>{qrResult}</p>
    </div>
  )
};

export default Cam;
