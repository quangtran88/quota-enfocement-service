import { z } from "zod";

export const UploadRequestPayloadSchema = z.object({
  uploadId: z.string(),
  owner: z.string(),
  totalSize: z.number(),
});
