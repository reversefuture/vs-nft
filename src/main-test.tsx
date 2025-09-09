// import React from 'react'
import ReactDOM from 'react-dom/client'

const TestApp = () => {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'red' }}>
      <h1>Test App Working!</h1>
      <p>If you can see this, React is working.</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TestApp />)