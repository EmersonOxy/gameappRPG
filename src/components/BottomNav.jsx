import { NavLink } from "react-router-dom";
import { Home, Swords, Layers, Store, User } from "lucide-react";
import "./BottomNav.css";

const tabs = [
  { to: "/home", label: "Início", icon: Home, end: true },
  { to: "/home/battle", label: "Batalha", icon: Swords },
  { to: "/home/cards", label: "Cartas", icon: Layers },
  { to: "/home/shop", label: "Loja", icon: Store },
  { to: "/home/profile", label: "Perfil", icon: User },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {tabs.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <Icon size={22} strokeWidth={2.2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
