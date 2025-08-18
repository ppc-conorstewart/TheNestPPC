// src/components/InteractiveMap.jsx

import React, { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
})

const convertLSDtoCoordinates = (lsdString) => {
  if (lsdString === '1-6-53-11-5') {
    return [53.542892, -115.601680]
  }
  return null
}

const generateRange = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start)

export default function InteractiveMap() {
  const [pins, setPins] = useState([])
  const [lsd, setLSD] = useState('')
  const [section, setSection] = useState('')
  const [township, setTownship] = useState('')
  const [range, setRange] = useState('')
  const [meridian, setMeridian] = useState('')

  const handleSearch = () => {
    const combinedLSD = `${lsd}-${section}-${township}-${range}-${meridian}`
    const coords = convertLSDtoCoordinates(combinedLSD)
    if (coords) {
      setPins([...pins, { lsd: combinedLSD, position: coords }])
      setLSD('')
      setSection('')
      setTownship('')
      setRange('')
      setMeridian('')
    } else {
      alert('Invalid or unknown LSD. Could not convert.')
    }
  }

  return (
    <div className="flex flex-col h-[80vh] w-full">
      <div className="bg-black py-2 flex flex-col items-center space-y-2 relative">
        <img
          src="/assets/whitelogo.png"
          alt="Paloma Logo"
          className="absolute left-4 top-1 h-10"
        />
        <div className="text-white text-lg font-bold">PALOMA JOB MAP AND LSD FINDER</div>
        <div className="flex space-x-2 items-center mt-2">
          <label className="text-white font-bold">LSD</label>
          <select
            value={lsd}
            onChange={(e) => setLSD(e.target.value)}
            className="bg-[#6a7257] text-white px-2 py-1 rounded w-12 text-center"
          >
            <option value="">-</option>
            {generateRange(1, 16).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label className="text-white font-bold">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="bg-[#6a7257] text-white px-2 py-1 rounded w-12 text-center"
          >
            <option value="">-</option>
            {generateRange(1, 36).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label className="text-white font-bold">Township</label>
          <select
            value={township}
            onChange={(e) => setTownship(e.target.value)}
            className="bg-[#6a7257] text-white px-2 py-1 rounded w-16 text-center"
          >
            <option value="">-</option>
            {generateRange(1, 126).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label className="text-white font-bold">Range</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-[#6a7257] text-white px-2 py-1 rounded w-12 text-center"
          >
            <option value="">-</option>
            {generateRange(1, 30).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <label className="text-white font-bold">Meridian</label>
          <select
            value={meridian}
            onChange={(e) => setMeridian(e.target.value)}
            className="bg-[#6a7257] text-white px-2 py-1 rounded w-12 text-center"
          >
            <option value="">-</option>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <button
            onClick={handleSearch}
            className="bg-[#6a7257] px-3 py-1 rounded text-white"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={[53.5, -115.5]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pins.map((pin, idx) => (
            <Marker
              key={idx}
              position={pin.position}
              icon={customIcon}
            >
              <Popup>
                LSD: {pin.lsd}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
