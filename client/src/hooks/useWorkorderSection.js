// src/hooks/useWorkorderSection.js

import { useState } from 'react';

/**
 * Generic hook for any section of the workorder (DFIT, UMA, FCA, etc).
 * Manages selections, build quantities, tab state, consumables, and now specs per tab.
 * 
 * @param {{ key:string, title:string, tabs:string[], locCount:number, fields:string[] }} config
 * @returns {{
 *   key: string,
 *   title: string,
 *   tabs: string[],
 *   selections: object[],
 *   setSelections: Function,
 *   buildQtys: number[],
 *   setBuildQtys: Function,
 *   activeTab: number,
 *   setActiveTab: Function,
 *   tabConsumables: object[],
 *   setTabConsumables: Function,
 *   onChange: Function,
 *   specs: object[],
 *   setSpecs: Function,
 * }}
 */
export function useWorkorderSection({ key, title, tabs, locCount, fields = ['location'] }) {
  // Build an "empty" object for one tab: { field1: '', field2: '', … } for each index
  const makeEmptySelection = () => {
    const obj = {};
    for (const field of fields) {
      for (let i = 1; i <= locCount; i++) {
        obj[`${field}${i}`] = '';
      }
    }
    return obj;
  };

  // One selection-object per tab
  const [selections, setSelections] = useState(tabs.map(() => makeEmptySelection()));

  // How many to build/share per index (shared shape with tabs)
  const [buildQtys, setBuildQtys] = useState(Array(tabs.length).fill(0));

  // Which tab is active
  const [activeTab, setActiveTab] = useState(0);

  // Consumables saved per tab
  const [tabConsumables, setTabConsumables] = useState(
    tabs.map(() => ({ gaskets: [], boltups: [] }))
  );

  // ---- NEW: Store specs per tab ----
  // Example: specs[tabIndex] = { fillVolume, weight, OAL, etc }
  const [specs, setSpecs] = useState(tabs.map(() => ({})));

  /**
   * Update a single field on the current tab.
   * @param {string} fieldName  e.g. "location3" or "category7"
   * @param {string|number} value
   */
  const onChange = (fieldName, value) => {
    setSelections(prev =>
      prev.map((selObj, idx) =>
        idx === activeTab
          ? { ...selObj, [fieldName]: value }
          : selObj
      )
    );
  };

  return {
    key,
    title,
    tabs,
    selections,       // array-of-objects (per tab)
    setSelections,
    buildQtys,        // array of numbers
    setBuildQtys,
    activeTab,        // index
    setActiveTab,
    tabConsumables,   // array of consumable objects per tab
    setTabConsumables,
    onChange,         // (field, value) updates selection on active tab
    specs,            // array of objects: [{ fillVolume, OAL, weight, ... }]
    setSpecs,         // (specsArr) or (fn) => ...
  };
}

export default useWorkorderSection;
