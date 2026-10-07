import { AdminMutationButton } from "./AdminMutationButton";
export function CycleStatusButtons({ cycleId, currentStatus }: { cycleId: string; currentStatus: string }) {
  return <div className="flex gap-4 items-center"><span className="status-pill">{currentStatus}</span><AdminMutationButton url={"/api/admin/cycles/" + cycleId} method="PUT" body={{ status: currentStatus === "open" ? "closed" : "open" }} label={currentStatus === "open" ? "Close cycle" : "Open cycle"} confirmMessage={currentStatus === "open" ? "Close this cycle? Employees will no longer be able to place or edit orders." : undefined} /></div>;
}
