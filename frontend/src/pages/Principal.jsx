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
        minHeight: "100vh",
        width: "100%",
      }}
    >
    </div>
  );
}
