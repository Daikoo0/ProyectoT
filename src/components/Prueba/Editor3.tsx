import 'react-data-grid/lib/styles.css';
import DataGrid from 'react-data-grid';
import { useState } from 'react';

const columns = [
  { key: 'id', name: 'ID', width: 80 },
  {
    key: 'title',
    name: 'Title',
    formatter: ({ row }) => (
      <div style={{ whiteSpace: 'normal', lineHeight: '20px', display: 'flex', alignItems: 'center' }}>

        {row.title}
      </div>
    )
  }
];

const rows = [
  {
    id: 0, title: <svg width="100%" height="100%">
      <rect width="100%" height="100%" fill="red" />
      <line x1="0" y1="50" x2="50%" y2="50" stroke="black" />
      <circle cx="50%" cy="100" r="30" stroke="blue" />
    </svg>
  },
  { id: 1, title: 'Demo' }
];

function App() {
  const [height, setHeight] = useState(90);

  return (
    <div>
      <DataGrid
        columns={columns}
        rows={rows}
        rowHeight={(e) => {
          if (e.id == 1) return 80;
          else return height;
        }}
        defaultColumnOptions={{
          resizable: true,
          sortable: true
        }}
      />
      <label>cambio height</label>
      <input type="number" onChange={(e) => setHeight(Number(e.target.value))}></input>
    </div>
  );
}

export default App;
