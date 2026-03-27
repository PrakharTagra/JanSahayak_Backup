import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import { Login } from "./pages/Auth/Login";
import { Signup } from "./pages/Auth/Signup";
import  MyReports from "./pages/User/MyReports";
import  ReportIssue  from "./pages/User/ReportIssue";
import UserDashboard from "./pages/User/UserDashboard";
import Feed from "./pages/User/Feed";
import AuthorityDashboard from "./pages/Authority/AuthorityDashboard";
import VolunteerForm from "./pages/User/VolunteerForm";
import { VerifyEmail } from "./pages/Auth/VerifyEmail";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/user/myreports" element={<MyReports/>}/>
      <Route path="/user/userdashboard" element={<UserDashboard/>}/>
      <Route path="/user/reportissue" element={<ReportIssue/>}/>
      <Route path="/user/feed" element={<Feed/>}/>
      <Route path="/user/volunteerform" element={<VolunteerForm/>}/>
      <Route path="/authoritydashboard" element={<AuthorityDashboard/>}/>
      <Route path="/verify-email" element={<VerifyEmail />} />
    </Routes>
  );
}

export default App;
