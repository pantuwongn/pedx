import React, { FC, useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useRef } from "react";

interface QrScannerType {
  setResult: React.Dispatch<React.SetStateAction<string>>;
}

const Qrscanner: FC<QrScannerType> = (props) => {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [cameraId, setCameraId] = useState<string>("");
  const [cameraActivated, setCameraActivated] = useState<boolean>(false);
  const cameraScan = useRef<Html5Qrcode>();
  const { setResult } = props;

  function triggerCamera() {
    Html5Qrcode.getCameras()
      .then((devices) => {
        setCameras(devices);
        if (devices.length > 0) {
          setCameraId(devices[0].id);
        }
      })
      .catch((err) => console.warn(err));
  }

  function startCamera() {
    const cameraScanner = new Html5Qrcode("camera-scanner");
    cameraScanner
      .start(
        cameraId,
        {
          fps: 5,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText, decodedResult) => {
          console.log(decodedText);
          // console.log(decodedResult)
          stopCamera();
          setResult(decodedText);
        },
        (errorMessage) => {
          // console.log(errorMessage);
        }
      )
      .then((ignore) => {
        setResult("");
        setCameraActivated(true);
        cameraScan.current = cameraScanner;
      })
      .catch((err) => console.warn(err));
  }

  const stopCamera = () => {
    if (cameraScan.current) {
      cameraScan.current.stop().then((ignore) => {
        setCameraActivated(false);
      });
    }
  };

  return (
    <div id="camera">
      <p>Pro mode camera</p>
      {cameras.length == 0 ? (
        <button className="button is-primary" onClick={triggerCamera}>
          Get camera
        </button>
      ) : (
        <>
          <div className="select">
            <select
              id="camera-selector"
              onChange={(e) => setCameraId(e.currentTarget.value)}
              value={cameraId}
            >
              {cameras.map((cam, idx) => {
                return (
                  <option key={idx} value={cam.id}>
                    {cam.label}
                  </option>
                );
              })}
            </select>
          </div>
          {cameraActivated ? (
            <button className="button is-warning" onClick={() => stopCamera()}>
              stop scanning
            </button>
          ) : (
            <button className="button is-link" onClick={() => startCamera()}>
              start scanning
            </button>
          )}
        </>
      )}
      <button className="button" onClick={() => console.log(cameraScan)}>
        get selected camera
      </button>
      <div id="camera-scanner" style={{ width: "600px" }}></div>
    </div>
  );
};

export default Qrscanner;
