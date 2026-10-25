export default function DashboardLoading() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      {/* Top linear stream indicator */}
      <div className="linear-top-loader" />
    </div>
  );
}
