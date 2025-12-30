import React, { useState } from 'react';

function App() {
  const [mode, setMode] = useState('Petty');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [results, setResults] = useState('');

  const handleModeChange = () => {
    setMode(mode === 'Petty' ? 'Productive' : 'Petty');
  };

  const handleAnalyze = () => {
    // Analyze logic here
    setResults(`Results for ${mode} mode`);
  };

  return (
    <div style={{
      backgroundImage: 'linear-gradient(to bottom, #7a288a, #cbb4d4)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
      }}>
        <h1>Debate Mate</h1>
        <button onClick={handleModeChange}>{mode} Mode</button>
        <input type='text' value={name1} onChange={(e) => setName1(e.target.value)} placeholder='Name 1' />
        <input type='text' value={name2} onChange={(e) => setName2(e.target.value)} placeholder='Name 2' />
        <textarea value={text1} onChange={(e) => setText1(e.target.value)} placeholder='Text 1' />
        <textarea value={text2} onChange={(e) => setText2(e.target.value)} placeholder='Text 2' />
        <button onClick={handleAnalyze}>Analyze</button>
        <p>{results}</p>
      </div>
    </div>
  );
}

export default App;
