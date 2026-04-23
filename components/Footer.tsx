export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/60 py-8 text-center text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4">
        <p className="text-lg font-semibold text-foreground">نظام توصيات ذكي مبني على الخوارزميات الجينية</p>
        <p className="text-lg font-semibold text-foreground">HUSSAM_152889 | SARA_150348 | JALAA_187519 </p>
        <p className="mt-4 text-xs opacity-70">&copy; {new Date().getFullYear()} مشروع توصيات المنتجات.</p>
      </div>
    </footer>
  );
}
