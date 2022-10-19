import { EffectCallback } from "react";

const delayFunction = (
  func: EffectCallback | { payload: any; type: string },
  delay: number,
  dispatch: any
) => {
  setTimeout(() => {
    if (typeof func === "function") {
      func();
    } else if (func.type) {
      dispatch(func);
    }
  }, delay);
};

export default delayFunction;
