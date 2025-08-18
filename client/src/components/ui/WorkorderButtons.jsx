// src/components/ui/WorkorderButtons.jsx

import React from 'react';
import Lottie from 'react-lottie';
import './ButtonEffects.css';

import arrowRightData from './animations/wired-gradient-1301-arrow-right-key-hover-press.json';
import arrowLeftData  from './animations/wired-gradient-1303-arrow-left-key-hover-press.json';

const defaultOpts = (animationData) => ({
  loop: true,
  autoplay: true,
  animationData,
  rendererSettings: { preserveAspectRatio: 'xMidYMid slice' }
});

export function PrevButton({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-6 disabled:opacity-50"
    >
      <span className="btn-icon">
        <Lottie
          options={defaultOpts(arrowLeftData)}
          isStopped={disabled}
          isPaused={disabled}
        />
      </span>
      {label}
    </button>
  );
}

// <PrimaryButton> now uses btn-6 instead of btn-5:
export function PrimaryButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="btn-6">
      {label}
    </button>
  );
}

export function SecondaryButton({ onClick, label }) {
  return (
    <button onClick={onClick} className="btn-6">
      {label}
    </button>
  );
}

export function NextButton({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn-6 disabled:opacity-50"
    >
      {label}
      <span className="btn-icon">
        <Lottie
          options={defaultOpts(arrowRightData)}
          isStopped={disabled}
          isPaused={disabled}
        />
      </span>
    </button>
  );
}
