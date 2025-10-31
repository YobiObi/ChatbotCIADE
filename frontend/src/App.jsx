import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

import ChatbotIconSVG from "./components/Chatbot/ChatbotIconSVG.jsx"
import DialogflowMessenger from './components/Chatbot/DialogflowMessenger.jsx';


import RutaProtegida from "./routes/RutaProtegida";

import BloquearSiAutenticado from "./components/BloquearSiAutenticado";
import Header from "./components/Headers/Header.jsx";
import Footer from "./components/Footer";

import Principal from "./pages/Principal"
import FAQ from "./pages/Usuario/FAQ"
import CoordinacionesCIADE from "./pages/CoordinacionesCIADE";
import AccesoUsuario from "./pages/Usuario/AccesoUsuario"
import RegistroUsuario from "./pages/Usuario/RegistroUsuario";
import Login from "./pages/Usuario/LoginUsuario";
import ResetPassword from "./pages/Usuario/ResetPassword";

import AgendarCita from "./pages/Alumno/AgendarCita";
import CitasAlumno from "./pages/Alumno/CitasAlumno";

import PanelCoordinacion from "./pages/Coordinación/PanelCoordinacion"
import PanelAdmin from './pages/Admin/PanelAdmin.jsx';

function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AuthProvider>
        <Router>
          <Header />
            <main className="flex-grow-1">
              <Routes>
                <Route path="/" element={<Principal />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/coordinaciones" element={<CoordinacionesCIADE />} />
                <Route path="/agendarcita" element={<RutaProtegida rolPermitido="Alumno"><AgendarCita /></RutaProtegida>}/>
                <Route path="/alumno/citas" element={<RutaProtegida rolPermitido="Alumno"><CitasAlumno /></RutaProtegida>}/>
                <Route path="/acceso-usuario" element={<AccesoUsuario />} />
                <Route path="/registro" element={<BloquearSiAutenticado><RegistroUsuario /></BloquearSiAutenticado>} />
                <Route path="/login" element={<BloquearSiAutenticado><Login /></BloquearSiAutenticado>} />
                <Route path="/restablecer" element={<ResetPassword />} />
                <Route path="/panel-coordinacion"element={<RutaProtegida rolPermitido="Coordinacion"><PanelCoordinacion /></RutaProtegida>}/>
                <Route path="/panel-admin" element={<RutaProtegida rolPermitido="Admin"><PanelAdmin /></RutaProtegida >}/>
              </Routes>
            </main>
            <Footer />

            <ChatbotIconSVG onClick={() => {
              const bot = document.getElementById("chatbot-ciade");
              if (bot) {
                bot.style.display = bot.style.display === "none" ? "block" : "none";
              }
            }} />
            <DialogflowMessenger />

          </Router>
        </AuthProvider>
    </div>
  );
}

export default App;
