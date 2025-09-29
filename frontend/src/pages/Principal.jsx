import principalImagen from "../images/Ciade-Principal.png";

export default function Home() {
  return (
    <div
      className="home-hero"
      style={{
        backgroundImage: `url(${principalImagen})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        height: "100vh",
        width: "105%",
      }}
    >
      {/* Si quieres agregar algo encima de la imagen, como un logo o botón, lo puedes poner aquí */}
    </div>
  );
}
