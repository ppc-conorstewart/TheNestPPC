// src/pages/JobMap.jsx

import React, { useState, useEffect, useRef } from 'react'
import { API_BASE_URL } from '../api'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Sidebar from '../components/Sidebar'
import { convertDLS } from '../utils/dlsConverter'
const API_BASE = API_BASE_URL || ''

// Default blue pin icon for job pins
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
})

// Red pin icon for searched LSD pins (change URL if you want a different color)
const searchedLSDIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
})

const INITIAL_CENTER = [54, -114]
const INITIAL_ZOOM = 5

// Helpers
const generateRange = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => i + start)
const pad = (num, len) => num.toString().padStart(len, '0')
function serialToDate(serial) {
  const utcDays = serial - (25567 + 2)
  const utc = utcDays * 86400 * 1000
  return new Date(utc)
}
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date)) return 'Invalid Date'
  return date.toISOString().split('T')[0]
}

// --- Custom component to trigger zoom when LSD pin changes ---
function ZoomToLSD({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position && Array.isArray(position)) {
      map.setView(position, 15, { animate: true })
    }
  }, [position, map])
  return null
}

export default function JobMap() {
  // State
  const [lsd, setLSD] = useState('')
  const [section, setSection] = useState('')
  const [township, setTownship] = useState('')
  const [range, setRange] = useState('')
  const [meridian, setMeridian] = useState('')
  const [searchedPins, setSearchedPins] = useState([])
  const [pins, setPins] = useState([])
  const [lastSearchedCoords, setLastSearchedCoords] = useState(null)
  const [popupOpen, setPopupOpen] = useState(false)
  const mapRef = useRef(null)

  // Load job pins
  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch(`${API_BASE}/api/jobs`)
        const data = await res.json()
        const mapped = data
          .map(job => {
            const pos = convertDLS(job.surface_lsd)
            return pos ? { ...job, position: pos } : null
          })
          .filter(Boolean)
        setPins(mapped)
      } catch (err) {
        console.error('Error loading jobs:', err)
      }
    }
    fetchJobs()
  }, [])

  // LSD Search
  const handleSearch = () => {
    if (!lsd || !section || !township || !range || !meridian) {
      alert('Please fill all LSD fields.')
      return
    }
    const combinedLSD = `${pad(lsd, 2)}-${pad(section, 2)}-${pad(township, 3)}-${pad(range, 2)}W${meridian}`
    const coords = convertDLS(combinedLSD)
    if (coords) {
      setSearchedPins(prev => [
        ...prev,
        { lsd: combinedLSD, position: coords }
      ])
      setLastSearchedCoords(coords)
      setLSD(''); setSection(''); setTownship(''); setRange(''); setMeridian('')
      setPopupOpen(true)
    } else {
      alert('Invalid or unknown LSD. Could not convert.')
    }
  }

  // Header: 48px, Bar: 44px
  const HEADER_HEIGHT = 38
  const FINDER_HEIGHT = 44

  // Function to clear all searched LSD pins and reset map
  const handleClearSearchedPins = () => {
    setSearchedPins([])
    setLastSearchedCoords(null)
    if (mapRef.current) {
      mapRef.current.setView(INITIAL_CENTER, INITIAL_ZOOM, { animate: true })
    }
  }

  return (
    <div className="w-full min-h-screen bg-white relative">
      {/* MAP BG */}
      <div
        className="fixed inset-0 z-0"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <MapContainer
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          style={{ height: "100%", width: "100%" }}
          whenCreated={instance => { mapRef.current = instance }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Regular job pins */}
          {pins.map(job => (
            <Marker key={job.id} position={job.position} icon={customIcon}>
              <Popup>
                <div
  style={{
    background: '#111',
    borderRadius: '12px',
    padding: '0.5rem',
    minWidth: '200px',
    maxWidth: '330px',
    boxShadow: "0 2px 8px 0 rgba(12,12,12,0.18)",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }}
>
                  <div
                    style={{
                      background: '#fff',
                      borderRadius: '8px',
                      width: '100%',
                      color: '#181A13',
                      padding: '0.5rem 0.6rem',
                      fontFamily: 'Erbaum, sans-serif',
                      fontWeight: 400,
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: '100%', textAlign: 'center', marginBottom: '5px' }}>
                      <img
                        src={`/assets/logos/${job.customer?.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`}
                        alt={`${job.customer} logo`}
                        style={{
                          maxHeight: '40px',
                          maxWidth: '100px',
                          objectFit: 'contain',
                          display: 'inline-block'
                        }}
                        onError={e => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 9,
                      margin: '0.15rem 0 0.25rem 0',
                      textAlign: 'center',
                      letterSpacing: 0.5,
                      color: '#181A13'
                    }}>
                      
                    </div>
                    <div style={{ color: '#181A13', fontSize: 8.5 }}>
                      <p style={{ margin: '2px 0' }}><b>LSD:</b> {job.surface_lsd}</p>
                      <p style={{ margin: '2px 0' }}><b>Rig‑In:</b> {formatDate(serialToDate(job.rig_in_date))}</p>
                      <p style={{ margin: '2px 0' }}><b>Start:</b> {formatDate(serialToDate(job.start_date))}</p>
                      <p style={{ margin: '2px 0' }}><b>End:</b> {formatDate(serialToDate(job.end_date))}</p>
                      <p style={{ margin: '2px 0' }}><b># Wells:</b> {job.num_wells}</p>
                      <p style={{ margin: '2px 0' }}><b>7‑1/16″ Valves:</b> {job.valve_7_1_16}</p>
                      <p style={{ margin: '2px 0' }}><b>5‑1/8″ Valves:</b> {job.valve_5_1_8}</p>
                      <p style={{ margin: '2px 0' }}><b>3‑1/16″ HYD:</b> {job.hyd_3_1_16}</p>
                      <p style={{ margin: '2px 0' }}><b>3‑1/16″ MAN:</b> {job.man_3_1_16}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Searched LSD pins (red, removable individually) */}
          {searchedPins.map((pin, idx) => (
            <Marker
              key={`searched-${idx}`}
              position={pin.position}
              icon={customIcon} // <-- unified icon
              eventHandlers={{
                click: () => {
                  setSearchedPins(prev => prev.filter((_, i) => i !== idx))
                  if (searchedPins.length === 1 && mapRef.current) {
                    mapRef.current.setView(INITIAL_CENTER, INITIAL_ZOOM, { animate: true })
                  }
                }
              }}
            >
              <Popup autoPan={true} open={popupOpen}>
                <div style={{
                  background: '#fff',
                  color: '#222',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  minWidth: '100px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 10,
                  boxShadow: "0 2px 8px 0 rgba(50,60,40,0.13)"
                }}>
                  <div>Searched LSD</div>
                  <div style={{ fontWeight: 400, fontSize: 10, marginTop: 6 }}>{pin.lsd}</div>
                </div>
              </Popup>
              {/* Zoom and pan to latest searched LSD (only for last pin) */}
              {idx === searchedPins.length - 1 && lastSearchedCoords && <ZoomToLSD position={lastSearchedCoords} />}
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* BLACK BAR (Finder) */}
      <div
        className="w-full z-20 flex items-center justify-center fixed"
        style={{
          left: 0,
          top: HEADER_HEIGHT,
          height: FINDER_HEIGHT,
          minHeight: FINDER_HEIGHT,
          background: "rgba(16,16,12,0.98)",
          borderBottom: "1.5px solid #494F3C",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.14)"
        }}
      >
        <div className="w-full max-w-8xl flex flex-row items-center justify-center px-3 space-x-2">
          <img
            src="/assets/whitelogo.png"
            alt="Paloma Logo"
            className="h-8 mr-3"
            style={{ filter: 'brightness(210%)' }}
          />
          <div className="text-[#F3F4F1] text-base font-bold tracking-wider whitespace-nowrap mr-3" style={{ letterSpacing: 2 }}>
            PALOMA JOB MAP AND LSD FINDER
          </div>
          {/* ALL CONTROLS INLINE */}
          <label className="text-[#E6E8DF] font-bold">LSD</label>
          <select value={lsd} onChange={e => setLSD(e.target.value)} className="bg-[#6a7257] text-white rounded px-1 py-0.5 w-20 text-center outline-none">
            <option value="">-</option>
            {generateRange(1, 16).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="text-[#E6E8DF] font-bold">Section</label>
          <select value={section} onChange={e => setSection(e.target.value)} className="bg-[#6a7257] text-white rounded px-1 py-0.5 w-20 text-center outline-none">
            <option value="">-</option>
            {generateRange(1, 36).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="text-[#E6E8DF] font-bold">Township</label>
          <select value={township} onChange={e => setTownship(e.target.value)} className="bg-[#6a7257] text-white rounded px-1 py-0.5 w-20 text-center outline-none">
            <option value="">-</option>
            {generateRange(1, 126).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="text-[#E6E8DF] font-bold">Range</label>
          <select value={range} onChange={e => setRange(e.target.value)} className="bg-[#6a7257] text-white rounded px-1 py-0.5 w-20 text-center outline-none">
            <option value="">-</option>
            {generateRange(1, 30).map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <label className="text-[#E6E8DF] font-bold">Meridian</label>
          <select value={meridian} onChange={e => setMeridian(e.target.value)} className="bg-[#6a7257] text-white rounded px-1 py-0.5 w-20 text-center outline-none">
            <option value="">-</option>
            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <button
            onClick={handleSearch}
            className="bg-[#6a7257] hover:bg-[#8a946b] text-white font-bold rounded px-2 py-0.5 ml-4 shadow transition text-base"
          >
            Search
          </button>
          {searchedPins.length > 0 && (
            <button
              onClick={handleClearSearchedPins}
              className="ml-2 px-2 py-0.5 rounded text-xs font-bold border border-[#6a7257] bg-white text-[#6a7257] hover:bg-[#6a7257] hover:text-white transition"
            >
              Clear LSD Pins
            </button>
          )}
        </div>
      </div>

      {/* SIDEBAR FLOATS OVER MAP */}
      <div className="fixed left-0 top-[48px] z-30">
        <Sidebar />
      </div>
    </div>
  )
}
