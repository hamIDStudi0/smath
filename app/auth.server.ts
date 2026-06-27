// app/auth.server.ts
import bcrypt from "bcryptjs";
import { prisma } from "./db.server";

// Verifikasi login — return AdminUser atau null
export async function verifyLogin(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return null;

  const isValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isValid) return null;

  return { id: admin.id, email: admin.email, name: admin.name };
}

// Dipakai sekali saat setup awal lewat script seed
export async function createAdmin(email: string, password: string, name: string) {
  const passwordHash = await bcrypt.hash(password, 12); // cost factor 12
  return prisma.adminUser.create({
    data: { email, passwordHash, name },
  });
}
