import { BaseFinancials, CalculatedFinancials } from '@/types'

export function calculateFinancials(data: BaseFinancials): CalculatedFinancials {
  const vBruto = data.receitaProduto + data.receitaServico

  // Impostos (PIS/COFINS) com abatimento de créditos
  const baseImpostos = data.receitaServico
  const creditosImpostos = data.custoMateriais + data.custoServicos

  // Calculando os valores absolutos dos impostos a serem deduzidos
  const pis = Math.max(0, baseImpostos * 0.0165 - creditosImpostos * 0.0165)
  const cofins = Math.max(0, baseImpostos * 0.076 - creditosImpostos * 0.076)

  const deducoes = pis + cofins
  const rLiquida = vBruto - deducoes

  const cVendasTotal =
    data.custoMateriais + data.custoServicos + data.custoMaoDeObra + data.despesasAdm

  const mLiquida = rLiquida - cVendasTotal
  const margemLiquidaPercent = rLiquida > 0 ? (mLiquida / rLiquida) * 100 : 0

  return {
    vBruto,
    pis,
    cofins,
    deducoes,
    rLiquida,
    cVendasTotal,
    mLiquida,
    margemLiquidaPercent,
  }
}
