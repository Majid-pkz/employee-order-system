import { AdminMutationButton } from "./AdminMutationButton";
export function DeleteProductButton({ productId }: { productId: string }) { return <AdminMutationButton url={"/api/admin/products/" + productId} label="Delete" loadingLabel="Deleting…" confirmMessage="Delete this product? Products used in sales cycles should be made inactive instead." danger />; }
