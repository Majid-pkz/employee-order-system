import { AdminMutationButton } from "./AdminMutationButton";
export function RemoveCycleProductButton({ cycleProductId }: { cycleProductId: string }) { return <AdminMutationButton url={"/api/admin/cycle-products/" + cycleProductId} label="Remove" loadingLabel="Removing…" confirmMessage="Remove this product from the cycle and all affected orders? Their totals will be recalculated." danger />; }
