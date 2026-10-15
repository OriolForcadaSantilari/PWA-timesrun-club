import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { assertPublicName } from "./lib/names";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      reset: ResendOTPPasswordReset,
      profile(params) {
        if (typeof params.name !== "string") {
          throw new Error("Name must be 2 to 30 characters.");
        }
        return {
          email: params.email as string,
          name: assertPublicName(params.name),
        };
      },
    }),
  ],
});
