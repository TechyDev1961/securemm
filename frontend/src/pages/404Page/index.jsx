import React from "react";
const goBack = () => window.location.href = "/"
export function NotFound() {
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
        <h1 className="text-center text-3xl text-black"><strong>404 |</strong> The page you are looking for was not found</h1>
        <br />
        <button onClick={goBack} className="block p-6 max-w-[20rem] bg-[#51cf66] hover:bg-[#37b24d] text-gray-800 py-2 px-4 rounded-xl text-center text-xl cursor-pointer mr-auto ml-auto hover:ease-in duration-200">Return Home</button>
      </section>
    </div>
  )
}