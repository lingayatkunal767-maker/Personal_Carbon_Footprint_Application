import { apiFetch } from "../utils/api";

export const purchaseItem = async (userId, marketplaceItemId, amount) => {
  return await apiFetch("/api/transactions", {
    method: "POST",
    body: JSON.stringify({ userId, marketplaceItemId, amount }),
  });
};

export const getUserMarketplaceStats = async (userId) => {
  return await apiFetch(`/api/transactions/user/${userId}/stats`);
};
