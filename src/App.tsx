import { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './App.css';

function App() {
  const [showPanel, setShowPanel] = useState(false);
  const codeHeader = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <FaChevronDown
        style={{
          fontSize: 18,
          color: '#888',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          transform: showPanel ? 'rotate(180deg)' : 'none',
          marginRight: 8,
        }}
        aria-label="Show selection panel"
        onClick={() => setShowPanel((v) => !v)}
      />
      <span>Code</span>
    </div>
  );
  const [data, setData] = useState<RowData[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<RowData[]>([]);

  useEffect(() => {
    fetchData(page).then(({ data, total }) => {
      setData(data);
      setTotalRecords(total);
    });
  }, [page]);

  const onPageChange = (event: any) => {
    setPage(event.page);
  };
interface RowData {
  code: string;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

const PAGE_SIZE = 10;

const fetchData = async (page: number): Promise<{ data: RowData[]; total: number }> => {
  const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${page + 1}`);
  const json = await response.json();
  const total = json.pagination.total || 0;
  const data: RowData[] = (json.data || []).map((item: any, idx: number) => ({
    code: item.id ? String(item.id) : `P${page * PAGE_SIZE + idx + 1}`,
    title: item.title || '',
    place_of_origin: item.place_of_origin || '',
    artist_display: item.artist_display || '',
    inscriptions: item.inscriptions || '',
    date_start: item.date_start || '',
    date_end: item.date_end || '',
  }));
  return { data, total };
};

      return (
        <div className="p-m-4" style={{ background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: '12px', position: 'relative' }}>
          {showPanel && (
            <div
              style={{
                position: 'absolute',
                left: 40,
                top: 60,
                zIndex: 20,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 8,
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                padding: '1rem',
                minWidth: 220,
              }}
            >
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Select rows...</div>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const num = Number((form.elements.namedItem('selectCount') as HTMLInputElement).value);
                  if (!isNaN(num) && num > 0) {
                    let selected: RowData[] = [];
                    let currentPage = 0;
                    let rowsNeeded = num;
                    let totalRows = totalRecords;
                    while (rowsNeeded > 0 && selected.length < totalRows) {
                      const result = await fetchData(currentPage);
                      const pageData = result.data;
                      for (let i = 0; i < pageData.length && rowsNeeded > 0; i++) {
                        selected.push(pageData[i]);
                        rowsNeeded--;
                      }
                      currentPage++;
                      if (pageData.length === 0) break;
                    }
                    setSelectedProducts(selected);
                    setShowPanel(false); // Hide overlay panel after submit
                  }
                }}
                style={{ marginBottom: 12 }}
              >
                <input
                  type="number"
                  name="selectCount"
                  min={1}
                  placeholder="Enter number of rows"
                  style={{ width: '100%', marginBottom: 8, padding: 6, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ width: '100%', padding: '6px 0', fontSize: 18, borderRadius: 4, border: '1px solid #ccc', background: '#fafafa', cursor: 'pointer' }}>submit</button>
              </form>
              {selectedProducts && selectedProducts.length === 0 ? (
                <div style={{ color: '#888', fontSize: 14 }}>No rows selected</div>
              ) : (
                selectedProducts && selectedProducts.map((row) => (
                  <div key={row.code} style={{ marginBottom: 4 }}>
                    {/* Hide title, only show code and remove button */}
                    <span>{row.code}</span>
                    <button style={{ marginLeft: 8, fontSize: 12 }} onClick={() => {
                      setSelectedProducts(selectedProducts.filter(r => r.code !== row.code));
                    }}>Remove</button>
                  </div>
                ))
              )}
            </div>
          )}

          <DataTable
            value={data}
            paginator
            rows={PAGE_SIZE}
            totalRecords={totalRecords}
            first={page * PAGE_SIZE}
            onPage={onPageChange}
            selection={selectedProducts}
            onSelectionChange={(e: any) => setSelectedProducts(e.value)}
            selectionMode="checkbox"
            dataKey="code"
            lazy
            tableStyle={{ minWidth: '50rem' }}
          >
  <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
  <Column field="code" header={codeHeader} />
  <Column field="title" header="Title" />
  <Column field="place_of_origin" header="Place of Origin" />
  <Column field="artist_display" header="Artist" />
  <Column field="inscriptions" header="Inscriptions" />
  <Column field="date_start" header="Date Start" />
  <Column field="date_end" header="Date End" />
          </DataTable>
        </div>
      );
}
export default App;
