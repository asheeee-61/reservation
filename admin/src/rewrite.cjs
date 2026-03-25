const fs = require('fs');
const path = require('path');

/* --- Settings.jsx --- */
let settingsPath = path.join(__dirname, 'pages', 'Settings.jsx');
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

const toMinutesSettings = `
  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
`;

// Insert the helper at the top of the component
settingsContent = settingsContent.replace('export default function Settings() {', 'export default function Settings() {' + toMinutesSettings);

// Replace handleSaveGlobalHours conflict check
const oldConflictLogic = `      const gOpen = Number(localGlobal.openingTime.replace(':', ''));
      const gClose = Number(localGlobal.closingTime.replace(':', ''));
      const adjustedGClose = gClose === 0 ? 2400 : gClose;

      Object.keys(config.schedule).forEach(day => {
        const dayConfig = config.schedule[day];
        if (dayConfig.shifts) {
          dayConfig.shifts.forEach((shift, idx) => {
            const sOpen = Number(shift.openingTime.replace(':', ''));
            let sClose = Number(shift.closingTime.replace(':', ''));
            if (sClose === 0) sClose = 2400;

            if (sOpen < gOpen || sClose > adjustedGClose || sClose < sOpen) {
              newConflicts.push({ day, shiftId: shift.id, text: \`\${DAY_LABELS[day]} Turno \${idx + 1}: \${shift.openingTime} – \${shift.closingTime}\` });
            }
          });
        }
      });`;

const newConflictLogic = `      const gOpenMins = toMinutes(localGlobal.openingTime);
      let gCloseMins = toMinutes(localGlobal.closingTime);
      if (gCloseMins <= gOpenMins) gCloseMins += 1440;

      Object.keys(config.schedule).forEach(day => {
        const dayConfig = config.schedule[day];
        if (dayConfig.shifts) {
          dayConfig.shifts.forEach((shift, idx) => {
            const sOpenMins = toMinutes(shift.openingTime);
            let sCloseMins = toMinutes(shift.closingTime);
            if (sCloseMins <= sOpenMins) sCloseMins += 1440;

            if (sOpenMins < gOpenMins || sCloseMins > gCloseMins) {
              const suffix = toMinutes(shift.closingTime) <= toMinutes(shift.openingTime) ? ' (+1)' : '';
              newConflicts.push({ day, shiftId: shift.id, text: \`\${DAY_LABELS[day]} Turno \${idx + 1}: \${shift.openingTime} – \${shift.closingTime}\${suffix}\` });
            }
          });
        }
      });`;
settingsContent = settingsContent.replace(oldConflictLogic, newConflictLogic);

// Replace the closingTime dropdown in Settings.jsx
const oldClosingDrop = `                {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            {Number(localGlobal.closingTime.replace(':', '')) !== 0 && Number(localGlobal.closingTime.replace(':', '')) <= Number(localGlobal.openingTime.replace(':', '')) && (
              <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#D93025', mt: '4px', position: { sm: 'absolute' } }}>
                El cierre debe ser posterior a la apertura
              </Typography>
            )}`;

const newClosingDrop = `                {TIME_OPTIONS.map(t => {
                  const isNextDay = toMinutes(t) <= toMinutes(localGlobal.openingTime);
                  return (
                    <MenuItem key={t} value={t}>
                      {t} {isNextDay && <span style={{ fontSize: '12px', color: '#70757A', marginLeft: '4px' }}>(+1)</span>}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            {(() => {
              let cMins = toMinutes(localGlobal.closingTime);
              if (cMins <= toMinutes(localGlobal.openingTime)) cMins += 1440;
              const span = cMins - toMinutes(localGlobal.openingTime);
              if (span < 60) {
                return (
                  <Typography sx={{ fontFamily: 'Roboto', fontSize: '12px', color: '#D93025', mt: '4px', position: { sm: 'absolute' } }}>
                    El horario debe abarcar al menos 1 hora
                  </Typography>
                );
              }
              return null;
            })()}`;
settingsContent = settingsContent.replace(oldClosingDrop, newClosingDrop);

// Update save disabled logic
const oldSaveBtn = `disabled={savingGlobal || (Number(localGlobal.closingTime.replace(':', '')) !== 0 && Number(localGlobal.closingTime.replace(':', '')) <= Number(localGlobal.openingTime.replace(':', '')))}`;
const newSaveBtn = `disabled={savingGlobal || (() => { let c = toMinutes(localGlobal.closingTime); if (c <= toMinutes(localGlobal.openingTime)) c += 1440; return (c - toMinutes(localGlobal.openingTime)) < 60; })()}`;
settingsContent = settingsContent.replace(oldSaveBtn, newSaveBtn);

// Update info text
const oldInfoText = `Los turnos en el calendario no podrán configurarse fuera de este horario.`;
const newInfoText = `Horario permitido: \${localGlobal.openingTime} – \${localGlobal.closingTime}\${toMinutes(localGlobal.closingTime) <= toMinutes(localGlobal.openingTime) ? ' (+1)' : ''}`;
settingsContent = settingsContent.replace("Los turnos en el calendario no podrán configurarse fuera de este horario.", `Horario permitido: {localGlobal.openingTime} – {localGlobal.closingTime} {toMinutes(localGlobal.closingTime) <= toMinutes(localGlobal.openingTime) ? '(+1)' : ''}`);

fs.writeFileSync(settingsPath, settingsContent);


/* --- CalendarPanel.jsx --- */
let calPath = path.join(__dirname, 'pages', 'CalendarPanel.jsx');
let calContent = fs.readFileSync(calPath, 'utf8');

const helpers = `
  const toMinutes = (time) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };
  const toTimeString = (minutes) => {
    const normalized = minutes % 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
  };
`;

calContent = calContent.replace('export default function CalendarPanel() {', 'export default function CalendarPanel() {' + helpers);

// fix save manual
const oldManualSave = `        const [oH, oM] = shift.openingTime.split(':').map(Number);
        const [cH, cM] = shift.closingTime.split(':').map(Number);
        if (cH * 60 + cM <= oH * 60 + oM) {
          setToastMessage(\`El turno en \${DAY_LABELS[day]} tiene horas inválidas.\`);
          setToastOpen(true);
          return;
        }
      }
      if (shifts.length === 2) {
        const c1 = Number(shifts[0].closingTime.split(':')[0]) * 60 + Number(shifts[0].closingTime.split(':')[1]);
        const o2 = Number(shifts[1].openingTime.split(':')[0]) * 60 + Number(shifts[1].openingTime.split(':')[1]);
        if (o2 <= c1) {
          setToastMessage(\`Hay turnos solapados en \${DAY_LABELS[day]}. Corrígelos antes de guardar.\`);`;

const newManualSave = `        const oMins = toMinutes(shift.openingTime);
        let cMins = toMinutes(shift.closingTime);
        if (cMins <= oMins) cMins += 1440;
        if (cMins - oMins < 30) {
          setToastMessage(\`El turno en \${DAY_LABELS[day]} debe durar al menos 30 minutos.\`);
          setToastOpen(true);
          return;
        }
      }
      if (shifts.length === 2) {
        let s1Open  = toMinutes(shifts[0].openingTime);
        let s1Close = toMinutes(shifts[0].closingTime);
        let s2Open  = toMinutes(shifts[1].openingTime);
        let s2Close = toMinutes(shifts[1].closingTime);

        if (s1Close <= s1Open) s1Close += 1440;
        if (s2Close <= s2Open) s2Close += 1440;
        if (s2Open < s1Open) { s2Open += 1440; s2Close += 1440; }

        if (s2Open < s1Close) {
          setToastMessage(\`Hay turnos solapados en \${DAY_LABELS[day]}. Corrígelos antes de guardar.\`);`;

calContent = calContent.replace(oldManualSave, newManualSave);

// Handle regenerating slots tab 2
const oldHandleGen = `      const [openH, openM] = shift.openingTime.split(':').map(Number);
      const [closeH, closeM] = shift.closingTime.split(':').map(Number);
      const openMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;
      
      const newSlots = {};
      for (let t = openMin; t <= closeMin; t += shift.interval) {
        const h = String(Math.floor(t / 60)).padStart(2, '0');
        const m = String(t % 60).padStart(2, '0');
        newSlots[\`\${h}:\${m}\`] = true;
      }`;
const newHandleGen = `      const openMin = toMinutes(shift.openingTime);
      let closeMin = toMinutes(shift.closingTime);
      if (closeMin <= openMin) closeMin += 1440;
      
      const newSlots = {};
      for (let t = openMin; t <= closeMin; t += shift.interval) {
        newSlots[toTimeString(t)] = true;
      }`;
calContent = calContent.replace(oldHandleGen, newHandleGen);

// Handle regenerate Monday
const oldGenMon = `      const [openH, openM] = shift.openingTime.split(':').map(Number);
      const [closeH, closeM] = shift.closingTime.split(':').map(Number);
      const openMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;
      const newSlots = {};
      for (let t = openMin; t <= closeMin; t += shift.interval) {
        const h = String(Math.floor(t / 60)).padStart(2, '0');
        const m = String(t % 60).padStart(2, '0');
        newSlots[\`\${h}:\${m}\`] = true;
      }`;
const newGenMon = `      const openMin = toMinutes(shift.openingTime);
      let closeMin = toMinutes(shift.closingTime);
      if (closeMin <= openMin) closeMin += 1440;
      const newSlots = {};
      for (let t = openMin; t <= closeMin; t += shift.interval) {
        newSlots[toTimeString(t)] = true;
      }`;
calContent = calContent.replace(oldGenMon, newGenMon);

// Summary ranges TAB 2
const oldRanges = `const summaryRanges = dayConfig.shifts.map(s => \`\${s.openingTime}–\${s.closingTime}\`).join(' · ');`;
const newRanges = `const summaryRanges = dayConfig.shifts.map(s => \`\${s.openingTime}–\${s.closingTime}\${toMinutes(s.closingTime) <= toMinutes(s.openingTime) ? ' (+1)' : ''}\`).join(' · ');`;
calContent = calContent.replace(oldRanges, newRanges);

// overlap check
const oldOverlap = `const hasOverlap = dayConfig.shifts.length === 2 && (() => {
                const c1 = Number(dayConfig.shifts[0].closingTime.split(':')[0]) * 60 + Number(dayConfig.shifts[0].closingTime.split(':')[1]);
                const o2 = Number(dayConfig.shifts[1].openingTime.split(':')[0]) * 60 + Number(dayConfig.shifts[1].openingTime.split(':')[1]);
                return o2 <= c1;
              })();`;
const newOverlap = `const hasOverlap = dayConfig.shifts.length === 2 && (() => {
                  let s1Open  = toMinutes(dayConfig.shifts[0].openingTime);
                  let s1Close = toMinutes(dayConfig.shifts[0].closingTime);
                  let s2Open  = toMinutes(dayConfig.shifts[1].openingTime);
                  let s2Close = toMinutes(dayConfig.shifts[1].closingTime);

                  if (s1Close <= s1Open) s1Close += 1440;
                  if (s2Close <= s2Open) s2Close += 1440;
                  if (s2Open < s1Open) { s2Open += 1440; s2Close += 1440; }

                  return s2Open < s1Close;
              })();`;
calContent = calContent.replace(oldOverlap, newOverlap);

// isValid shift
const oldIsValid = `                          const [oH, oM] = shift.openingTime.split(':').map(Number);
                          const [cH, cM] = shift.closingTime.split(':').map(Number);
                          const isValid = (cH * 60 + cM) > (oH * 60 + oM);`;
const newIsValid = `                          const oMins = toMinutes(shift.openingTime);
                          let cMins = toMinutes(shift.closingTime);
                          if (cMins <= oMins) cMins += 1440;
                          const isValid = (cMins - oMins) >= 30;`;
calContent = calContent.replace(oldIsValid, newIsValid);


const oldTurno1 = `<Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', color: '#70757A' }}>Turno {idx + 1}</Typography>`;
const newTurno1 = `<Typography sx={{ fontFamily: 'Roboto', fontWeight: 500, fontSize: '13px', color: '#70757A' }}>Turno {idx + 1} &nbsp;&nbsp; {shift.openingTime} – {shift.closingTime} <span style={{fontSize: '11px'}}>{toMinutes(shift.closingTime) <= toMinutes(shift.openingTime) ? '(+1)' : ''}</span></Typography>`;
calContent = calContent.replace(oldTurno1, newTurno1);

const oldTurnoTab1 = `Turno {idx + 1} ({shift.openingTime} – {shift.closingTime})`;
const newTurnoTab1 = `Turno {idx + 1} ({shift.openingTime} – {shift.closingTime} {toMinutes(shift.closingTime) <= toMinutes(shift.openingTime) ? '(+1)' : ''})`;
calContent = calContent.replace(oldTurnoTab1, newTurnoTab1);

const oldDropOpen = `                                        {TIME_OPTIONS.filter(t => {
                                          const tNum = Number(t.replace(':', ''));
                                          const gOpen = Number(globalHours.openingTime.replace(':', ''));
                                          let gClose = Number(globalHours.closingTime.replace(':', ''));
                                          if (gClose === 0) gClose = 2400;
                                          return tNum >= gOpen && tNum < gClose;
                                        }).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}`;
const newDropOpen = `                                        {TIME_OPTIONS.filter(t => {
                                          const tMins = toMinutes(t);
                                          const gOpenMins = toMinutes(globalHours.openingTime);
                                          let gCloseMins = toMinutes(globalHours.closingTime);
                                          if (gCloseMins <= gOpenMins) gCloseMins += 1440;
                                          let effT = tMins;
                                          if (tMins < gOpenMins) effT += 1440;
                                          return effT >= gOpenMins && effT < gCloseMins;
                                        }).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}`;
calContent = calContent.replace(oldDropOpen, newDropOpen);

const oldDropClose = `                                        {TIME_OPTIONS.filter(t => {
                                          const tNum = Number(t.replace(':', ''));
                                          const sOpen = Number(shift.openingTime.replace(':', ''));
                                          let gClose = Number(globalHours.closingTime.replace(':', ''));
                                          if (gClose === 0) gClose = 2400;
                                          return (tNum === 0 ? 2400 : tNum) > sOpen && (tNum === 0 ? 2400 : tNum) <= gClose;
                                        }).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}`;
const newDropClose = `                                        {TIME_OPTIONS.map(t => {
                                          const tMins = toMinutes(t);
                                          const sOpenMins = toMinutes(shift.openingTime);
                                          const isNextDay = tMins <= sOpenMins;
                                          return (
                                            <MenuItem key={t} value={t}>
                                              {t} {isNextDay && <span style={{ fontSize: '12px', color: '#70757A', marginLeft: '4px' }}>(+1)</span>}
                                            </MenuItem>
                                          );
                                        })}`;
calContent = calContent.replace(oldDropClose, newDropClose);

const oldAllowedConfig = `Horario permitido: {globalHours.openingTime} – {globalHours.closingTime}`;
const newAllowedConfig = `Horario permitido: {globalHours.openingTime} – {globalHours.closingTime} {toMinutes(globalHours.closingTime) <= toMinutes(globalHours.openingTime) ? '(+1)' : ''}`;
calContent = calContent.replace(oldAllowedConfig, newAllowedConfig);

fs.writeFileSync(calPath, calContent);
console.log('REWRITE SUCCESS');
