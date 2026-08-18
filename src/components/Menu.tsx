import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Menu() {
  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuth();

  const menus = [
    { nome: "📊 Dashboard", rota: "/" },
    { nome: "👥 Clientes", rota: "/clientes" },
    { nome: "📞 Contatos", rota: "/contatos" },
    { nome: "💰 Receitas", rota: "/receitas" },
    { nome: "💸 Despesas", rota: "/despesas" },
    { nome: "💳 Parcelas", rota: "/parcelas" },
    { nome: "📅 Tarefas", rota: "/tarefas" },
    { nome: "🔍 Pesquisa", rota: "/pesquisa" },
  ];

  async function sair() {
    try {
      await logout();
      navigate("/login");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div
      style={{
        width: 230,
        background: "#1f2937",
        color: "#fff",
        minHeight: "100vh",
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ textAlign: "center" }}>
        Sistema Financeiro
      </h2>

      <hr />

      <div>
        {menus.map((menu) => (
          <Link
            key={menu.rota}
            to={menu.rota}
            style={{
              display: "block",
              padding: "12px",
              marginBottom: "8px",
              borderRadius: 8,
              textDecoration: "none",
              color: "#fff",
              background:
                location.pathname === menu.rota
                  ? "#2563eb"
                  : "transparent",
            }}
          >
            {menu.nome}
          </Link>
        ))}
      </div>

      <button
        onClick={sair}
        style={{
          marginTop: "auto",
          width: "100%",
          padding: "12px",
          border: "none",
          borderRadius: 8,
          background: "#dc2626",
          color: "#fff",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        🚪 Sair
      </button>
    </div>
  );
}