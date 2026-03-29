import { apiFetch } from "../utils/api";

export const purchaseItem = async (itemId) => {
  return await apiFetch("/api/transactions/purchase", {
    method: "POST",
    body: JSON.stringify({ itemId }),
  });
};
