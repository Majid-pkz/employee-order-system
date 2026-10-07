import { AdminMutationButton } from "./AdminMutationButton";
export function AdminOrderActions({ orderId, itemId }: { orderId: string; itemId: string; cycleStatus?: string }) { return <AdminMutationButton url={"/api/admin/orders/" + orderId + "/items/" + itemId} label="Remove item" loadingLabel="Removing…" confirmMessage="Remove this item and recalculate the order total?" danger />; }
