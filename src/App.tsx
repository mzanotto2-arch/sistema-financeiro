import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Contatos from "./pages/Contatos";
import Receitas from "./pages/Receitas";
import Despesas from "./pages/Despesas";
import Parcelas from "./pages/Parcelas";
import Pagamentos from "./pages/Pagamentos";
import Pesquisa from "./pages/Pesquisa";
import Tarefas from "./pages/Tarefas";

import Login from "./auth/Login";
import RedefinirSenha from "./auth/RedefinirSenha";
import ProtectedRoute from "./auth/ProtectedRoute";

import PortalLogin from "./portal/PortalLogin";
import PortalHome from "./portal/PortalHome";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PORTAL DA INSTITUIÇÃO
           ========================= */}

        <Route
          path="/portal"
          element={<PortalLogin />}
        />

        <Route
          path="/portal/documentos"
          element={<PortalHome />}
        />

        {/* =========================
            LOGIN DO SISTEMA
           ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* REDEFINIR SENHA */}

        <Route
          path="/redefinir-senha"
          element={<RedefinirSenha />}
        />

        {/* =========================
            SISTEMA FINANCEIRO
           ========================= */}

        {/* DASHBOARD */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* CLIENTES */}

        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Layout>
                <Clientes />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* CONTATOS */}

        <Route
          path="/contatos"
          element={
            <ProtectedRoute>
              <Layout>
                <Contatos />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* RECEITAS */}

        <Route
          path="/receitas"
          element={
            <ProtectedRoute>
              <Layout>
                <Receitas />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* DESPESAS */}

        <Route
          path="/despesas"
          element={
            <ProtectedRoute>
              <Layout>
                <Despesas />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* PARCELAS */}

        <Route
          path="/parcelas"
          element={
            <ProtectedRoute>
              <Layout>
                <Parcelas />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* PAGAMENTOS */}

        <Route
          path="/pagamentos"
          element={
            <ProtectedRoute>
              <Layout>
                <Pagamentos />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* TAREFAS */}

        <Route
          path="/tarefas"
          element={
            <ProtectedRoute>
              <Layout>
                <Tarefas />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* PESQUISA */}

        <Route
          path="/pesquisa"
          element={
            <ProtectedRoute>
              <Layout>
                <Pesquisa />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;