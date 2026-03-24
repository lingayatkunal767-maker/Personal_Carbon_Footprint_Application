import { useState } from "react";
import { Target, CheckCircle, Globe, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateGoal() {
  const [category, setCategory] = useState("Transport");
  const [timeframe, setTimeframe] = useState("Next 30 Days");
  const [recurrence, setRecurrence] = useState("weekly");
  const [reductionTarget, setReductionTarget] = useState(0);
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
const handleCreateGoal = () => {

  if (!title) {
    alert("Goal title is required");
    return;
  }

  const goalData = {
    id: Date.now(),
    title,
    category,
    timeframe,
    recurrence,
    reductionTarget,
    description,
    createdDate: new Date().toISOString(),
    current: 0,
    target: reductionTarget,
    activities: []
  };

  localStorage.setItem("goalData", JSON.stringify(goalData));

  navigate(`/goal-details/${goalData.id}`);
};
//   const handleCreateGoal = () => {

//   if(!title){
//     alert("Goal title is required");
//     return;
//   }

//   if(reductionTarget === 0){
//     alert("Please select reduction target");
//     return;
//   }

//   const goalData = {
//     title,
//     category,
//     timeframe,
//     recurrence,
//     reductionTarget,
//     description,
//     createdDate: new Date().toISOString()
//   };

//   localStorage.setItem("goalData", JSON.stringify(goalData));

//   navigate("/goal-details");
// };

  const categories = [
    { name: "Transport", emoji: "🚗" },
    { name: "Food & Diet", emoji: "🍽" },
    { name: "Home Energy", emoji: "⚡" },
    { name: "Waste", emoji: "🗑" },
    { name: "Global", emoji: "🌍" }
  ];
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto px-6 py-8">

        

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT SIDE (MAIN CARD) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow">

            {/* CARD HEADER */}
            <div className="border-b px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Set a New Sustainability Goal
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Define a clear target to reduce your carbon footprint.
              </p>
            </div>

            <div className="p-8 space-y-8">

              {/* GOAL TITLE */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  GOAL TITLE
                </p>

                <input
  value={title}
  onChange={(e)=>setTitle(e.target.value)}
  className="w-full border rounded-lg px-4 py-2"
  placeholder="e.g., Bike to work 3 times a week"
  required
/>
              </div>
              <div className="grid grid-cols-5 gap-3">
      {categories.map((item) => (
        <button
          key={item.name}
          onClick={() => setCategory(item.name)}
          className={`border rounded-xl p-3 text-center
          ${category === item.name
            ? "bg-green-50 border-green-500 text-green-700"
            : "hover:bg-gray-50"}
          `}
        >
          <div className="text-xl">{item.emoji}</div>
          <div>{item.name}</div>
        </button>
      ))}
    </div>

              {/* REDUCTION + TIMEFRAME ROW */}
              <div className="grid md:grid-cols-2 gap-6">

                <div>
  <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
    <span>REDUCTION TARGET</span>
    <span className="text-green-600">{reductionTarget}%</span>
  </div>

  <input
    type="range"
    min="0"
    max="100"
    value={reductionTarget}
    onChange={(e) => setReductionTarget(e.target.value)}
    className="w-full"
  />

  <p className="text-xs text-gray-400 mt-1">
    Aiming for a {reductionTarget}% decrease from your baseline
  </p>
</div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    TIMEFRAME
                  </p>

                  <select
  value={timeframe}
  onChange={(e)=>setTimeframe(e.target.value)}
  className="w-full border rounded-lg px-3 py-2"
>
  <option>Next 7 Days</option>
  <option>Next 30 Days</option>
  <option>Next 3 Months</option>
  <option>Next Year</option>
</select>
                </div>

              </div>

              {/* RECURRENCE*/}
              <div className="flex gap-3">

{["daily","weekly","monthly","one time"].map((item)=>(
  <button
    key={item}
    onClick={() => setRecurrence(item)}
    className={`px-4 py-2 rounded-full border capitalize
    ${recurrence === item
      ? "bg-green-500 text-white border-green-500"
      : "hover:bg-gray-100"}
    `}
  >
    {item}
  </button>
))}

</div>

              {/* DESCRIPTION */}
              <div>

                <p className="text-xs font-semibold text-gray-500 mb-2">
                  OPTIONAL DESCRIPTION / ACTION PLAN
                </p>

                <textarea
  rows="4"
  value={description}
  onChange={(e)=>setDescription(e.target.value)}
  className="w-full border rounded-lg px-4 py-2"
  placeholder="Detail the specific actions you'll take..."
/>

              </div>

            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="border-t px-8 py-4 flex items-center justify-between">

              <p className="text-sm text-gray-500">
                Estimated impact: <span className="font-semibold">~12.4 kg CO2</span>
              </p>

              <div className="flex gap-3">

                <button className="px-5 py-2 border rounded-lg">
                  Cancel
                </button>

                <button
  onClick={handleCreateGoal}
  className="px-5 py-2 bg-green-600 text-white rounded-lg"
>
  Create Goal
</button>

              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow p-5 space-y-4">

  <h3 className="font-semibold flex items-center gap-2">
    <Target className="text-green-500 w-5 h-5" />
    Goal Tips
  </h3>

  <div className="flex gap-3">
    <CheckCircle className="text-green-500 w-5 h-5 mt-1"/>
    <div>
      <p className="font-medium text-gray-700">Make it SMART</p>
      <p className="text-sm text-gray-500">
        Ensure your goal is Specific, Measurable,
        Achievable, Relevant and Time-bound.
      </p>
    </div>
  </div>

  <div className="flex gap-3">
    <Globe className="text-green-500 w-5 h-5 mt-1"/>
    <div>
      <p className="font-medium text-gray-700">Global Impact</p>
      <p className="text-sm text-gray-500">
        Reducing transport emissions by 20% is like
        saving 45 liters of gasoline every month.
      </p>
    </div>
  </div>

</div>
            {/* CARBON INSIGHT */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
  <h3 className="text-green-700 font-semibold mb-2">
    Carbon Insight
  </h3>
  <p className="text-green-700 text-sm">
    Did you know? Switching to a vegetarian diet
    for just one day a week can reduce your food
    carbon footprint by over 100kg of CO2 per year.
  </p>
  <span className="inline-block mt-3 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
    Eco-Tip #42
  </span>
</div>
            {/* READY CARD */}
            <div className="border border-dashed rounded-xl p-6 text-center">

  <Calendar className="mx-auto text-gray-400 mb-2" size={28} />

  <p className="font-medium text-gray-600">
    Ready to start?
  </p>

  <p className="text-sm text-gray-400">
    Your tracking begins as soon as you hit create.
  </p>
</div>
          </div>

        </div>

      </div>

    </div>
  );
}