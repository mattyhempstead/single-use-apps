// The frontend trpc client
// Use this if you want to make trpc calls in client components

import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "./routes/appRouter";

// e.g. trpc.getUser.useQuery()
export const trpc = createTRPCReact<AppRouter>({});

// e.g. trpc.getUser.query()
// export const trpcClient = createTRPCProxyClient<AppRouter>({
//   links: [
//     httpLink({
//       url: `${getBaseUrl()}/api/trpc`,
//     }),
//   ],
// });
