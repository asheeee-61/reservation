import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/apiClient';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null = closed, {} = open
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setOpen(true);

    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(
        `${API_BASE_URL}/admin/search?q=${encodeURIComponent(q)}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal: abortRef.current.signal,
        }
      );
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setResults({ reservations: [], customers: [] });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setOpen(false);
      setResults(null);
      return;
    }
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current);
      doSearch(query);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleSelectReservation = (id) => {
    setOpen(false);
    setQuery('');
    navigate(`/admin/reservations/view/${id}`);
  };

  const handleSelectCustomer = (id) => {
    setOpen(false);
    setQuery('');
    navigate(`/admin/customers/${id}`);
  };

  const totalResults =
    results
      ? (results.reservations?.length || 0) + (results.customers?.length || 0)
      : 0;

  const isEmpty = results && totalResults === 0;

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', flex: '1 1 auto', maxWidth: 500, minWidth: 200 }}
    >
      {/* Input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 36,
          border: '1px solid #DADCE0',
          borderRadius: '4px',
          px: '8px',
          gap: '6px',
          bgcolor: '#FFFFFF',
          '&:focus-within': { border: '1px solid #1A73E8' },
        }}
      >
        <span
          className="material-icons"
          style={{ fontSize: 18, color: '#70757A', flexShrink: 0 }}
        >
          search
        </span>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results && totalResults > 0) setOpen(true); }}
          placeholder="Buscar reservas, clientes, teléfono..."
          style={{
            border: 'none',
            outline: 'none',
            fontFamily: 'Roboto, sans-serif',
            fontSize: 14,
            fontWeight: 400,
            color: '#202124',
            background: 'transparent',
            width: '100%',
          }}
        />
        {loading && (
          <span
            className="material-icons"
            style={{
              fontSize: 16,
              color: '#1A73E8',
              flexShrink: 0,
              animation: 'spin 1s linear infinite',
            }}
          >
            sync
          </span>
        )}
        {query && !loading && (
          <span
            className="material-icons"
            style={{ fontSize: 16, color: '#70757A', cursor: 'pointer', flexShrink: 0 }}
            onClick={() => { setQuery(''); setResults(null); setOpen(false); }}
          >
            close
          </span>
        )}
      </Box>

      {/* Dropdown */}
      {open && (
        <Box
          sx={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            bgcolor: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: '4px',
            maxHeight: 320,
            overflowY: 'auto',
            zIndex: 1300,
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          }}
        >
          {isEmpty && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 64,
              }}
            >
              <Typography
                sx={{ fontFamily: 'Roboto', fontSize: 14, fontWeight: 400, color: '#70757A' }}
              >
                Sin resultados
              </Typography>
            </Box>
          )}

          {/* Reservations group */}
          {results?.reservations?.length > 0 && (
            <>
              <SectionLabel>RESERVAS</SectionLabel>
              {results.reservations.map((r) => (
                <ResultItem
                  key={`res-${r.id}`}
                  icon="event"
                  primary={r.name}
                  secondary={`${r.time}${r.time && r.date_label ? ' · ' : ''}${r.date_label}`}
                  onClick={() => handleSelectReservation(r.id)}
                />
              ))}
            </>
          )}

          {/* Customers group */}
          {results?.customers?.length > 0 && (
            <>
              <SectionLabel>CLIENTES</SectionLabel>
              {results.customers.map((c) => (
                <ResultItem
                  key={`cus-${c.id}`}
                  icon="person"
                  primary={c.name}
                  secondary={
                    c.reservations_count === 1
                      ? '1 reserva'
                      : `${c.reservations_count} reservas`
                  }
                  onClick={() => handleSelectCustomer(c.id)}
                />
              ))}
            </>
          )}
        </Box>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
}

function SectionLabel({ children }) {
  return (
    <Box sx={{ px: '12px', pt: '10px', pb: '4px' }}>
      <Typography
        sx={{
          fontFamily: 'Roboto',
          fontSize: 11,
          fontWeight: 500,
          color: '#70757A',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

function ResultItem({ icon, primary, secondary, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: 48,
        px: '12px',
        gap: '12px',
        cursor: 'pointer',
        '&:hover': { bgcolor: '#F1F3F4' },
      }}
    >
      <span className="material-icons" style={{ fontSize: 18, color: '#70757A', flexShrink: 0 }}>
        {icon}
      </span>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          noWrap
          sx={{ fontFamily: 'Roboto', fontSize: 14, fontWeight: 500, color: '#202124' }}
        >
          {primary}
        </Typography>
        {secondary && (
          <Typography
            noWrap
            sx={{ fontFamily: 'Roboto', fontSize: 12, fontWeight: 400, color: '#70757A' }}
          >
            {secondary}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
