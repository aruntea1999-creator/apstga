export default function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4 animate-pulse space-y-3">
      <div className="h-8 bg-gray-100 rounded" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="flex-1 h-6 bg-gray-100 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}
