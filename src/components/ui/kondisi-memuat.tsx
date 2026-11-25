export interface KondisiMemuatProps {
  pesan?: string;
}

export function KondisiMemuat({
  pesan = 'Memuat data halaman...',
}: KondisiMemuatProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
    >
      <div
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--garis-tegas)] border-t-[var(--aksen-maroon-teks)]"
      />
      <p className="mt-3 text-sm text-[var(--teks-redup)]">{pesan}</p>
    </div>
  );
}
