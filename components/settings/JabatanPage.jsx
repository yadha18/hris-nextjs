import PageHeader from "@/components/ui/PageHeader";
import NamedListManager from "./NamedListManager";

export default function JabatanPage() {
  return (
    <>
      <PageHeader
        title="Daftar Jabatan"
        description="Kelola daftar jabatan dan Sub Bidang karyawan untuk dropdown pilihan."
      />
      <NamedListManager listKey="jabatan" />
      <NamedListManager listKey="subBidang" />
    </>
  );
}
