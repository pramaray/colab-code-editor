import React from "react";

const supportedLanguages = {
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
  java: "Java",
};

function LanguageSelector({ language, onChange }) {
  return (
    <select
      value={language}
      onChange={onChange}
      className="bg-gray-800 text-white rounded px-3 py-1 border border-gray-600 focus:outline-none"
    >
      {Object.entries(supportedLanguages).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;
