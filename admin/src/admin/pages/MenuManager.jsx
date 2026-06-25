import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box, Typography, Button, IconButton, Switch, TextField,
  CircularProgress, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import { menuService } from '../services/menuService';
import { useToast } from '../components/Toast/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';

// ─── Tree helpers ──────────────────────────────────────────────────────────────

function buildTree(items, parentId = null) {
  return items
    .filter(i => (i.parent_id ?? null) === parentId)
    .sort((a, b) => a.order - b.order)
    .map(item => ({ ...item, _children: buildTree(items, item.id) }));
}

function getSiblings(items, item) {
  return items
    .filter(i => (i.parent_id ?? null) === (item.parent_id ?? null))
    .sort((a, b) => a.order - b.order);
}

// ─── Tree node ────────────────────────────────────────────────────────────────

function TreeNode({ item, level, selectedId, expanded, items, onSelect, onToggle, onAddChild, onMoveUp, onMoveDown }) {
  const siblings = getSiblings(items, item);
  const idx      = siblings.findIndex(s => s.id === item.id);
  const isFirst  = idx === 0;
  const isLast   = idx === siblings.length - 1;
  const isOpen   = expanded.has(item.id);
  const isSel    = selectedId === item.id;
  const hasKids  = item._children.length > 0;

  return (
    <Box>
      <Box
        onClick={() => onSelect(item)}
        sx={{
          display: 'flex', alignItems: 'center', gap: '4px',
          py: '6px', pl: `${8 + level * 18}px`, pr: '6px',
          cursor: 'pointer', borderRadius: '4px',
          bgcolor: isSel ? '#E8F0FE' : 'transparent',
          border: isSel ? '1px solid #C5D9F8' : '1px solid transparent',
          '&:hover': { bgcolor: isSel ? '#E8F0FE' : '#F1F3F4' },
          transition: 'background 120ms',
        }}
      >
        {/* Expand toggle */}
        <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {hasKids ? (
            <IconButton size="small" onClick={e => { e.stopPropagation(); onToggle(item.id); }}
              sx={{ width: 20, height: 20, p: 0 }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#70757A' }}>
                {isOpen ? 'expand_more' : 'chevron_right'}
              </span>
            </IconButton>
          ) : (
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#DADCE0', mx: 'auto' }} />
          )}
        </Box>

        {/* Label */}
        <Typography sx={{
          flex: 1, fontSize: '13px', color: '#202124',
          fontWeight: isSel ? 500 : 400,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.label}
        </Typography>

        {/* Time badge */}
        {item.active_from && (
          <Typography sx={{ fontSize: '10px', color: '#70757A', flexShrink: 0, mr: '4px' }}>
            {item.active_from.slice(0, 5)}–{item.active_until?.slice(0, 5)}
          </Typography>
        )}

        {/* Enabled pill */}
        <Box sx={{
          px: '6px', height: 16, borderRadius: '8px', display: 'flex', alignItems: 'center',
          flexShrink: 0, fontSize: '10px', fontWeight: 500, mr: '4px',
          bgcolor: item.is_enabled ? '#E6F4EA' : '#F1F3F4',
          color:   item.is_enabled ? '#137333' : '#9AA0A6',
        }}>
          {item.is_enabled ? 'ON' : 'OFF'}
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          <IconButton size="small" disabled={isFirst} onClick={() => onMoveUp(item, siblings)}
            sx={{ width: 20, height: 20, p: 0 }}>
            <span className="material-icons" style={{ fontSize: 13, color: isFirst ? '#E0E0E0' : '#9AA0A6' }}>
              keyboard_arrow_up
            </span>
          </IconButton>
          <IconButton size="small" disabled={isLast} onClick={() => onMoveDown(item, siblings)}
            sx={{ width: 20, height: 20, p: 0 }}>
            <span className="material-icons" style={{ fontSize: 13, color: isLast ? '#E0E0E0' : '#9AA0A6' }}>
              keyboard_arrow_down
            </span>
          </IconButton>
          <IconButton size="small" onClick={() => onAddChild(item.id)}
            sx={{ width: 20, height: 20, p: 0 }}>
            <span className="material-icons" style={{ fontSize: 13, color: '#1A73E8' }}>add</span>
          </IconButton>
        </Box>
      </Box>

      {isOpen && item._children.map(child => (
        <TreeNode key={child.id} item={child} level={level + 1}
          selectedId={selectedId} expanded={expanded} items={items}
          onSelect={onSelect} onToggle={onToggle} onAddChild={onAddChild}
          onMoveUp={onMoveUp} onMoveDown={onMoveDown}
        />
      ))}
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  id: null, parent_id: null,
  label: '', is_enabled: true,
  active_from: '', active_until: '',
  resource_type: '', resource_url: null,
};

export default function MenuManager() {
  const toast   = useToast();
  const fileRef = useRef(null);

  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedId,  setSelectedId]  = useState(null);
  const [expanded,    setExpanded]    = useState(new Set());
  const [form,        setForm]        = useState(null);
  const [mode,        setMode]        = useState('parent'); // 'parent' | 'resource'
  const [isNew,       setIsNew]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await menuService.getAll();
      setItems(data);
    } catch (e) {
      toast.error(e.message || 'Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const tree = buildTree(items);

  const handleSelect = (item) => {
    setSelectedId(item.id);
    setIsNew(false);
    const hasKids     = items.some(i => i.parent_id === item.id);
    const hasResource = !!item.resource_type;
    setMode(hasKids ? 'parent' : hasResource ? 'resource' : 'parent');
    setForm({
      id:            item.id,
      parent_id:     item.parent_id ?? null,
      label:         item.label,
      is_enabled:    item.is_enabled,
      active_from:   item.active_from  ? item.active_from.slice(0, 5)  : '',
      active_until:  item.active_until ? item.active_until.slice(0, 5) : '',
      resource_type: item.resource_type || '',
      resource_url:  item.resource_url  || null,
    });
  };

  const handleAddRoot = () => {
    setSelectedId(null);
    setIsNew(true);
    setMode('parent');
    setForm({ ...EMPTY_FORM });
  };

  const handleAddChild = (parentId) => {
    setSelectedId(null);
    setIsNew(true);
    setMode('parent');
    setForm({ ...EMPTY_FORM, parent_id: parentId });
    setExpanded(prev => new Set([...prev, parentId]));
  };

  const handleToggle = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleMoveUp = async (item, siblings) => {
    const idx = siblings.findIndex(s => s.id === item.id);
    if (idx === 0) return;
    const prev    = siblings[idx - 1];
    const updated = [{ id: item.id, order: prev.order }, { id: prev.id, order: item.order }];
    setItems(curr => curr.map(i => { const u = updated.find(x => x.id === i.id); return u ? { ...i, order: u.order } : i; }));
    try { await menuService.reorder(updated); } catch { fetchItems(); }
  };

  const handleMoveDown = async (item, siblings) => {
    const idx = siblings.findIndex(s => s.id === item.id);
    if (idx === siblings.length - 1) return;
    const next    = siblings[idx + 1];
    const updated = [{ id: item.id, order: next.order }, { id: next.id, order: item.order }];
    setItems(curr => curr.map(i => { const u = updated.find(x => x.id === i.id); return u ? { ...i, order: u.order } : i; }));
    try { await menuService.reorder(updated); } catch { fetchItems(); }
  };

  const handleSave = async () => {
    if (!form.label.trim()) { toast.error('El nombre es obligatorio'); return; }
    if ((form.active_from && !form.active_until) || (!form.active_from && form.active_until)) {
      toast.error('Debes establecer ambos horarios o ninguno'); return;
    }

    const siblings = items.filter(i => (i.parent_id ?? null) === (form.parent_id ?? null));
    const payload  = {
      label:         form.label.trim(),
      is_enabled:    form.is_enabled,
      active_from:   form.active_from  || null,
      active_until:  form.active_until || null,
      parent_id:     form.parent_id    ?? null,
      resource_type: mode === 'resource' ? (form.resource_type || null) : null,
      ...(isNew ? { order: siblings.length } : {}),
    };

    setSaving(true);
    try {
      if (isNew) {
        const created = await menuService.create(payload);
        await fetchItems();
        setIsNew(false);
        setSelectedId(created.id);
        setForm(f => ({ ...f, id: created.id }));
        toast.success('Elemento creado');
      } else {
        await menuService.update(form.id, payload);
        await fetchItems();
        toast.success('Cambios guardados');
      }
    } catch (e) {
      toast.error(e.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form?.id) return;
    setSaving(true);
    try {
      await menuService.remove(form.id);
      setForm(null); setSelectedId(null); setIsNew(false); setDeleteModal(false);
      await fetchItems();
      toast.success('Elemento eliminado');
    } catch (e) {
      toast.error(e.message || 'Error al eliminar');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !form?.id) return;
    setUploading(true);
    try {
      const updated = await menuService.upload(form.id, file);
      setForm(f => ({ ...f, resource_type: updated.resource_type, resource_url: updated.resource_url }));
      setItems(curr => curr.map(i => i.id === updated.id ? { ...i, ...updated } : i));
      toast.success('Archivo subido correctamente');
    } catch (e) {
      toast.error(e.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const selectedHasChildren = form?.id && items.some(i => i.parent_id === form.id);

  const handleTimeInput = (field) => (e) => {
    let v = e.target.value.replace(/[^\d:]/g, '');
    if (v.length === 2 && !v.includes(':') && e.nativeEvent.inputType !== 'deleteContentBackward') v += ':';
    if (v.length > 5) return;
    setForm(f => ({ ...f, [field]: v }));
  };

  return (
    <Box sx={{ display: 'flex', gap: '16px', height: 'calc(100vh - 56px - 48px)', minHeight: 0 }}>

      {/* LEFT: Tree panel */}
      <Box sx={{
        width: 340, minWidth: 280, maxWidth: 400, bgcolor: '#FFFFFF', borderRadius: '4px',
        border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: '12px', py: '10px', borderBottom: '1px solid #E0E0E0' }}>
          <Typography sx={{ fontWeight: 500, fontSize: '13px', color: '#202124', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Menú digital
          </Typography>
          <Button size="small" variant="contained" onClick={handleAddRoot}
            startIcon={<span className="material-icons" style={{ fontSize: 14 }}>add</span>}
            sx={{ height: 28, px: '10px', fontSize: '11px', textTransform: 'uppercase', bgcolor: '#1A73E8', minWidth: 0 }}
          >
            Raíz
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', py: '6px' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: '40px' }}>
              <CircularProgress size={24} />
            </Box>
          ) : tree.length === 0 ? (
            <EmptyState
              icon="restaurant_menu"
              title="Sin elementos"
              message="Añade el primer botón al menú."
              action={{ label: 'Añadir elemento', onClick: handleAddRoot }}
            />
          ) : (
            tree.map(item => (
              <TreeNode key={item.id} item={item} level={0}
                selectedId={selectedId} expanded={expanded} items={items}
                onSelect={handleSelect} onToggle={handleToggle}
                onAddChild={handleAddChild}
                onMoveUp={handleMoveUp} onMoveDown={handleMoveDown}
              />
            ))
          )}
        </Box>
      </Box>

      {/* RIGHT: Editor panel */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {!form ? (
          <Box sx={{
            bgcolor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E0E0E0',
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Box sx={{ textAlign: 'center', color: '#9AA0A6' }}>
              <span className="material-icons" style={{ fontSize: 48 }}>touch_app</span>
              <Typography sx={{ mt: '8px', fontSize: '14px' }}>
                Selecciona un elemento para editarlo
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{
            bgcolor: '#FFFFFF', borderRadius: '4px', border: '1px solid #E0E0E0',
            height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header */}
            <Box sx={{ px: '20px', py: '14px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontWeight: 500, fontSize: '15px', color: '#202124' }}>
                {isNew ? 'Nuevo elemento' : 'Editar elemento'}
              </Typography>
              {!isNew && (
                <IconButton onClick={() => setDeleteModal(true)}
                  sx={{ border: '1px solid #FDECEA', borderRadius: '4px', width: 32, height: 32, p: 0, bgcolor: '#FDECEA' }}>
                  <span className="material-icons" style={{ fontSize: 16, color: '#D93025' }}>delete</span>
                </IconButton>
              )}
            </Box>

            {/* Body */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Label */}
              <TextField
                label="Nombre del botón" required fullWidth variant="outlined"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                error={!form.label.trim()}
                helperText={!form.label.trim() ? 'El nombre es obligatorio' : ''}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { height: 56, borderRadius: '4px' } }}
              />

              {/* Enabled toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: '4px' }}>
                <Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#202124' }}>Visible</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#70757A' }}>
                    El botón aparece en el menú del cliente
                  </Typography>
                </Box>
                <Switch checked={form.is_enabled} color="primary"
                  onChange={e => setForm(f => ({ ...f, is_enabled: e.target.checked }))} />
              </Box>

              {/* Time restriction */}
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#202124', mb: '4px' }}>
                  Restricción horaria
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#70757A', mb: '10px' }}>
                  Activa el botón solo en este intervalo. Soporta rangos que cruzan la medianoche (ej. 22:00–02:00).
                </Typography>
                <Box sx={{ display: 'flex', gap: '12px' }}>
                  <TextField label="Desde" InputLabelProps={{ shrink: true }}
                    value={form.active_from}
                    onChange={handleTimeInput('active_from')}
                    inputProps={{ maxLength: 5, placeholder: 'HH:MM' }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: 48, borderRadius: '4px' } }}
                  />
                  <TextField label="Hasta" InputLabelProps={{ shrink: true }}
                    value={form.active_until}
                    onChange={handleTimeInput('active_until')}
                    inputProps={{ maxLength: 5, placeholder: 'HH:MM' }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: 48, borderRadius: '4px' } }}
                  />
                </Box>
                {((form.active_from && !form.active_until) || (!form.active_from && form.active_until)) && (
                  <Typography sx={{ fontSize: '12px', color: '#D93025', mt: '4px' }}>
                    Debes establecer ambos horarios o ninguno
                  </Typography>
                )}
                {form.active_from && form.active_until && form.active_from > form.active_until && (
                  <Typography sx={{ fontSize: '12px', color: '#F29900', mt: '4px' }}>
                    Rango cruza la medianoche: activo de {form.active_from} a {form.active_until} del día siguiente.
                  </Typography>
                )}
              </Box>

              {/* Type selector */}
              <Box>
                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#202124', mb: '6px' }}>
                  Tipo de botón
                </Typography>

                {selectedHasChildren && (
                  <Box sx={{ bgcolor: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: '4px', p: '10px', mb: '10px' }}>
                    <Typography sx={{ fontSize: '12px', color: '#E65100' }}>
                      Este botón tiene sub-botones. No se le puede asignar un recurso directamente.
                    </Typography>
                  </Box>
                )}

                <RadioGroup row value={mode} onChange={e => {
                  if (selectedHasChildren && e.target.value === 'resource') return;
                  setMode(e.target.value);
                  if (e.target.value === 'parent') setForm(f => ({ ...f, resource_type: '' }));
                }}>
                  <FormControlLabel value="parent" control={<Radio size="small" />}
                    label={<Typography sx={{ fontSize: '14px' }}>Tiene sub-botones</Typography>} />
                  <FormControlLabel value="resource" control={<Radio size="small" />}
                    disabled={selectedHasChildren}
                    label={<Typography sx={{ fontSize: '14px' }}>Abre un recurso</Typography>} />
                </RadioGroup>
              </Box>

              {/* Resource section */}
              {mode === 'resource' && (
                <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '4px', p: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#202124' }}>Recurso adjunto</Typography>

                  {form.resource_url && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', bgcolor: '#F1F3F4', borderRadius: '4px', p: '10px' }}>
                      <span className="material-icons" style={{ fontSize: 20, color: '#70757A' }}>
                        {form.resource_type === 'pdf' ? 'picture_as_pdf' : 'image'}
                      </span>
                      <Typography sx={{ fontSize: '13px', color: '#202124', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {form.resource_type?.toUpperCase()} — {decodeURIComponent(form.resource_url.split('/').pop())}
                      </Typography>
                      <Button size="small" component="a" href={form.resource_url} target="_blank" rel="noopener noreferrer"
                        sx={{ fontSize: '11px', color: '#1A73E8', minWidth: 0, textTransform: 'uppercase' }}>
                        Ver
                      </Button>
                    </Box>
                  )}

                  {isNew ? (
                    <Typography sx={{ fontSize: '12px', color: '#70757A', fontStyle: 'italic' }}>
                      Guarda el elemento primero para poder subir un archivo.
                    </Typography>
                  ) : (
                    <>
                      <input type="file" ref={fileRef} onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                        style={{ display: 'none' }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Button variant="outlined" size="small" onClick={() => fileRef.current?.click()}
                          disabled={uploading}
                          startIcon={uploading
                            ? <CircularProgress size={13} />
                            : <span className="material-icons" style={{ fontSize: 15 }}>upload</span>
                          }
                          sx={{ height: 36, fontSize: '12px', textTransform: 'uppercase', borderColor: '#DADCE0', color: '#202124' }}
                        >
                          {uploading ? 'Subiendo…' : form.resource_url ? 'Reemplazar' : 'Subir archivo'}
                        </Button>
                        <Typography sx={{ fontSize: '11px', color: '#9AA0A6' }}>
                          PDF o imagen
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              )}
            </Box>

            {/* Footer */}
            <Box sx={{ px: '20px', py: '14px', borderTop: '1px solid #E0E0E0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button variant="contained" onClick={handleSave} disabled={saving}
                sx={{ height: 36, px: '24px', bgcolor: '#1A73E8', fontSize: '13px', textTransform: 'uppercase' }}>
                {saving ? 'GUARDANDO…' : isNew ? 'CREAR' : 'GUARDAR'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      <ConfirmModal
        open={deleteModal}
        title="Eliminar elemento"
        body={`¿Eliminar "${form?.label}"? Se eliminarán también todos sus sub-botones y archivos adjuntos.`}
        confirmLabel="Eliminar"
        confirmColor="#D93025"
        confirmDisabled={saving}
        onCancel={() => setDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}
