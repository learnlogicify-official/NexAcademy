export async function uploadToCloudinary(base64: string): Promise<string> {
  const data = new FormData();
  data.append("file", base64);
  data.append("upload_preset", "nexacademy"); // Unsigned upload preset

  const res = await fetch("https://api.cloudinary.com/v1_1/dm05srb3x/image/upload", {
    method: "POST",
    body: data,
  });
  const json = await res.json();
  if (!json.secure_url) throw new Error(json.error?.message || "Cloudinary upload failed");
  return json.secure_url;
} 