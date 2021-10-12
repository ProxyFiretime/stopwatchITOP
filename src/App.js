import React, { useEffect, useState } from "react";
import { interval, Subject, fromEvent, pipe } from "rxjs";
import "./App.css";
import { map, buffer, filter, debounceTime, takeUntil } from "rxjs/operators";

function App() {
  const [time, setTime] = useState(0);
  const [watchOn, setWatchOn] = useState(false);
  const [btnText, setBtnText] = useState("Start");

  useEffect(() => {
    !watchOn ? setBtnText("Start") : setBtnText("Stop");
    const button = document.querySelector("#double-click");
    const click$ = fromEvent(button, "click");

    const doubleClick$ = click$.pipe(
      buffer(click$.pipe(debounceTime(300))),
      map((clicks) => clicks.length),
      filter((clicksLength) => clicksLength >= 2)
    );

    const unsubscribe$ = new Subject();
    interval(1000)
      .pipe(takeUntil(unsubscribe$))
      .subscribe(() => {
        if (watchOn) {
          setTime((val) => val + 1);
        }
      });
    return () => {
      unsubscribe$.next();
      unsubscribe$.complete();
      doubleClick$.subscribe((_) => {
        console.log("double clicked detected", _);
        handleWait();
      });
    };
  }, [watchOn, time]);

  const handleStart = () => {
    setWatchOn((prevState) => !prevState);
    if (btnText === "Stop") {
      setTime(0);
    }
  };
  const handleWait = () => {
    if (time !== 0) {
      setWatchOn(false);
    }
  };
  const handleReset = () => {
    setTime(300);
    setWatchOn(true);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>Секундомер</h1>
        <h2>для ITOP Agency</h2>
        <div className="timer-container">
          <span>{("0" + Math.floor((time / 3600) % 100)).slice(-2)}:</span>
          <span>{("0" + Math.floor((time / 60) % 60)).slice(-2)}:</span>
          <span>{("0" + Math.floor(time % 60)).slice(-2)}</span>
        </div>
        <div className="btn-container">
          <div>
            <button onClick={handleStart} className="btn">
              {btnText}
            </button>
          </div>
          <div>
            <button id="double-click" className="btn">
              Wait
            </button>
            <button onClick={handleReset} className="btn">
              Reset
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
