import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Proposta } from "@/types";
import { formatarMoeda, formatarData, calcularDataValidade } from "@/lib/utils";
import { ordenarBlocos } from "@/lib/blocos";

const estilos = StyleSheet.create({
  pagina: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#18181B",
    lineHeight: 1.5
  },
  cabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
    paddingBottom: 16,
    marginBottom: 24
  },
  nomeEmpresa: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#312E81"
  },
  nomePrestador: {
    fontSize: 10,
    color: "#52525B",
    marginTop: 2
  },
  cabecalhoDireita: {
    alignItems: "flex-end"
  },
  tituloDocumento: {
    fontSize: 10,
    color: "#4F46E5",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1
  },
  dataEmissao: {
    fontSize: 9,
    color: "#71717A",
    marginTop: 2
  },
  blocoCliente: {
    backgroundColor: "#FAFAFA",
    borderRadius: 6,
    padding: 12,
    marginBottom: 20
  },
  rotuloCliente: {
    fontSize: 8,
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2
  },
  nomeCliente: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold"
  },
  tituloProposta: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 14,
    color: "#18181B"
  },
  paragrafo: {
    marginBottom: 10,
    textAlign: "justify"
  },
  secaoBloco: {
    marginBottom: 16
  },
  tituloBloco: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#4338CA",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4
  },
  conteudoBloco: {
    textAlign: "justify"
  },
  saudacaoContainer: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7"
  },
  saudacaoTexto: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#18181B",
    textAlign: "justify"
  },
  fechamentoContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7"
  },
  fechamentoTexto: {
    fontSize: 11,
    lineHeight: 1.6,
    fontFamily: "Helvetica-Oblique",
    color: "#52525B",
    textAlign: "justify"
  },
  tabela: {
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 6,
    overflow: "hidden"
  },
  linhaTabela: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7"
  },
  linhaTabelaUltima: {
    flexDirection: "row"
  },
  celulaRotulo: {
    width: "40%",
    backgroundColor: "#FAFAFA",
    padding: 8,
    fontSize: 9,
    color: "#52525B",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  celulaValor: {
    width: "60%",
    padding: 8,
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold"
  },
  secaoAssinatura: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
    paddingTop: 24
  },
  linhaAssinatura: {
    marginTop: 36,
    borderTopWidth: 1,
    borderTopColor: "#18181B",
    width: 260,
    paddingTop: 6
  },
  rodape: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#A1A1AA",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#E4E4E7",
    paddingTop: 8
  },
  tituloTabelaParcelas: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#4338CA",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6
  },
  tabelaParcelas: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E4E4E7",
    borderRadius: 6,
    overflow: "hidden"
  },
  linhaParcelasCabecalho: {
    flexDirection: "row",
    backgroundColor: "#FAFAFA",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7"
  },
  linhaParcelas: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E4E7"
  },
  linhaParcelasUltima: {
    flexDirection: "row"
  },
  celulaParcelaCabecalho: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#71717A",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    padding: 7
  },
  celulaParcela: {
    fontSize: 9.5,
    padding: 7
  },
  colParcela: { width: "12%" },
  colPercentual: { width: "16%" },
  colValor: { width: "24%", fontFamily: "Helvetica-Bold" },
  colVencimento: { width: "48%" }
});

interface PropostaPdfDocumentProps {
  proposta: Proposta;
  nomeCompleto: string;
  nomeEmpresa: string | null;
}

export function PropostaPdfDocument({ proposta, nomeCompleto, nomeEmpresa }: PropostaPdfDocumentProps) {
  const dataValidade = formatarData(calcularDataValidade(proposta.validade_dias));
  const blocosVisiveis = ordenarBlocos(proposta.blocos || []).filter((bloco) => bloco.visivel);
  const saudacaoBloco = blocosVisiveis.find((bloco) => bloco.tipo === "saudacao");
  const fechamentoBloco = blocosVisiveis.find((bloco) => bloco.tipo === "fechamento");
  const blocosMeio = blocosVisiveis.filter((bloco) => bloco.tipo !== "saudacao" && bloco.tipo !== "fechamento");

  return (
    <Document title={proposta.titulo} author={nomeEmpresa || nomeCompleto}>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.cabecalho}>
          <View>
            <Text style={estilos.nomeEmpresa}>{nomeEmpresa || nomeCompleto}</Text>
            {nomeEmpresa && <Text style={estilos.nomePrestador}>{nomeCompleto}</Text>}
          </View>
          <View style={estilos.cabecalhoDireita}>
            <Text style={estilos.tituloDocumento}>Proposta Comercial</Text>
            <Text style={estilos.dataEmissao}>Emitida em {formatarData(proposta.created_at)}</Text>
            <Text style={estilos.dataEmissao}>Válida até {dataValidade}</Text>
          </View>
        </View>

        <View style={estilos.blocoCliente}>
          <Text style={estilos.rotuloCliente}>Proposta para</Text>
          <Text style={estilos.nomeCliente}>{proposta.cliente_nome}</Text>
          {proposta.cliente_endereco ? <Text style={estilos.nomePrestador}>{proposta.cliente_endereco}</Text> : null}
        </View>

        <Text style={estilos.tituloProposta}>{proposta.titulo}</Text>

        {saudacaoBloco && (
          <View style={estilos.saudacaoContainer}>
            {saudacaoBloco.conteudo
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragrafo, indice) => (
                <Text key={indice} style={[estilos.paragrafo, estilos.saudacaoTexto]}>
                  {paragrafo.trim()}
                </Text>
              ))}
          </View>
        )}

        {blocosMeio.map((bloco) => (
          <View key={bloco.id} style={estilos.secaoBloco}>
            <Text style={estilos.tituloBloco}>{bloco.titulo}</Text>
            {bloco.conteudo
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragrafo, indice) => (
                <Text key={indice} style={[estilos.paragrafo, estilos.conteudoBloco]}>
                  {paragrafo.trim()}
                </Text>
              ))}
          </View>
        ))}

        {fechamentoBloco && (
          <View style={estilos.fechamentoContainer}>
            {fechamentoBloco.conteudo
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((paragrafo, indice) => (
                <Text key={indice} style={[estilos.paragrafo, estilos.fechamentoTexto]}>
                  {paragrafo.trim()}
                </Text>
              ))}
          </View>
        )}

        <View style={estilos.tabela}>
          <View style={estilos.linhaTabela}>
            <Text style={estilos.celulaRotulo}>Investimento</Text>
            <Text style={estilos.celulaValor}>{formatarMoeda(proposta.valor_estimado)}</Text>
          </View>
          <View style={estilos.linhaTabela}>
            <Text style={estilos.celulaRotulo}>Prazo de execução</Text>
            <Text style={estilos.celulaValor}>{proposta.prazo_dias} dia(s)</Text>
          </View>
          <View style={estilos.linhaTabela}>
            <Text style={estilos.celulaRotulo}>Condições de pagamento</Text>
            <Text style={estilos.celulaValor}>
              {proposta.condicoes_pagamento.length === 0
                ? "A combinar"
                : proposta.condicoes_pagamento.length === 1
                  ? "Pagamento único"
                  : `${proposta.condicoes_pagamento.length}x parcelas (ver tabela abaixo)`}
            </Text>
          </View>
          <View style={estilos.linhaTabelaUltima}>
            <Text style={estilos.celulaRotulo}>Validade da proposta</Text>
            <Text style={estilos.celulaValor}>{dataValidade}</Text>
          </View>
        </View>

        {proposta.condicoes_pagamento.length > 0 && (
          <View>
            <Text style={estilos.tituloTabelaParcelas}>Detalhamento das Parcelas</Text>
            <View style={estilos.tabelaParcelas}>
              <View style={estilos.linhaParcelasCabecalho}>
                <Text style={[estilos.celulaParcelaCabecalho, estilos.colParcela]}>Parcela</Text>
                <Text style={[estilos.celulaParcelaCabecalho, estilos.colPercentual]}>Percentual</Text>
                <Text style={[estilos.celulaParcelaCabecalho, estilos.colValor]}>Valor</Text>
                <Text style={[estilos.celulaParcelaCabecalho, estilos.colVencimento]}>Vencimento</Text>
              </View>
              {proposta.condicoes_pagamento.map((parcela, indice) => {
                const ultima = indice === proposta.condicoes_pagamento.length - 1;
                const valor =
                  parcela.valor_calculado ?? ((proposta.valor_estimado || 0) * parcela.percentual) / 100;
                return (
                  <View key={parcela.id || indice} style={ultima ? estilos.linhaParcelasUltima : estilos.linhaParcelas}>
                    <Text style={[estilos.celulaParcela, estilos.colParcela]}>{indice + 1}ª</Text>
                    <Text style={[estilos.celulaParcela, estilos.colPercentual]}>{parcela.percentual}%</Text>
                    <Text style={[estilos.celulaParcela, estilos.colValor]}>{formatarMoeda(valor)}</Text>
                    <Text style={[estilos.celulaParcela, estilos.colVencimento]}>{parcela.descricao}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={estilos.secaoAssinatura}>
          <Text style={estilos.paragrafo}>
            Esta proposta é válida até a data indicada acima. Após esse período, os valores e condições poderão
            ser reajustados mediante nova análise.
          </Text>
          <View style={estilos.linhaAssinatura}>
            <Text>{nomeEmpresa ? `${nomeCompleto} — ${nomeEmpresa}` : nomeCompleto}</Text>
          </View>
        </View>

        <Text style={estilos.rodape}>
          Gerado com Proposta.io — {nomeEmpresa || nomeCompleto}
        </Text>
      </Page>
    </Document>
  );
}
