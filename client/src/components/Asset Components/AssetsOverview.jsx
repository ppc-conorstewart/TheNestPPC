// =================== Imports and Dependencies ===================
// src/components/AssetsOverview.jsx
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { API_BASE_URL } from '../../api';

const API_BASE = API_BASE_URL || '';


// =================== AssetsOverview Component ===================
export default function AssetsOverview() {
  // --------- Local State ---------
  const [summary, setSummary] = useState({})
  const [selectedAsset, setSelectedAsset] = useState('All')

  // --------- Fetch Asset Data and Calculate Summary ---------
  useEffect(() => {
    fetch(`${API_BASE}/api/assets`)
      .then((r) => r.json())
      .then((data) => {
        const totals = data.reduce((acc, asset) => {
          const key = asset.name
          if (!acc[key]) acc[key] = { available: 0, new: 0, inUse: 0 }
          const status = (asset.status || '').toLowerCase().trim()
          if (status === 'available') acc[key].available++
          else if (status === 'new')       acc[key].new++
          else if (status === 'in-use' || status === 'in use') acc[key].inUse++
          return acc
        }, {})
        setSummary(totals)
      })
      .catch(console.error)
  }, [])

  // --------- Asset Names and Filter Options ---------
  const assetNames = Object.keys(summary).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true })
  )
  const filterOptions = ['All', ...assetNames]

  // --------- Calculate Totals ---------
  const totalAvailable = assetNames.reduce((sum, name) => sum + summary[name].available, 0)
  const totalNew       = assetNames.reduce((sum, name) => sum + summary[name].new, 0)
  const totalInUse     = assetNames.reduce((sum, name) => sum + summary[name].inUse, 0)

  // --------- Prepare Data for Charts ---------
  const rawData =
    selectedAsset === 'All'
      ? [
          { name: 'Available', value: totalAvailable },
          { name: 'New', value: totalNew },
          { name: 'In-Use', value: totalInUse },
        ]
      : [
          { name: 'Available', value: summary[selectedAsset]?.available || 0 },
          { name: 'New', value: summary[selectedAsset]?.new || 0 },
          { name: 'In-Use', value: summary[selectedAsset]?.inUse || 0 },
        ]

  const total = rawData.reduce((sum, item) => sum + item.value, 0)
  const chartData = rawData.map((item) => ({
    ...item,
    percent: total ? ((item.value / total) * 100).toFixed(1) : 0,
  }))

  const COLORS = ['#22c55e', '#3b82f6', '#ef4444']

  // =================== Render AssetsOverview Component ===================
  return (
    <div className="space-y-6">
      {/* --------- Filter Dropdown --------- */}
      <div className="flex flex-col items-center">
        <label className="text-white text-xl font-bold mb-2">Choose an Asset:</label>
        <select
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
          className="bg-gray-800 text-white px-3 py-1 rounded-md w-48 text-center"
        >
          {filterOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* --------- Combined Chart Card --------- */}
      <div className="flex justify-center">
        <div className="w-[60rem] h-80 bg-black border border-[#6a7257] p-4 rounded-lg flex flex-col">
          <h2 className="text-lg font-semibold text-white text-center mb-2">
            {selectedAsset === 'All'
              ? 'Overall Asset Analytics'
              : `${selectedAsset} Analytics`}
          </h2>
          <div className="flex flex-1">
            {/* Pie Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={70}
                    labelLine={false}
                    label={({ name, value, percent }) => `${value} (${percent}%)`}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, name]} />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6a7257" label={{ position: 'top', fill: '#fff' }}>
                    <LabelList dataKey="value" position="top" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* --------- Asset Cards --------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {assetNames.map((name) => {
          const stats = summary[name]
          return (
            <div
              key={name}
              className="bg-black border border-[#6a7257] p-2 rounded-lg text-white shadow-md flex flex-col items-center text-center text-sm"
            >
              <h3 className="font-semibold mb-1 truncate w-full">{name}</h3>
              <p>Available: <span className="text-green-500 font-bold">{stats.available}</span></p>
              <p>New:      <span className="text-blue-500 font-bold">{stats.new}</span></p>
              <p>In-Use:   <span className="text-red-500 font-bold">{stats.inUse}</span></p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

