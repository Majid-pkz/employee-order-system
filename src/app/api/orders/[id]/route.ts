import { NextResponse } from "next/server";
import { requireEmployee } from "@/lib/access";
import { assertSameOrigin, apiError } from "@/lib/api";
import { updateOrderSchema } from "@/lib/validation";
import { updateEmployeeOrder, orderResult } from "@/lib/orders";
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const employee = await requireEmployee();
    const { id } = await params;
    const { items } = updateOrderSchema.parse(await req.json());
    return NextResponse.json(orderResult(await updateEmployeeOrder(employee, id, items)));
  } catch (error) { return apiError(error); }
}
