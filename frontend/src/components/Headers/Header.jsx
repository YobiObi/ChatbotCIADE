import { useAuth } from "../../context/AuthContext";
import HeaderPublico from "./HeaderPublico";
import HeaderPrivado from "./HeaderPrivado";

export default function Header() {
  const { user, cargando } = useAuth();

  if (cargando) return null;

  return user?.role?.name ? <HeaderPrivado /> : <HeaderPublico />;
}
