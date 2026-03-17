// 

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { Bike, Car, Zap, Leaf, ArrowLeft } from "lucide-react";

export default function GoalDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [goal, setGoal] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {

    fetch(`http://localhost:9599/api/goals/${id}`, {
  credentials: "include"
})
      .then(res => res.json())
      .then(data => setGoal(data));

    fetch(`http://localhost:9599/api/goals/${id}/activities`, {
  credentials: "include"
})
      .then(res => res.json())
      .then(data => setActivities(data));

  }, [id]);


  const progress =
    goal ? Math.min((goal.current / goal.target) * 100, 100) : 0;


  const chartData = [
    { day: "Mon", value: 2 },
    { day: "Tue", value: 4 },
    { day: "Wed", value: 6 },
    { day: "Thu", value: 5 },
    { day: "Fri", value: 9 },
    { day: "Sat", value: 11 },
    { day: "Sun", value: 13 }
  ];
  const handleEditGoal = () => {

  if (!goal) {
    alert("Goal not loaded yet");
    return;
  }

  navigate(`/edit-goal/${goal.goalId}`);

};

const handleCompleteGoal = async () => {

  try {

    const res = await fetch(
      `http://localhost:9599/api/goals/${goal.goalId}/complete`,
      {
        method: "PATCH",
        credentials: "include"
      }
    );

    if (res.ok) {

      const updatedGoal = await res.json();
      setGoal(updatedGoal);

      alert("Goal marked as completed 🎉");

    }

  } catch (err) {
    console.error(err);
  }

};
  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-6">

        {/* LEFT CONTENT */}

        <div className="lg:col-span-2 space-y-6">

          {/* HEADER */}

          <div className="bg-white rounded-xl shadow p-6">

            <div className="flex items-center gap-3 mb-2">

              <ArrowLeft
                className="cursor-pointer"
                onClick={() => navigate(-1)}
              />

              <h1 className="text-2xl font-semibold">
                {goal?.title}
              </h1>

            </div>

            <p className="text-gray-500 text-sm">
              Active Goal • Started {goal?.createdDate}
            </p>


            <div className="flex items-center mt-6 gap-10">

              {/* PROGRESS CIRCLE */}

              <div className="relative w-32 h-32">

                <svg viewBox="0 0 36 36">

                  <path
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />

                  <path
                    d="M18 2.0845
                       a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray={`${progress},100`}
                  />

                </svg>

                <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
                  {Math.round(progress)}%
                </div>

              </div>


              {/* STATS */}

              <div className="grid grid-cols-3 gap-8">

                <div>
                  <p className="text-gray-500 text-sm">Current</p>
                  <p className="text-xl font-semibold">
                    {goal?.current} kg
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Target</p>
                  <p className="text-xl font-semibold">
                    {goal?.target} kg
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">Remaining</p>
                  <p className="text-xl font-semibold">
                    {goal?.target - goal?.current} kg
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* CHART */}

          <div className="bg-white rounded-xl shadow p-6">

            <h2 className="font-semibold mb-4">
              Accumulated Carbon Savings
            </h2>

            <ResponsiveContainer width="100%" height={250}>

              <LineChart data={chartData}>

                <XAxis dataKey="day" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* RIGHT SIDEBAR */}

        <div className="space-y-6">
            {/* ACTION BUTTONS */}

<div className="bg-white rounded-xl shadow p-6 space-y-3">

  <button
    onClick={handleEditGoal}
    className="w-full border px-4 py-2 rounded-lg hover:bg-gray-50"
  >
    Edit Goal
  </button>

  <button
    onClick={handleCompleteGoal}
    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg"
  >
    Mark as Completed
  </button>

</div>

          {/* RECENT ACTIVITY */}

          <div className="bg-white rounded-xl shadow p-6">

            <h3 className="font-semibold mb-4">
              Recent Activity
            </h3>
        

            <div className="space-y-4">

              {activities.map((a, index) => (

                <div
                  key={index}
                  className="flex items-center gap-3"
                >

                  <Bike className="text-green-500" />

                  <div>

                    <p className="text-sm font-medium">
                      {a.activityName}
                    </p>

                    <p className="text-xs text-gray-500">
                      +{a.carbonSaved} kg saved
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* ECO TIP */}

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">

            <div className="flex items-center gap-2 mb-2">

              <Leaf className="text-green-600"/>

              <h3 className="font-semibold text-green-700">
                Eco Tip
              </h3>

            </div>

            <p className="text-sm text-green-700">
              Swapping just two car trips for public transport each week
              could help you hit your goal faster.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}