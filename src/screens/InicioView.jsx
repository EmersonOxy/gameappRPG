import { useNavigate } from "react-router-dom";
import { Swords } from "lucide-react";
import "./InicioView.css";

export default function InicioView() {
  const navigate = useNavigate();

  return (
    <div className="inicio-view">
      <h2>Bem-vindo, Aventureiro!</h2>
      <p>Pronto para a batalha?</p>
      <button className="btn-battle" onClick={() => navigate("/battle")}>
        <Swords size={20} />
        Batalhar
      </button>
    </div>
  );
}
