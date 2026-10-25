export default function Loading() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* High-speed Vercel / Linear glowing top edge bar */}
      <div className="linear-top-loader" />
    </div>
  );
}
