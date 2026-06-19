import { BaseFinancials, CalculatedFinancials } from '@/types'

export function calculateFinancials(
  base: BaseFinancials,
  taxes: { issRate: number; csllRate: number; irpjRate: number },
): CalculatedFinancials {
  const vBruto = (base.receitaProduto || 0) + (base.receitaServico || 0)

  const pis = vBruto * 0.0065
  const cofins = vBruto * 0.03
  const iss = (base.receitaServico || 0) * ((taxes.issRate || 0) / 100)
  const deducoes = pis + cofins + iss

  const rLiquida = vBruto - deducoes

  const cVendasTotal =
    (base.custoMateriais || 0) + (base.custoServicos || 0) + (base.custoMaoDeObra || 0)

  const mBruta = rLiquida - cVendasTotal
  const margemBrutaPercent = vBruto > 0 ? (mBruta / vBruto) * 100 : 0

  const lucroAntesImpostos = mBruta - (base.despesasAdm || 0)

  const csll = lucroAntesImpostos > 0 ? lucroAntesImpostos * ((taxes.csllRate || 0) / 100) : 0
  const irpj = lucroAntesImpostos > 0 ? lucroAntesImpostos * ((taxes.irpjRate || 0) / 100) : 0

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
    margemBrutaPercent,
    cVendasTotal,
    lucroAntesImpostos,
    csll,
    irpj,
    mLiquida,
    margemLiquidaPercent,
  }
}
