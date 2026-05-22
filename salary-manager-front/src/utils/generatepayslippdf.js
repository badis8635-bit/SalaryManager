import { jsPDF } from 'jspdf' // 1. Changed to a named import
import autoTable from 'jspdf-autotable'; // 2. Changed to a direct function import

export function generatePayslipPDF(payslip, worker) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210
  const margin = 20

  const BLACK  = [15,  15,  15]
  const DARK   = [30,  30,  30]
  const MID    = [90,  90,  90]
  const LIGHT  = [200, 200, 200]
  const ACCENT = [180, 210, 40]

  // ── Header band ──────────────────────────────────────────────────────────
  doc.setFillColor(...BLACK)
  doc.rect(0, 0, W, 38, 'F')
  doc.setFillColor(...ACCENT)
  doc.rect(0, 36, W, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('SALARY MANAGER', margin, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...LIGHT)
  doc.text('Bulletin de rémunération', margin, 23)

  const periode = `${String(payslip.period_month).padStart(2,'0')} / ${payslip.period_year}`
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...ACCENT)
  doc.text(periode, W - margin, 16, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...LIGHT)
  doc.text('PÉRIODE', W - margin, 22, { align: 'right' })

  // ── Section employé ───────────────────────────────────────────────────────
  let y = 50
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MID)
  doc.text('EMPLOYÉ', margin, y)

  y += 5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...DARK)
  doc.text(`${worker.first_name} ${worker.last_name}`.toUpperCase(), margin, y)

  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MID)
  doc.text(worker.email, margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MID)
  doc.text('TYPE DE CONTRAT', W - margin, 50, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.text(worker.worker_type.toUpperCase(), W - margin, 56, { align: 'right' })

  y += 10
  doc.setDrawColor(...LIGHT)
  doc.setLineWidth(0.3)
  doc.line(margin, y, W - margin, y)

  // ── Tableau rémunération ──────────────────────────────────────────────────
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...MID)
  doc.text('DÉTAIL DE LA RÉMUNÉRATION', margin, y)
  y += 4

  const rows = [
    ['Salaire brut de base', '', `${Number(payslip.gross_salary).toFixed(2)} €`],
  ]
  if (parseFloat(payslip.bonus) > 0) {
    rows.push(['Prime / Bonus', '', `+ ${Number(payslip.bonus).toFixed(2)} €`])
  }
  rows.push(
    ['', '', ''],
    ['ONSS employé (retenue salariale)', '13.07 %', `- ${Number(payslip.onss_employee).toFixed(2)} €`],
    ['Précompte professionnel',          '26.75 %', `- ${Number(payslip.precompte).toFixed(2)} €`],
  )

  // 3. Changed from doc.autoTable to direct function execution
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Libellé', 'Taux', 'Montant']],
    body: rows,
    styles: { font: 'helvetica', fontSize: 9, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 } },
    headStyles: { fillColor: BLACK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center', textColor: MID },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    tableLineColor: LIGHT,
    tableLineWidth: 0.1,
  })

  // ── NET À PAYER ───────────────────────────────────────────────────────────
  // 4. doc.lastAutoTable still tracks the metadata properly
  const tableBottom = doc.lastAutoTable.finalY + 6
  doc.setFillColor(...BLACK)
  doc.roundedRect(margin, tableBottom, W - margin * 2, 22, 2, 2, 'F')
  doc.setFillColor(...ACCENT)
  doc.roundedRect(margin, tableBottom, 4, 22, 2, 2, 'F')
  doc.rect(margin + 2, tableBottom, 2, 22, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...LIGHT)
  doc.text('NET À PAYER', margin + 10, tableBottom + 8)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text(`${Number(payslip.net_salary).toFixed(2)} €`, margin + 10, tableBottom + 17)

  const statusLabel = payslip.status.toUpperCase()
  const statusColor = statusLabel === 'PAID' ? [71, 200, 120] : statusLabel === 'CANCELLED' ? [200, 71, 71] : ACCENT
  doc.setFillColor(...statusColor)
  doc.roundedRect(W - margin - 34, tableBottom + 5, 34, 12, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...BLACK)
  doc.text(statusLabel, W - margin - 17, tableBottom + 13, { align: 'center' })

  // ── Coût employeur ────────────────────────────────────────────────────────
  const costY = tableBottom + 30
  doc.setDrawColor(...LIGHT)
  doc.setLineWidth(0.3)
  doc.line(margin, costY, W - margin, costY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...MID)
  doc.text('COÛT TOTAL EMPLOYEUR', margin, costY + 6)

  const onssEmp  = Number(payslip.onss_employer).toFixed(2)
  const totalCost = (Number(payslip.gross_salary) + Number(payslip.bonus || 0) + Number(payslip.onss_employer)).toFixed(2)

  // 5. Changed second call to direct function execution as well
  autoTable(doc, {
    startY: costY + 9,
    margin: { left: margin, right: margin },
    body: [
      ['Salaire brut',   `${Number(payslip.gross_salary).toFixed(2)} €`],
      ['ONSS employeur', `+ ${onssEmp} €`],
      ['Coût total',     `${totalCost} €`],
    ],
    styles: { font: 'helvetica', fontSize: 9, textColor: DARK, cellPadding: { top: 2, bottom: 2, left: 4, right: 4 } },
    columnStyles: {
      0: { cellWidth: 'auto', textColor: MID },
      1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    tableLineColor: LIGHT,
    tableLineWidth: 0.1,
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = 282
  doc.setFillColor(...BLACK)
  doc.rect(0, footerY, W, 15, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MID)
  doc.text('Document généré automatiquement par SalaryManager', margin, footerY + 6)
  if (payslip.paid_at) doc.text(`Payé le ${payslip.paid_at}`, W - margin, footerY + 6, { align: 'right' })
  doc.setTextColor(...ACCENT)
  doc.text('CONFIDENTIEL', W / 2, footerY + 10, { align: 'center' })

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `fiche_paie_${worker.last_name.toLowerCase()}_${String(payslip.period_month).padStart(2,'0')}_${payslip.period_year}.pdf`
  doc.save(filename)
}