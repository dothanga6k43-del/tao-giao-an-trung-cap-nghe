import DangNhapForm from "@/components/DangNhapForm";
import { LayoutGrid } from "lucide-react";

export default async function DangNhapPage(props: PageProps<"/dang-nhap">) {
  const searchParams = await props.searchParams;
  const tiep = typeof searchParams.tiep === "string" ? searchParams.tiep : "";

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <LayoutGrid className="h-8 w-8 text-slate-700" strokeWidth={1.75} />
          <h1 className="text-xl font-semibold">Soạn giáo án TCN</h1>
          <p className="text-sm text-slate-500">Đăng nhập để tiếp tục</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <DangNhapForm tiep={tiep} />
        </div>
      </div>
    </div>
  );
}
