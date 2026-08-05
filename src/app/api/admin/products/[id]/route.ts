import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

    // Get the current product so we know the old image path
    const currentProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const data: {
      name: string;
      description: string | null;
      marketPrice: number;
      discountedPrice: number;
      isActive: boolean;
      imagePath?: string;
    } = {
      name,
      description: description || null,
      marketPrice,
      discountedPrice,
      isActive,
    };

    // If a new image was uploaded
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${imageFile.name.replaceAll(" ", "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      data.imagePath = `/uploads/products/${filename}`;

      // Delete the old image if it exists
      if (currentProduct.imagePath) {
        try {
          const oldImagePath = path.join(
            process.cwd(),
            "public",
            currentProduct.imagePath
          );
          await unlink(oldImagePath);
        } catch (err) {
          console.error("Failed to delete old image:", err);
        }
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Optional: also delete the image file when deleting the product
    const product = await prisma.product.findUnique({ where: { id } });

    if (product?.imagePath) {
      try {
        const imagePath = path.join(process.cwd(), "public", product.imagePath);
        await unlink(imagePath);
      } catch (err) {
        console.error("Failed to delete image:", err);
      }
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}