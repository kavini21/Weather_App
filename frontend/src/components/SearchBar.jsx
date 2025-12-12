import React from 'react';
import './SearchBar.css';
import searchIcon from '../assets/icons/search.svg';

export default function SearchBar({ value, onChange, onSubmit, placeholder = 'Search city name' }) {
  return (
    <form className="search-bar" onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(); }}>
      <div className="search-left">
        <img src={searchIcon} alt="search" className="search-icon" />
      </div>
      <input
        className="search-input"
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search city"
      />
      <button className="search-btn" type="submit">Add</button>
    </form>
  );
}
