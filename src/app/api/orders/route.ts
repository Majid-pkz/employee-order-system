import { NextResponse } from "next/server";
import { requireEmployee } from "@/lib/access";
import { assertSameOrigin, apiError } from "@/lib/api";
import { createOrderSchema } from "@/lib/validation";
import { createEmployeeOrder, orderResult } from "@/lib/orders";
export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const employee = await requireEmployee();
    const { cycleId, items } = createOrderSchema.parse(await req.json());
    return NextResponse.json(orderResult(await createEmployeeOrder(employee, cycleId, items)), { status: 201 });
  } catch (error) { return apiError(error); }
}
