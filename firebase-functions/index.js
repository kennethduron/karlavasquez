import { beforeUserCreated } from "firebase-functions/v2/identity";
import { HttpsError } from "firebase-functions/v2/https";

// Admin SDK provisioning bypasses this client-facing Identity Platform hook.
// Any direct SDK/REST attempt to self-register is rejected before persistence.
export const blockPublicUserCreation = beforeUserCreated(() => {
  throw new HttpsError(
    "permission-denied",
    "Account creation is restricted to administrators.",
  );
});
