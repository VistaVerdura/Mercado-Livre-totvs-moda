
import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongobd";

export async function GET() {
  try {
    const db = await connectDB();

    await db.command({ ping: 1 });

    return NextResponse.json({
      success: true,
      message: "MongoDB conectado com sucesso!",
      database: db.databaseName,
    });

  } catch (error) {
    console.error("Erro MongoDB:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Falha ao conectar ao MongoDB.",
      },
      { status: 500 }
    );
  }
}
