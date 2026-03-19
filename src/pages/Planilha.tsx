import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Grid3X3, Plus, Trash2, Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import ConfirmDialog from '@/components/ConfirmDialog';

const MAX_ROWS = 30;
const MAX_COLS = 10;
const STORAGE_KEY = 'fincontrol_spreadsheet';
const AUTO_SAVE_INTERVAL = 5000;

type CellValue = string;
type Grid = CellValue[][];

function createGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(''));
}

function parseNum(val: string): number {
  const n = parseFloat(val.replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

export default function Planilha() {
  const { toast } = useToast();
  const [grid, setGrid] = useState<Grid>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return createGrid(5, 4);
  });
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [deletingRow, setDeletingRow] = useState<number | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(grid));

  const rows = grid.length;
  const cols = grid[0]?.length ?? 4;

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      const current = JSON.stringify(grid);
      if (current !== lastSavedRef.current) {
        setAutoSaveStatus('saving');
        localStorage.setItem(STORAGE_KEY, current);
        lastSavedRef.current = current;
        setTimeout(() => setAutoSaveStatus('saved'), 300);
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      }
    }, AUTO_SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [grid]);

  // Save before leaving
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(grid));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [grid]);

  function updateCell(r: number, c: number, val: string) {
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = val;
      return next;
    });
  }

  function addRow() {
    if (rows >= MAX_ROWS) return;
    setGrid(prev => [...prev, Array(cols).fill('')]);
  }

  function addCol() {
    if (cols >= MAX_COLS) return;
    setGrid(prev => prev.map(row => [...row, '']));
  }

  function confirmRemoveRow() {
    if (deletingRow === null || rows <= 1) return;
    setGrid(prev => prev.filter((_, i) => i !== deletingRow));
    setDeletingRow(null);
  }

  function removeCol(c: number) {
    if (cols <= 1) return;
    setGrid(prev => prev.map(row => row.filter((_, i) => i !== c)));
  }

  function saveGrid() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grid));
    lastSavedRef.current = JSON.stringify(grid);
    toast({ title: 'Planilha salva!' });
  }

  const colSums = useMemo(() => {
    return Array.from({ length: cols }, (_, c) =>
      grid.reduce((sum, row) => sum + parseNum(row[c] ?? ''), 0)
    );
  }, [grid, cols]);

  const rowSums = useMemo(() => {
    return grid.map(row => row.reduce((sum, cell) => sum + parseNum(cell), 0));
  }, [grid]);

  const colHeaders = useMemo(() =>
    Array.from({ length: cols }, (_, i) => String.fromCharCode(65 + i)),
    [cols]
  );

  return (
    <div className="page-container pt-6 pb-24 space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Grid3X3 size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Planilha Rápida</h1>
        <p className="text-sm text-muted-foreground">Faça cálculos rápidos com até {MAX_ROWS} linhas e {MAX_COLS} colunas.</p>
      </div>

      <div className="flex gap-2 items-center">
        <Button size="sm" variant="outline" onClick={addRow} disabled={rows >= MAX_ROWS} className="gap-1.5 text-xs flex-1">
          <Plus size={14} /> Linha
        </Button>
        <Button size="sm" variant="outline" onClick={addCol} disabled={cols >= MAX_COLS} className="gap-1.5 text-xs flex-1">
          <Plus size={14} /> Coluna
        </Button>
        <Button size="sm" onClick={saveGrid} className="gap-1.5 text-xs">
          <Save size={14} /> Salvar
        </Button>
        {autoSaveStatus !== 'idle' && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0">
            {autoSaveStatus === 'saving' && 'Salvando...'}
            {autoSaveStatus === 'saved' && <><Check size={10} className="text-income" /> Salvo</>}
          </span>
        )}
      </div>

      <div className="glass rounded-2xl p-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="w-8 text-muted-foreground font-medium p-1">#</th>
              {colHeaders.map((h, c) => (
                <th key={c} className="p-1 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-muted-foreground font-medium">{h}</span>
                    {cols > 1 && (
                      <button onClick={() => removeCol(c)} className="text-destructive/50 hover:text-destructive">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-1 text-center text-muted-foreground font-medium w-16">Soma</th>
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                <td className="p-1 text-center text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>{r + 1}</span>
                    {rows > 1 && (
                      <button onClick={() => setDeletingRow(r)} className="text-destructive/50 hover:text-destructive">
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                </td>
                {row.map((cell, c) => (
                  <td key={c} className="p-0.5">
                    <Input
                      className="h-7 text-xs text-center px-1"
                      value={cell}
                      onChange={e => updateCell(r, c, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-1 text-center text-xs font-medium text-primary">
                  {rowSums[r] !== 0 ? rowSums[r].toFixed(2).replace('.', ',') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border/50">
              <td className="p-1 text-xs text-muted-foreground font-medium">Σ</td>
              {colSums.map((s, c) => (
                <td key={c} className="p-1 text-center text-xs font-medium text-primary">
                  {s !== 0 ? s.toFixed(2).replace('.', ',') : '—'}
                </td>
              ))}
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <ConfirmDialog
        open={deletingRow !== null}
        onOpenChange={open => { if (!open) setDeletingRow(null); }}
        onConfirm={confirmRemoveRow}
        title="Excluir linha"
        description="Tem certeza que deseja excluir esta linha? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
