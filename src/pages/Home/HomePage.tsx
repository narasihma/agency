import { HOME } from "@/data/home.ts";
import "./HomePage.css";

/** Home page (/): a placeholder until the site has a design */
export default function HomePage() {
  return (
    <main className="home-page">
      <h1>{HOME.title}</h1>
      <p>{HOME.lede}</p>
    </main>
  );
}
