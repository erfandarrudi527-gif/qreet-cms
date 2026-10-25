import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized: Active admin session required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Asserts that the incoming request is executed by an authenticated administrator.
 * Throws UnauthorizedError if session is absent.
 */
export async function assertAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new UnauthorizedError();
  }
  return session;
}
