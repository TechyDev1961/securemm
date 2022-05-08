import React from "react";
import "./index.css";
import { VouchMM } from '../../components'
import { useParams } from 'react-router-dom';
import { getMm, isLoggedIn } from '../../utils/api'
const login = () => window.location.href = "http://localhost:3001" + "/api/auth/discord/redirect"
export function ProfilePage() {
    const { mmid } = useParams();
    const [mm, setMM] = React.useState({});
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        isLoggedIn().then((data) => {
            if (data.message === "Unauthorized") {
                setLoggedIn(false)
            } else {
                setLoggedIn(true)
                getMm(mmid).then((data) => {
                    if (data.message == "Mm not found") {
                        window.location.href = "/"
                    }
                    setMM(data.mm)
                    setLoading(false)
                })
            }
        })
    }, [])
    return (
        <div>
            {loggedIn == false ? <div>
                <section className="main">
                    <div className="topbar">
                        <div className="brand-text-logo-box">
                            <img src="https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png" alt="secureMM" className="securemm-logo" />
                            <h1 className="brand-name-text">SecureMM</h1>
                        </div>
                        <a className="returnBtn" href="/">Return Home <i className="fa-solid fa-rotate-left" /></a>
                    </div>
                    <h1 className='text-center text-3xl text-black'>Login to view this profile</h1>
                    <br />
                    <button onClick={login} className="block p-6 max-w-[20rem] bg-[#51cf66] hover:bg-[#37b24d] text-gray-800 py-2 px-4 rounded-xl text-center text-xl cursor-pointer mr-auto ml-auto">Login to view this profile</button>
                </section>
            </div> : <div>
                {loading ? <div>
                    <h1>Loading</h1>
                </div> : <div>
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
                        <div>
                            <img src={mm.avatar} className="rounded-full mr-auto ml-auto" />
                            <h1 className="text-3xl text-black m-0 text-center">{mm.username}</h1>
                            <br />
                            <h1 className="text-center text-2xl text-black">Rating: <strong>{mm.rating}</strong></h1>
                            <br />
                            <div>
                                <h1 className="text-center text-2xl text-black">Vouches: (<strong>{mm.vouches.length}</strong>)</h1>
                                <br />
                                {
                                    mm.vouches.map((vouch) => (
                                        <div>
                                            <h1 className="text-center text-black text-1xl">{vouch.username}</h1>
                                            <h1 className="text-center text-black text-1xl">Comment: <strong>{vouch.comment}</strong></h1>
                                            <br ></br>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <br />
                        <br />
                        <br />
                        <div className="flex flex-row justify-center items-center">
                            <VouchMM mmId={mmid} />
                        </div>
                    </section></div>
                }
            </div>}
        </div>
    )
}