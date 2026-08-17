import { useEffect, useState } from "react";
import type { Cliente } from "../types/cliente";
import {
  listarClientes,
  salvarCliente,
  atualizarCliente,
  excluirCliente,
} from "../services/clientesService";

export default function Clientes() {
  const [id, setId] = useState<number | undefined>();

  const [proposta, setProposta] = useState("");
  const [instituicao, setInstituicao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [contrato, setContrato] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState("");
  const [parcelaAtual, setParcelaAtual] = useState("");

  const [diaVencimento, setDiaVencimento] = useState("");
  const [inicioVigencia, setInicioVigencia] = useState("");
  const [fimVigencia, setFimVigencia] = useState("");

  const [grupoWhatsapp, setGrupoWhatsapp] = useState("");
  const [pastaDocumentos, setPastaDocumentos] = useState("");
  const [consultor, setConsultor] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const lista = await listarClientes();
      setClientes(lista);
    } catch (error) {
      console.error(error);
    }
  }

  async function salvar() {
 
  if (!proposta.trim()) {
    alert("Informe o número da proposta.");
    return;
  }

  if (!instituicao.trim()) {
    alert("Informe a instituição.");
    return;
  }

  const cliente: Cliente = {
    proposta: Number(proposta),
    instituicao,
    responsavel,
    telefone,
    email,
    contrato,
    valor_parcela: Number(valorParcela),
    quantidade_parcelas: Number(quantidadeParcelas),
    parcela_atual: parcelaAtual,
    dia_vencimento: Number(diaVencimento),
    inicio_vigencia: inicioVigencia,
    fim_vigencia: fimVigencia,
    grupo_whatsapp: grupoWhatsapp,
    pasta_documentos: pastaDocumentos,
    consultor,
    observacoes,
  };

  console.log("Cliente enviado:", cliente);

  try {
    if (id) {
      await atualizarCliente({
        id,
        ...cliente,
      });

      alert("Cliente atualizado!");
    } else {
      await salvarCliente(cliente);

      alert("Cliente salvo!");
    }

    limparFormulario();
    await carregarClientes();

  } catch (error) {
    console.error(error);
    alert("Erro ao salvar o cliente.");
  }
}
  function editar(cliente: Cliente) {
    setId(cliente.id);

    setProposta(String(cliente.proposta));
    setInstituicao(cliente.instituicao);
    setResponsavel(cliente.responsavel);
    setTelefone(cliente.telefone);
    setEmail(cliente.email);

    setContrato(cliente.contrato);
    setValorParcela(String(cliente.valor_parcela));
    setQuantidadeParcelas(String(cliente.quantidade_parcelas));
    setParcelaAtual(cliente.parcela_atual);

    setDiaVencimento(String(cliente.dia_vencimento));
    setInicioVigencia(cliente.inicio_vigencia);
    setFimVigencia(cliente.fim_vigencia);

    setGrupoWhatsapp(cliente.grupo_whatsapp);
    setPastaDocumentos(cliente.pasta_documentos);
    setConsultor(cliente.consultor);
    setObservacoes(cliente.observacoes);
  }

  async function excluir(id: number) {
  if (!confirm("Deseja excluir este cliente?")) return;

  console.log("ID recebido:", id);

  try {
    await excluirCliente(id);

    console.log("Cliente excluído.");

    await carregarClientes();
  } catch (error) {
    console.error(error);
  }
}

  function limparFormulario() {
    setId(undefined);

    setProposta("");
    setInstituicao("");
    setResponsavel("");
    setTelefone("");
    setEmail("");

    setContrato("");
    setValorParcela("");
    setQuantidadeParcelas("");
    setParcelaAtual("");

    setDiaVencimento("");
    setInicioVigencia("");
    setFimVigencia("");

    setGrupoWhatsapp("");
    setPastaDocumentos("");
    setConsultor("");
    setObservacoes("");
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial" }}>
      <h2>👥 Cadastro de Clientes</h2>
         <p>Nº da Proposta</p>

      <input
        value={proposta}
        onChange={(e) => setProposta(e.target.value)}
        style={{ width: 200 }}
      />

      <p>Instituição</p>

      <input
        value={instituicao}
        onChange={(e) => setInstituicao(e.target.value)}
        style={{ width: 400 }}
      />

      <p>Responsável</p>

      <input
        value={responsavel}
        onChange={(e) => setResponsavel(e.target.value)}
        style={{ width: 400 }}
      />

      <p>Telefone</p>

      <input
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{ width: 250 }}
      />

      <p>E-mail</p>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: 400 }}
      />

      <hr />

      <h3>Contrato</h3>

      <p>Nº do Contrato</p>

      <input
        value={contrato}
        onChange={(e) => setContrato(e.target.value)}
        style={{ width: 250 }}
      />

      <p>Valor da Parcela</p>

      <input
        type="number"
        value={valorParcela}
        onChange={(e) => setValorParcela(e.target.value)}
        style={{ width: 180 }}
      />

      <p>Quantidade de Parcelas</p>

      <input
        type="number"
        value={quantidadeParcelas}
        onChange={(e) => setQuantidadeParcelas(e.target.value)}
        style={{ width: 180 }}
      />

      <p>Parcela Atual</p>

      <input
        value={parcelaAtual}
        onChange={(e) => setParcelaAtual(e.target.value)}
        placeholder="Ex.: 1/12"
        style={{ width: 180 }}
      />

      <p>Dia do Vencimento</p>

      <input
        type="number"
        value={diaVencimento}
        onChange={(e) => setDiaVencimento(e.target.value)}
        style={{ width: 120 }}
      />

      <p>Início da Vigência</p>

      <input
        type="date"
        value={inicioVigencia}
        onChange={(e) => setInicioVigencia(e.target.value)}
      />

      <p>Fim da Vigência</p>

      <input
        type="date"
        value={fimVigencia}
        onChange={(e) => setFimVigencia(e.target.value)}
      />

      <hr />

      <h3>Informações Adicionais</h3>

      <p>Grupo WhatsApp</p>

      <input
        value={grupoWhatsapp}
        onChange={(e) => setGrupoWhatsapp(e.target.value)}
        style={{ width: 400 }}
      />

      <p>Pasta de Documentos</p>

      <input
        value={pastaDocumentos}
        onChange={(e) => setPastaDocumentos(e.target.value)}
        style={{ width: 400 }}
      />

      <p>Consultor</p>

      <input
        value={consultor}
        onChange={(e) => setConsultor(e.target.value)}
        style={{ width: 300 }}
      />

      <p>Observações</p>

      <textarea
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        rows={4}
        style={{ width: 500 }}
      />

      <br />
      <br />

      <button onClick={salvar}>
        {id ? "Atualizar Cliente" : "Salvar Cliente"}
      </button>

      {id && (
        <button
          style={{ marginLeft: 10 }}
          onClick={limparFormulario}
        >
          Cancelar
        </button>
      )}

      <hr />

      <h3>Clientes Cadastrados</h3>

      {clientes.length === 0 ? (
        <p>Nenhum cliente cadastrado.</p>
      ) : (
        clientes.map((cliente) => (
          <div
            key={cliente.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <strong>
              Proposta {cliente.proposta} - {cliente.instituicao}
            </strong>

            <br />

            Responsável: {cliente.responsavel}

            <br />

            Telefone: {cliente.telefone}

            <br />

            Valor da Parcela: R$ {cliente.valor_parcela}

            <br />

            Parcela: {cliente.parcela_atual}

            <br />

            Vigência: {cliente.inicio_vigencia} até {cliente.fim_vigencia}

            <br />
            <br />

            <button onClick={() => editar(cliente)}>
              ✏️ Editar
            </button>

            <button
              style={{ marginLeft: 10 }}
              onClick={() => excluir(cliente.id!)}
            >
              🗑️ Excluir
            </button>
          </div>
        ))
      )}
    </div>
  );
}  