// app/db.server.ts
import "dotenv/config";
import { createRequire } from "module";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/prisma/client/index.js");

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let prisma: any;

declare global {
  var __db__: any;
}

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient({ adapter });
  }
  prisma = global.__db__;
}

export { prisma };