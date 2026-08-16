import { NavLink } from "react-router-dom";
import "./BottomNav.css";

const tabs = [
  { to: "/home/shop", label: "Loja", icon: "cart" },
  { to: "/home/skills", label: "Habilidades", icon: "star" },
  { to: "/home", label: "Início", icon: "home", end: true },
  { to: "/home/map", label: "Mapa", icon: "levels" },
  { to: "/home/mine", label: "Mina", icon: "pickaxe" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}