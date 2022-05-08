import React from "react";
import { Formik } from "formik";
import { vouchMm } from '../../utils/api'
export function VouchMM(
    {
        mmId
    }
) {
    return (
        <div>
            <Formik
                initialValues={{ comment: "Comment" }}
                onSubmit={async ({ comment }) => {
                    document.getElementById("middleman").className = "block p-6 max-w-[20rem] bg-[#51cf66] hover:bg-[#37b24d] text-gray-800 py-2 px-4 rounded-xl text-center text-xl cursor-not-allowed mr-auto ml-auto";
                    await vouchMm(mmId, comment).then(data => {
                        setTimeout(() => {
                            window.location.reload()
                        }, 2000)
                    })
                }}
            >
                {
                    (props) => (
                        <form onSubmit={props.handleSubmit} id="ok">
                            <br />
                            <label className='block text-black text-sm font-bold mb-2 text-center'>Type In Your comment</label>
                            <input maxLength={256} type="text" name="comment" defaultValue={"Comment"} onChange={props.handleChange} className="shadow appearance-none border border-red-500 rounded w-[20rem] py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ml-auto mr-auto" />
                            <br />
                            <button type="submit" children="Vouch" className='block p-6 max-w-[20rem] bg-[#51cf66] hover:bg-[#37b24d] text-gray-800 py-2 px-4 rounded-xl text-center text-xl cursor-pointer mr-auto ml-auto hover:ease-in duration-200' id="middleman" />
                        </form>
                    )
                }
            </Formik>
        </div>
    )
}