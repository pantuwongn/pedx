import {
  FC,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

export interface TimerProps {
  startSignal?: boolean;
  pauseSignal?: boolean;
  stopSignal?: boolean;
  resetSignal?: boolean;
  startFunction?: () => void;
  pauseFunction?: () => void;
  stopFunction?: () => void;
  resetFunction?: () => void;
  abbrMessage?: string;
  returnTimerRunningFlagFunction?: (
    flag: boolean
  ) => void | Dispatch<SetStateAction<boolean>>;
}

const Timer: FC<TimerProps> = (props) => {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState("00:00");
  const [timer, setTimer] = useState<NodeJS.Timer>();
  const timerCounter = useRef<() => void>();

  const timerCountUp = () => {
    setCount(count + 1);
  };

  function clearTimerInterval() {
    if (timer) {
      clearInterval(timer);
      if (props.returnTimerRunningFlagFunction) {
        props.returnTimerRunningFlagFunction(false);
      }
    }
  }

  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, []);

  useEffect(() => {
    timerCounter.current = timerCountUp;
  }, [timerCountUp]);

  useEffect(() => {
    //start signal
    if (props.startSignal) {
      setCount(0);
      if (timer) {
        clearTimerInterval();
      }
      let interval = setInterval(() => {
        if (timerCounter.current) {
          timerCounter.current();
        }
      }, 1000);
      setTimer(interval);
      if (props.returnTimerRunningFlagFunction) {
        props.returnTimerRunningFlagFunction(true);
      }
    } else if (timer && !props.startSignal && props.stopSignal === undefined) {
      clearTimerInterval();
    }
  }, [props.startSignal]);

  useEffect(() => {
    //stop signal
    if (props.stopSignal) {
      clearTimerInterval();
    }
  }, [props.stopSignal]);

  useEffect(() => {
    //reset signal
    if (props.resetSignal) {
      setCount(0);
    }
  }, [props.resetSignal]);

  useEffect(() => {
    // const currentTimer = moment(count * 1000)
    let minutes = Math.floor(count / 60);
    let seconds = count - minutes * 60;
    let timeValue =
      `${minutes.toLocaleString("en-US", { minimumIntegerDigits: 2 })}` +
      `:${seconds.toLocaleString("en-US", { minimumIntegerDigits: 2 })}`;
    setTime(timeValue);
  }, [count]);

  return (
    <div className="timer">
      <abbr title={props.abbrMessage}>
        <p>
          <strong>{time}</strong>
        </p>
      </abbr>
    </div>
  );
};

export default Timer;
