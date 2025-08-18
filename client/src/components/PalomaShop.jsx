import React, { useEffect, useState } from 'react';

export default function PalomaShop({ user, onClose }) {
  const [userPoints, setUserPoints] = useState(0);
  const [globalPoints, setGlobalPoints] = useState([]);

  const items = [
    { id: 1, name: 'Paloma Sticker Pack', cost: 20, description: 'Exclusive Paloma-themed digital stickers.' },
    { id: 2, name: 'Leaderboard Title Flair', cost: 50, description: 'Adds a flair next to your name on the leaderboard.' },
    { id: 3, name: 'Training Booster', cost: 30, description: 'Doubles your points earned in the next quiz.' },
  ];

  useEffect(() => {
    const allPoints = JSON.parse(localStorage.getItem('paloma_global_points')) || {};
    const currentPoints = allPoints[user?.id] || 0;
    setUserPoints(currentPoints);

    const sorted = Object.entries(allPoints)
      .map(([id, points]) => ({ id, points }))
      .sort((a, b) => b.points - a.points);
    setGlobalPoints(sorted);
  }, [user]);

  const handlePurchase = (item) => {
    if (!user || userPoints < item.cost) return;

    const updatedPoints = userPoints - item.cost;
    const allPoints = JSON.parse(localStorage.getItem('paloma_global_points')) || {};
    allPoints[user.id] = updatedPoints;

    localStorage.setItem('paloma_global_points', JSON.stringify(allPoints));
    setUserPoints(updatedPoints);
    alert(`✅ You bought: ${item.name}`);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-black p-8 rounded-lg max-w-2xl w-full border border-gray-400 text-white relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 text-xl"
        >
          ✕
        </button>
        <h2 className="text-3xl font-bold mb-2">Paloma Shop 🛍️</h2>
        <p className="text-green-300 mb-4">You have <span className="font-semibold">{userPoints}</span> Paloma Points🪙</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {items.map(item => (
            <div key={item.id} className="bg-[#2c2c2c] p-4 rounded-lg shadow-md border border-gray-600">
              <h3 className="text-xl font-semibold mb-1">{item.name}</h3>
              <p className="text-sm text-gray-300 mb-3">{item.description}</p>
              <p className="text-yellow-300 font-bold mb-2">{item.cost} Paloma Points🪙</p>
              <button
                onClick={() => handlePurchase(item)}
                className={`px-4 py-2 rounded ${
                  userPoints >= item.cost
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={userPoints < item.cost}
              >
                {userPoints >= item.cost ? 'Buy' : 'Not Enough Points'}
              </button>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold mb-2 border-t border-gray-500 pt-4">Global Paloma Points Leaderboard</h3>
        <ul className="space-y-1 text-sm max-h-[150px] overflow-y-auto pr-2">
          {globalPoints.map((entry, idx) => (
            <li key={entry.id} className="flex justify-between">
              <span className="text-gray-300">#{idx + 1} - {entry.id}</span>
              <span className="text-yellow-400">{entry.points}🪙</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
