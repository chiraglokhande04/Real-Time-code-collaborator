import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import MainPage from "./pages/MainPage";



function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/createroom" element={<CreateRoom />} />
          <Route path="/joinroom" element={<JoinRoom />} />
          <Route path="/room/:id" element={<MainPage/>} />

        </Routes>
      </Router>
    </>
  );
}

export default App;
