"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};

type OrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderRow = {
  orderNumber: string;
  employeeName: string;
  employeeId: string | null;
  totalAmount: number;
  isAuthenticated: boolean;
  requiresSignature: boolean;
  status: string;
  items: OrderItem[];
};

type ProductTotal = {
  name: string;
  quantity: number;
  value: number;
};

type ExportButtonsProps = {
  cycleName: string;
  cycleStatus: string;
  orders: OrderRow[];
  productTotals: ProductTotal[];
  grandTotal: number;
};

export function ExportButtons({
  cycleName,
  cycleStatus,
  orders,
  productTotals,
  grandTotal,
}: ExportButtonsProps) {
  const [loading, setLoading] = useState<"summary" | "individual" | null>(null);

  function downloadSummaryPDF() {
    setLoading("summary");

    const doc = new jsPDF() as JsPDFWithAutoTable;

    doc.setFontSize(18);
    doc.text(`Order Summary - ${cycleName}`, 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Status: ${cycleStatus}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);
    doc.text(`Total Orders: ${orders.length}`, 14, 40);
    doc.text(`Grand Total: $${grandTotal.toFixed(2)}`, 14, 46);

    autoTable(doc, {
      startY: 54,
      head: [["Order #", "Employee", "ID", "Total", "Auth", "Status"]],
      body: orders.map((o) => [
        o.orderNumber,
        o.employeeName,
        o.employeeId || "—",
        `$${o.totalAmount.toFixed(2)}`,
        o.isAuthenticated ? "Auth" : "Signature",
        o.status,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const finalY =
      doc.lastAutoTable?.finalY != null
        ? doc.lastAutoTable.finalY + 12
        : 100;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Product Totals", 14, finalY);

    autoTable(doc, {
      startY: finalY + 6,
      head: [["Product", "Total Qty", "Total Value"]],
      body: productTotals.map((p) => [
        p.name,
        p.quantity.toString(),
        `$${p.value.toFixed(2)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`${cycleName.replace(/\s+/g, "-")}-orders-summary.pdf`);
    setLoading(null);
  }

  function downloadIndividualOrdersPDF() {
    setLoading("individual");

    const doc = new jsPDF() as JsPDFWithAutoTable;

    orders.forEach((order, index) => {
      if (index > 0) {
        doc.addPage();
      }

      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(`Order ${order.orderNumber}`, 14, 20);

      doc.setFontSize(11);
      doc.setTextColor(80);
      doc.text(`Cycle: ${cycleName}`, 14, 28);
      doc.text(`Employee: ${order.employeeName}`, 14, 35);
      doc.text(`Employee ID: ${order.employeeId || "—"}`, 14, 42);
      doc.text(
        `Authentication: ${
          order.isAuthenticated ? "Authenticated" : "Needs signature"
        }`,
        14,
        49
      );
      doc.text(`Status: ${order.status}`, 14, 56);

      autoTable(doc, {
        startY: 64,
        head: [["Product", "Qty", "Unit Price", "Line Total"]],
        body: order.items.map((item) => [
          item.productName,
          item.quantity.toString(),
          `$${item.unitPrice.toFixed(2)}`,
          `$${item.lineTotal.toFixed(2)}`,
        ]),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      const finalY =
        doc.lastAutoTable?.finalY != null
          ? doc.lastAutoTable.finalY + 10
          : 120;

      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text(`Total: $${order.totalAmount.toFixed(2)}`, 14, finalY);

      if (!order.isAuthenticated) {
        doc.setFontSize(11);
        doc.setTextColor(80);
        doc.text(
          "Signature: _______________________________",
          14,
          finalY + 16
        );
        doc.text("Date: _______________", 14, finalY + 26);
      }

      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(
        `Page ${index + 1} of ${orders.length}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    });

    doc.save(`${cycleName.replace(/\s+/g, "-")}-individual-orders.pdf`);
    setLoading(null);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={downloadSummaryPDF}
        disabled={!!loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading === "summary" ? "Preparing..." : "Export Summary PDF"}
      </button>

      <button
        onClick={downloadIndividualOrdersPDF}
        disabled={!!loading || orders.length === 0}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading === "individual"
          ? "Preparing..."
          : "Export All Orders (1 per page)"}
      </button>
    </div>
  );
}