import { put } from "@vercel/blob";

export const POST = async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const fileName = formData.get("fileName") as string;

  if (!file) {
    return new Response(JSON.stringify({ error: "No file uploaded" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 上传文件到 Vercel Blob
    const blob = await put(fileName, file.stream(), {
      access: "public", // 公开访问
      contentType: file.type,
      allowOverwrite: true, // 允许覆盖同名文件
    });

    return new Response(
      JSON.stringify({
        message: "Upload successful",
        blob,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Upload failed",
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
