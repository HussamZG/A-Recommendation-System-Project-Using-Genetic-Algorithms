export default function CategoryBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex rounded-full border px-3 py-1 text-xs font-bold"
      style={{
        backgroundColor: `${color}1A`,
        color,
        borderColor: `${color}33`,
      }}
    >
      {name}
    </span>
  );
}
