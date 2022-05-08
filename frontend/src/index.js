import React from 'react';
import { Route, Routes, BrowserRouter as Router} from 'react-router-dom';
import { LandingPage, RequestMM, ProfilePage, NotFound } from './pages'
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path='/' element={ <LandingPage />}/>
      <Route path='/requestmm' element={ <RequestMM />}/>
      <Route path='/profile/:mmid' element={ <ProfilePage />}/>
      <Route path="*" element={ <NotFound />}/>
    </Routes>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
