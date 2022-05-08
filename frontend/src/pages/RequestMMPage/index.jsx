import React from 'react';
import { RequestMmForm } from '../../components'
import { isLoggedIn, requestMm } from '../../utils/api'
import './index.css';

const login = () => window.location.href = "http://localhost:3001" + "/api/auth/discord/redirect"
export function RequestMM() {
  const [loggedIn, setLoggedin] = React.useState(null);
  React.useEffect(() => {
    isLoggedIn().then(data => {
      if (data.message == "Unauthorized") {
        setLoggedin(false);
      } else {
        setLoggedin(true);
      }
    })

  }, [])
  return (
    <div>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="shortcut icon" href="assets/img/securemm.png" type="image/x-icon" />
      <link rel="stylesheet" href="assets/css/middleman.css" />
      <section className="main">
        <div className="topbar">
          <div className="brand-text-logo-box">
            <img src="https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png" alt="secureMM" className="securemm-logo" />
            <h1 className="brand-name-text">SecureMM</h1>
          </div>
          <a className="returnBtn" href="/">Return Home <i className="fa-solid fa-rotate-left" /></a>
        </div>
        {loggedIn ? <div>
          {
            <div className='flex flex-row justify-center items-center'>
              <RequestMmForm />
            </div>
          }
        </div> : <div>
          <h1 className='text-center text-3xl text-black'>Login to request MiddleMan</h1>
          <br />
          <button onClick={login} className="block p-6 max-w-[20rem] bg-[#51cf66] hover:bg-[#37b24d] text-gray-800 py-2 px-4 rounded-xl text-center text-xl cursor-pointer mr-auto ml-auto hover:ease-in duration-200">Login to request MM</button>
        </div>}
      </section>
    </div>
  )
}