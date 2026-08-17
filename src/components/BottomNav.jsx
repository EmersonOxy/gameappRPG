import { NavLink } from "react-router-dom";
import { Store, Sparkles, Swords, Map, Pickaxe } from "lucide-react";
import "./BottomNav.css";

const tabs = [
  { to: "/home/shop", label: "Loja", Icon: Store },
  { to: "/home/skills", label: "Poderes", Icon: Sparkles },
  { to: "/home", label: "Início", Icon: Swords, end: true, isHero: true },
  { to: "/home/map", label: "Mapas", Icon: Map },
  { to: "/home/mine", label: "Mina", Icon: Pickaxe },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, Icon, end, isHero }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `nav-item ${isHero ? "nav-item-hero" : ""} ${isActive ? "active" : ""}`
          }
        >
          <div className="nav-icon-box">
            <Icon size={isHero ? 24 : 20} className="nav-icon" />
          </div>
          <span className="nav-label">{label}</span>
          <div className="nav-active-pip" />
        </NavLink>
      ))}
    </nav>
  );
}