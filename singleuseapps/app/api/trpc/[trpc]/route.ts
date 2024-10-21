import { appRouter } from "@/app/api/trpc/routes/appRouter";
import { TRPC_ROUTE_PATH } from "@/lib/constants";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: TRPC_ROUTE_PATH,
    req,
    router: appRouter,
    createContext: () => ({}),
    // onError(opts) {
    //   const { error, type, path, input, ctx, req } = opts;
    //   console.error("Error:", error);
    //   if (error.code === "INTERNAL_SERVER_ERROR") {
    //     // send to bug reporting
    //   }
    // },
  });

export { handler as GET, handler as POST };
