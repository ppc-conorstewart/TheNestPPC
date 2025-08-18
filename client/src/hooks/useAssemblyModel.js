import { useState } from "react";

export default function useAssemblyModel(initialUrl = null, initialLocked = false, initialLabels = []) {
  const [modelUrl, setModelUrl] = useState(initialUrl);
  const [locked, setLocked] = useState(initialLocked);
  const [labels, setLabels] = useState(initialLabels);
  return {
    modelUrl,
    setModelUrl,
    locked,
    setLocked,
    labels,
    setLabels,
  };
}
