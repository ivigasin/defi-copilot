import { PositionList } from "@/components/position-list";

export default function PositionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Protocol Positions</h1>
      <PositionList />
    </div>
  );
}
