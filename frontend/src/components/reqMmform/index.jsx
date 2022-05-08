import { Formik } from 'formik'
import { getMmlist, isLoggedIn, requestMm } from '../../utils/api'
import React from 'react'

export function RequestMmForm(
) {
  const [mms, setMms] = React.useState([]);
  React.useEffect(() => {
    getMmlist().then(data => {
      setMms(data.mms)
    })
    isLoggedIn().then(data => {
      const lastRequest = new Date(localStorage.getItem('lastRequest'));
      const currentTime = new Date();
      const difference = currentTime.getTime() - lastRequest.getTime();

      if (difference < 300000) {
        document.getElementById("ok").className = "hidden"
        document.getElementById("h-1").className = "text-black text-2xl text-center"
        document.getElementById("h-1").innerText = "Slow down buckaroo, you need to wait before you can request a new middleman!"
        const FULL_DASH_ARRAY = 283;
        const WARNING_THRESHOLD = 60;
        const ALERT_THRESHOLD = 10;

        const COLOR_CODES = {
          info: {
            color: "green"
          },
          warning: {
            color: "orange",
            threshold: WARNING_THRESHOLD
          },
          alert: {
            color: "red",
            threshold: ALERT_THRESHOLD
          }
        };

        const TIME_LIMIT = 300;
        let timePassed = Math.floor((300000 - difference) / 1000);
        let timeLeft = TIME_LIMIT;
        let timerInterval = null;
        let remainingPathColor = COLOR_CODES.info.color;

        document.getElementById("app").innerHTML = `
                <div class="base-timer">
                  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <g class="base-timer__circle">
                      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                      <path
                        id="base-timer-path-remaining"
                        stroke-dasharray="283"
                        class="base-timer__path-remaining ${remainingPathColor}"
                        d="
                          M 50, 50
                          m -45, 0
                          a 45,45 0 1,0 90,0
                          a 45,45 0 1,0 -90,0
                        "
                      ></path>
                    </g>
                  </svg>
                  <span id="base-timer-label" class="base-timer__label">${formatTime(
          timeLeft
        )}</span>
                </div>
                `;

        startTimer();

        function sleep(time) {
          return new Promise(resolve => setTimeout(resolve, time));
        }

        function onTimesUp() {
          clearInterval(timerInterval);
          sleep(1000).then(() => {
            window.location.reload();
          });
        }

        function startTimer() {
          timerInterval = setInterval(() => {
            timePassed = timePassed += 1;
            timeLeft = TIME_LIMIT - timePassed;
            document.getElementById("base-timer-label").innerHTML = formatTime(
              timeLeft
            );
            setCircleDasharray();
            setRemainingPathColor(timeLeft);

            if (timeLeft === 0) {
              onTimesUp();
            }
          }, 1000);
        }

        function formatTime(time) {
          const minutes = Math.floor(time / 60);
          let seconds = time % 60;

          if (seconds < 10) {
            seconds = `0${seconds}`;
          }

          return `${minutes}:${seconds}`;
        }

        function setRemainingPathColor(timeLeft) {
          const { alert, warning, info } = COLOR_CODES;
          if (timeLeft <= alert.threshold) {
            document
              .getElementById("base-timer-path-remaining")
              .classList.remove(warning.color);
            document
              .getElementById("base-timer-path-remaining")
              .classList.add(alert.color);
          } else if (timeLeft <= warning.threshold) {
            document
              .getElementById("base-timer-path-remaining")
              .classList.remove(info.color);
            document
              .getElementById("base-timer-path-remaining")
              .classList.add(warning.color);
          }
        }

        function calculateTimeFraction() {
          const rawTimeFraction = timeLeft / TIME_LIMIT;
          return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
        }

        function setCircleDasharray() {
          const circleDasharray = `${(
            calculateTimeFraction() * FULL_DASH_ARRAY
          ).toFixed(0)} 283`;
          document
            .getElementById("base-timer-path-remaining")
            .setAttribute("stroke-dasharray", circleDasharray);
        }
      }
    })
  }, [])
  return (
    <div>
      <h1 className='hidden' id="h-1">Your request was successful, you will be notified on Discord once the MiddleMan accepts the request</h1>
      <div class="timer-center" id="app"></div>
      <Formik
        initialValues={{ mmId: mms[0], product: "Product", currency: "Paypal" }}
        onSubmit={async ({ mmId, product, currency }) => {
          document.getElementById("middleman").className = "block p-6 max-w-[20rem] bg-[#51cf66] hover:bg-[#37b24d] text-gray-800 py-2 px-4 rounded-xl text-center text-xl cursor-not-allowed mr-auto ml-auto"
          await requestMm(mmId, product, currency).then(data => {
            if (data.success) {
              document.getElementById("ok").className = "hidden"
              document.getElementById("h-1").className = "text-black text-2xl text-center"
              //save the date of the request
              const date = new Date()
              const dateString = date.toString()
              localStorage.setItem("lastRequest", dateString)
            } else {
              document.getElementById("ok").className = "hidden"
              document.getElementById("h-1").className = "text-black text-2xl text-center"
              document.getElementById("h-1").innerText = "The request failed, you are probably ratelimited"
            }
          })
        }}
      >
        {
          (props) => (
            <form onSubmit={props.handleSubmit} id="ok">
              <label className='block text-black text-sm font-bold mb-2'>Select Your MiddleMan</label>
              <select name="mmId" onChange={props.handleChange} className="w-[20rem] rounded py-2 px-3">
                {
                  mms.map((mm) => (
                    <option value={mm.userID}>{mm.displayName}</option>
                  ))
                }
              </select>
              <label className='block text-black text-sm font-bold mb-2'>Type In Your Product</label>
              <input maxLength={256} type="text" name="product" defaultValue={"Product"} onChange={props.handleChange} className="shadow appearance-none border rounded w-[20rem] py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" />
              <label className='block text-black text-sm font-bold mb-2'>Select Your Payment Method</label>
              <select name="currency" onChange={props.handleChange} className="w-[20rem] rounded py-2 px-3 mb-3">
                <option value={"Paypal"}>Paypal</option>
                <option value={"Crypto"}>Crypto</option>
                <option value={"Cashapp"}>Cashapp</option>
              </select>
              <br />
              <button type="submit" children="Request MiddleMan" className='block p-6 max-w-[20rem] bg-[#51cf66] hover:bg-[#37b24d] text-gray-800 py-2 px-4 rounded-xl text-center text-xl cursor-pointer mr-auto ml-auto hover:ease-in duration-200' id="middleman" />
            </form>
          )
        }
      </Formik>
    </div>


  )
}