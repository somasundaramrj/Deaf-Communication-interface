import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./authentication/login.jsx";
import SignUpPage from "./authentication/deafreg.jsx";
import GestureBridgeHomepage from "./component/home.jsx";
import  Home from "./component/openhomw.jsx";
import Learn from "./component/show.jsx";
import Tuter from "./component/vedio.jsx";
import Call from "./component/VideoChat.jsx";
import VideoChat from "./view.jsx";
import DeafDashboard from "./component/dashbaord.jsx";
import DeafSafetyGuide from "./component/safety.jsx";  
import Map from "./component/maps.jsx";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GestureBridgeHomepage />}/>
        <Route path="/signup" element={<SignUpPage />}/>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/home" element={<Home/>}/>
        <Route path="/learn" element={<Learn/>}/>
        <Route path="/tuter" element={<Tuter/>}/>
        <Route path="/call" element={<Call/>}/>
        <Route path="/videochat" element={<VideoChat/>}/>
        <Route path="/dashboard" element={<DeafDashboard/>}/>
        <Route path="/safety" element={<DeafSafetyGuide/>}/>
        <Route path="/map" element={<Map/>}/>
      </Routes>
    </Router>
  );
}
