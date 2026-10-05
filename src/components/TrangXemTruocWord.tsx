"use client";

import Link from "next/link";
import { Printer, FileDown } from "lucide-react";

// Khung trang mo phong giao dien Word (A4, font chu phuc vu in an) dung
// chung cho cac ban xem truoc (giao an, lich trinh) truoc khi tai file that.
export default function TrangXemTruocWord({
  backHref,
  backLabel,
  exportHref,
  children,
}: {
  backHref: string;
  backLabel: string;
  exportHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={backHref} className="text-sm text-slate-500 hover:underline">
          ← {backLabel}
        </Link>
        <div className="flex items-center gap-3">
          {exportHref && (
            <a
              href={exportHref}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 text-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
            >
              <FileDown className="h-4 w-4" strokeWidth={1.75} />
              Tải file Word
            </a>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 text-white px-3 py-1.5 text-sm font-medium hover:bg-slate-700"
          >
            <Printer className="h-4 w-4" strokeWidth={1.75} />
            In / Lưu PDF
          </button>
        </div>
      </div>

      <div className="trang-word mx-auto max-w-[850px] bg-white border border-slate-200 shadow-sm px-8 py-10 sm:px-[72px] sm:py-16 text-[13px] leading-relaxed text-slate-900">
        {children}
      </div>

      <style>{`
        .trang-word {
          font-family: "Times New Roman", "Liberation Serif", Georgia, serif;
        }
        .trang-word table {
          width: 100%;
          border-collapse: collapse;
        }
        .trang-word th,
        .trang-word td {
          border: 1px solid #94a3b8;
          padding: 6px 8px;
          vertical-align: top;
          text-align: left;
        }
        .trang-word th {
          background: #f1f5f9;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .trang-word {
            box-shadow: none !important;
            border: none !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
