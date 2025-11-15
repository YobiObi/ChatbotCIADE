// src/pages/Auth/ResetPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../../components/BannerTitulo";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setOkMsg("");

    if (!email) {
      setErrorMsg("Ingresa tu correo institucional.");
      return;
    }

    // adapta esto a tu formato institucional si quieres
    const regex = /^[a-z]+\.[a-z]+@uandresbello\.edu$/i;
    if (!regex.test(email)) {
      setErrorMsg("El correo ingresado no es válido. Usa tu correo institucional.");
      return;
    }

    try {
      setCargando(true);

      // origen actual (dev o prod)
      const origin = window.location.origin;
      console.log("ORIGIN RESET PASSWORD:", origin);

      await sendPasswordResetEmail(auth, email, {
        // cuando el usuario termine en la página de Firebase,
        // lo vamos a mandar de vuelta al login
        url: `${origin}/login`,
        handleCodeInApp: true,
      });

      setOkMsg(
        "Te enviamos un correo con el enlace para restablecer tu contraseña. Revisa tu bandeja de entrada."
      );
    } catch (error) {
      console.error("Error al enviar reset password:", error);
      const code = error?.code || "";
      if (code === "auth/user-not-found") {
        setErrorMsg("No existe una cuenta con ese correo institucional.");
      } else if (code === "auth/invalid-email") {
        setErrorMsg("El correo ingresado no es válido.");
      } else if (code === "auth/too-many-requests") {
        setErrorMsg("Has solicitado varios restablecimientos. Intenta más tarde.");
      } else if (code === "auth/invalid-continue-uri") {
        setErrorMsg("La URL de retorno no está autorizada en Firebase.");
      } else {
        setErrorMsg("No pudimos enviar el correo. Intenta nuevamente.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Banner title="Restablecer contraseña" />
      <div className="container my-5" style={{ maxWidth: "520px" }}>
        <form
          onSubmit={handleSubmit}
          className="shadow p-4 rounded bg-light fw-semibold"
          style={{ color: "#003366" }}
        >
          <h2 className="mb-3 text-center">¿Olvidaste tu contraseña?</h2>
          <p className="text-muted">
            Ingresa tu correo institucional y te enviaremos un enlace para que cambies tu
            contraseña. El enlace se abrirá en la página segura de Firebase, y cuando termines,
            volverás al inicio de sesión.
          </p>

          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
          {okMsg && (
            <div className="alert alert-success">
              {okMsg}
            </div>
          )}

          {/* Si ya se envió, no muestres el form de nuevo */}
          {!okMsg && (
            <>
              <div className="mb-3">
                <label className="form-label">Correo institucional</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  placeholder="nombre.apellido@uandresbello.edu"
                  required
                />
              </div>

              <div className="text-center">
                <button type="submit" className="btn-institucional" disabled={cargando}>
                  {cargando ? "Enviando..." : "Enviar enlace"}
                </button>
              </div>
            </>
          )}

          <div className="mt-3 text-center">
            <button
              type="button"
              className="btn btn-link p-0"
              style={{ color: "#003366" }}
              onClick={() => navigate("/login")}
            >
              Volver a iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
