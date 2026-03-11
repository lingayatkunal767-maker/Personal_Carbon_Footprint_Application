export const calculateCarbon = (formData) => {
  const transportFactor = 0.21;
  const foodFactor = 0.5;
  const energyFactor = 0.3;

  const transport = formData.distance * transportFactor;
  const food = formData.meals * foodFactor;
  const energy = formData.electricity * energyFactor;

  const total = transport + food + energy;

  return {
    date: new Date().toLocaleDateString(),
    transport,
    food,
    energy,
    total
  };
};