export { setupAuth, isAuthenticated, getSession } from "./replitAuth";
export { authStorage, type IAuthStorage } from "./storage";
export async function registerAuthRoutes(app: any) {
  const { registerAuthRoutes: originalRegisterAuthRoutes } = await import("./routes");
  originalRegisterAuthRoutes(app);
}
