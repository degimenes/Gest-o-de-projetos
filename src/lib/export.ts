export function exportToExcel(filename: string, tabs: { name: string; data: any[][] }[]) {
  let xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Num">
      <NumberFormat ss:Format="#,##0.00"/>
    </Style>
  </Styles>`

  tabs.forEach((tab) => {
    xml += `\n  <Worksheet ss:Name="${tab.name}">\n    <Table>`
    tab.data.forEach((row) => {
      xml += `\n      <Row>`
      row.forEach((cell) => {
        const isNum = typeof cell === 'number'
        const type = isNum ? 'Number' : 'String'
        const style = isNum ? ` ss:StyleID="Num"` : ''
        const val =
          cell === null || cell === undefined
            ? ''
            : cell.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        xml += `\n        <Cell${style}><Data ss:Type="${type}">${val}</Data></Cell>`
      })
      xml += `\n      </Row>`
    })
    xml += `\n    </Table>\n  </Worksheet>`
  })

  xml += `\n</Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
