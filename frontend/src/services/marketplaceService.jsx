import { apiFetch } from "../utils/api";

export const getMarketplaceItems = async () => {
  try {
    const data = await apiFetch('/api/marketplace');
    if (!data || data.length === 0) return DUMMY_MARKETPLACE;
    return data;
  } catch (error) {
    console.warn("Using dummy marketplace data due to error:", error);
    return DUMMY_MARKETPLACE;
  }
};

export const getMarketplaceItem = async (id) => {
  try {
    return await apiFetch(`/api/marketplace/${id}`);
  } catch (error) {
    console.warn(`Using dummy data for item ${id}`);
    return DUMMY_MARKETPLACE.find(item => item.id === parseInt(id)) || DUMMY_MARKETPLACE[0];
  }
};

const DUMMY_MARKETPLACE = [
  {
    id: 1,
    itemName: "Tree Planting Initiative",
    description: "Support reforestation projects in the Amazon rainforest. Each tree planted offsets approximately 20kg of CO2 per year.",
    carbonOffset: 20,
    price: 500,
    category: "Nature",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: 2,
    itemName: "Solar Panel Subsidy",
    description: "Contribute to a community solar farm. Your investment helps replace fossil fuel energy with clean, renewable solar power.",
    carbonOffset: 50,
    price: 1500,
    category: "Energy",
    imageUrl: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=300&auto=format&fit=crop"
  },
  {
    id: 3,
    itemName: "Ocean Plastic Cleanup",
    description: "Remove 5kg of plastic waste from the ocean. Preventing plastic pollution protects marine ecosystems and helps maintain carbon balance.",
    carbonOffset: 10,
    price: 300,
    category: "Waste",
    imageUrl: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=300&auto=format&fit=crop"
  }
];
