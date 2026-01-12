import { useState } from "react";

export default function Settings() {
  const [theme, setTheme] = useState("light");

  return (
    <div>
      <h1>Settings</h1>
      <label>
        Theme:
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  );
}
