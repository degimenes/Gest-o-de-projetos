import { BaseFinancials, CalculatedFinancials } from '@/types'

export function calculateFinancials(
  data: BaseFinancials,
  settings?: { issRate: number; csllRate: number; irpjRate: number },
): CalculatedFinancials {
  const {
    receitaProduto,
    receitaServico,
    custoMateriais,
    custoServicos,
    custoMaoDeObra,
    despesasAdm,
    issPercent,
  } = data

  const issRate = issPercent ?? settings?.issRate ?? 5
  const csllRate = settings?.csllRate ?? 9
  const irpjRate = settings?.irpjRate ?? 15

  const vBruto = receitaProduto + receitaServico
  const pis = vBruto * 0.0165
  const cofins = vBruto * 0.076
  const iss = receitaServico * (issRate / 100)

  const deducoes = pis + cofins + iss
  const rLiquida = vBruto - deducoes

  const cVendasTotal = custoMateriais + custoServicos + custoMaoDeObra
  const mBruta = rLiquida - cVendasTotal
  const margemBrutaPercent = vBruto > 0 ? (mBruta / vBruto) * 100 : 0

  const lucroAntesImpostos = mBruta - despesasAdm
  const csll = lucroAntesImpostos > 0 ? lucroAntesImpostos * (csllRate / 100) : 0
  const irpj = lucroAntesImpostos > 0 ? lucroAntesImpostos * (irpjRate / 100) : 0

  const mLiquida = lucroAntesImpostos - csll - irpj
  const margemLiquidaPercent = vBruto > 0 ? (mLiquida / vBruto) * 100 : 0

  return {
    vBruto,
    pis,
    cofins,
    iss,
    deducoes,
    rLiquida,
    mBruta,
    margemBrutaPercent: Number(margemBrutaPercent.toFixed(2)),
    cVendasTotal,
    lucroAntesImpostos,
    csll,
    irpj,
    mLiquida,
    margemLiquidaPercent: Number(margemLiquidaPercent.toFixed(2)),
  }
}
