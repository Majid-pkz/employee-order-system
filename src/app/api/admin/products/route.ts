import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const marketPrice = parseFloat(formData.get("marketPrice") as string);
    const discountedPrice = parseFloat(formData.get("discountedPrice") as string);
    const isActive = formData.get("isActive") === "true";
    const imageFile = formData.get("image") as File | null;

    if (!name || isNaN(marketPrice) || isNaN(discountedPrice)) {
      return NextResponse.json(
        { error: "Name, market price and discounted price are required" },
        { status: 400 }
      );
    }

    let imagePath: string | null = null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const filename = `${Date.now()}-${imageFile.name.replaceAll(" ", "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

      // Make sure the folder exists
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      imagePath = `/uploads/products/${filename}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        marketPrice,
        discountedPrice,
        imagePath,
        isActive,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}