import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB limit

    const [fields, files] = await form.parse(req);
    const conversationId = fields.conversationId?.[0];
    const visitorId = fields.visitorId?.[0];

    if (!conversationId || !visitorId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const uploadedFile = files.file?.[0];
    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check if uploads are enabled
    const { data: settings } = await supabase
      .from("widget_settings")
      .select("allow_file_uploads")
      .single();

    if (!settings?.allow_file_uploads) {
      return res.status(403).json({ error: "File uploads are disabled" });
    }

    // Read file and upload to Supabase Storage
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const fileName = `${Date.now()}_${uploadedFile.originalFilename}`;
    const filePath = `uploads/${conversationId}/${fileName}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("chat-files")
      .upload(filePath, fileBuffer, {
        contentType: uploadedFile.mimetype || "application/octet-stream",
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("chat-files")
      .getPublicUrl(filePath);

    // Save file metadata
    const { data: fileRecord, error: dbError } = await supabase
      .from("uploaded_files")
      .insert({
        conversation_id: conversationId,
        visitor_id: visitorId,
        file_name: uploadedFile.originalFilename || fileName,
        file_type: uploadedFile.mimetype || "unknown",
        file_size: uploadedFile.size,
        file_url: urlData.publicUrl,
        storage_path: filePath,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      return res.status(500).json({ error: "Failed to save file metadata" });
    }

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath);

    return res.status(200).json({
      success: true,
      file: fileRecord,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}