import axios from 'axios';

const BASE_URL = "http://localhost:" + "3001" + "/api"


export const requestMm = async (mmId, product, currency) => {
    const { data } = await axios.post(`${BASE_URL}/mm/request/middleman`, {
        mmId,
        product,
        currency
    }, { withCredentials: true })
    return data
}

export const isLoggedIn = async () => {
    const { data } = await axios.get(`${BASE_URL}/auth/`, { withCredentials: true })
    return data
}
export const getMmlist = async () => {
    const { data } = await axios.get(`${BASE_URL}/mm/getmiddlemans`, { withCredentials: true })
    return data
}
export const getMm = async ( mmId ) => {
    const { data } = await axios.get(`${BASE_URL}/mm/getmm/${mmId}`, { withCredentials: true })
    return data
}
export const vouchMm = async (mmId, feedback) => {
    const { data } = await axios.post(`${BASE_URL}/mm/feedback/${mmId}`, {
        comment: feedback
    }, { withCredentials: true })
    return data
}