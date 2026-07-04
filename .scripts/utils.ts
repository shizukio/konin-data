import { createHash } from "node:crypto";

export function sha256hashSync(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}