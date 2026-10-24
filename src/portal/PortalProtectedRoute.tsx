
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

export default function PortalProtectedRoute({ children }: Props) {
  const usuarioId = sessionStorage.getItem("portal_usuario_id");
  const instituicaoId = sessionStorage.getItem("portal_instituicao_id");
  const propostaId = sessionStorage.getItem("portal_proposta_id");
  const tipoUsuario = sessionStorage.getItem("portal_tipo_usuario");

  const acessoValido = Boolean(
    usuarioId &&
      instituicaoId &&
      propostaId &&
      (tipoUsuario === "instituicao" || tipoUsuario === "consultor")
  );

  if (!acessoValido) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}
