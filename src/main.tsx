//import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './i18n';
import App from './App.tsx'
import { RecoilRoot } from 'recoil';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <RecoilRoot>
    <App />
  </RecoilRoot>
 // </React.StrictMode>
)
