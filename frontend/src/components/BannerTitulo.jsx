// Banner.jsx
import bgHands from "../images/manos.jpg";

export default function Banner({ title }) {
  return (
    <div
      className="faq-banner"
      style={{
        backgroundImage: `url(${bgHands})`,
      }}
    >
      <h1>{title}</h1>
    </div>
  );
}
