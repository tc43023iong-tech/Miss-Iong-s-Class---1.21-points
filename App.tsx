
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Student, ClassData, SortType, Action } from './types';
import { INITIAL_CLASSES, POSITIVE_ACTIONS, NEGATIVE_ACTIONS, POKEMON_COUNT, AUDIO_URLS, SCORING_RULES } from './constants';

const App: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [activeClassName, setActiveClassName] = useState<string>('');
  const [sortType, setSortType] = useState<SortType>(SortType.ID);
  
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  
  const [splashData, setSplashData] = useState<{
    names: string;
    actionLabel: string;
    pointsChange: string;
    isPositive: boolean;
    pokemonId?: number;
    id?: string;
    count: number;
    finalPoints?: number;
  } | null>(null);
  
  const [isRolling, setIsRolling] = useState(false);
  const [rolledStudent, setRolledStudent] = useState<Student | null>(null);
  const [drawnIds, setDrawnIds] = useState<Set<string>>(new Set());

  // Refs for audio to ensure they are pre-loaded and shared
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Pre-create and preload audio elements
    Object.entries(AUDIO_URLS).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audioRefs.current[key] = audio;
    });

    const saved = localStorage.getItem('poke_class_data');
    if (saved) {
      try {
        setClasses(JSON.parse(saved));
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) setActiveClassName(parsed[0].className);
      } catch (e) {
        initDefaultData();
      }
    } else {
      initDefaultData();
    }
  }, []);

  const initDefaultData = () => {
    const defaultData: ClassData[] = INITIAL_CLASSES.map(c => {
      let idCounter = 1;
      const students = c.students.map((name) => {
        if (idCounter === 16 && (c.name.includes('3B') || c.name.includes('三乙'))) {
           idCounter++;
        }
        const s = {
          id: (idCounter++).toString(),
          name,
          points: 0,
          plusCount: 0,
          minusCount: 0,
          pokemonId: Math.floor(Math.random() * POKEMON_COUNT) + 1
        };
        return s;
      });
      return { className: c.name, students };
    });
    setClasses(defaultData);
    if (defaultData.length > 0) setActiveClassName(defaultData[0].className);
  };

  const activeClass = useMemo(() => 
    classes.find(c => c.className === activeClassName), 
    [classes, activeClassName]
  );

  const sortedStudents = useMemo(() => {
    if (!activeClass) return [];
    const list = [...activeClass.students];
    switch (sortType) {
      case SortType.ID:
        return list.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      case SortType.SCORE_DESC:
        return list.sort((a, b) => b.points - a.points);
      case SortType.SCORE_ASC:
        return list.sort((a, b) => a.points - b.points);
      case SortType.NAME:
        return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-HK'));
      default:
        return list;
    }
  }, [activeClass, sortType]);

  const saveToLocal = (updated: ClassData[]) => {
    localStorage.setItem('poke_class_data', JSON.stringify(updated));
    setClasses(updated);
  };

  const updateStudents = (ids: string[], updates: Partial<Student> | ((s: Student) => Partial<Student>)) => {
    const newClasses = classes.map(c => {
      if (c.className === activeClassName) {
        return {
          ...c,
          students: c.students.map(s => {
            if (ids.includes(s.id)) {
              const u = typeof updates === 'function' ? updates(s) : updates;
              return { ...s, ...u };
            }
            return s;
          })
        };
      }
      return c;
    });
    saveToLocal(newClasses);
  };

  const unlockAudio = () => {
    (Object.values(audioRefs.current) as HTMLAudioElement[]).forEach(audio => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {});
    });
  };

  const playSound = (type: keyof typeof AUDIO_URLS) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.warn(`Audio ${type} blocked or failed:`, e);
      });
    }
  };

  const handleApplyAction = (action: Action | { points: number, text: string }, isPositive: boolean) => {
    unlockAudio();
    const idsToUpdate = isMultiSelectMode ? Array.from(selectedIds) : (selectedStudent ? [selectedStudent.id] : []);
    if (idsToUpdate.length === 0) return;
    
    const changeValue = 'points' in action ? action.points : 0;
    const actionText = 'textZh' in action ? action.textZh : (action as any).text;

    updateStudents(idsToUpdate, (s) => ({
      points: s.points + changeValue,
      plusCount: isPositive ? s.plusCount + Math.max(0, changeValue) : s.plusCount,
      minusCount: !isPositive ? s.minusCount + Math.abs(changeValue) : s.minusCount
    }));

    const firstStudent = activeClass?.students.find(s => s.id === idsToUpdate[0]);
    
    setSplashData({
      names: idsToUpdate.length > 1 ? `${firstStudent?.name} + ${idsToUpdate.length - 1} 位學生` : (firstStudent?.name || ''),
      pointsChange: `${changeValue >= 0 ? '+' : ''}${changeValue}`,
      actionLabel: actionText,
      isPositive: isPositive,
      pokemonId: firstStudent?.pokemonId,
      id: idsToUpdate.length === 1 ? firstStudent?.id : undefined,
      count: idsToUpdate.length,
      finalPoints: idsToUpdate.length === 1 ? (firstStudent ? firstStudent.points + changeValue : undefined) : undefined
    });

    // Bulk positive -> CLAP, single positive -> WIN, negative -> LOSE
    if (idsToUpdate.length > 1 && isPositive) {
      playSound('CLAP');
    } else {
      playSound(isPositive ? 'WIN' : 'LOSE');
    }
    
    // Exactly 1.5s splash duration
    setTimeout(() => setSplashData(null), 1500);
    setIsActionModalOpen(false);
    if (isMultiSelectMode) {
      setSelectedIds(new Set());
      setIsMultiSelectMode(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(classes, null, 2);
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Miss_Iong_Classes_${new Date().toLocaleDateString()}.txt`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        saveToLocal(imported);
        if (imported.length > 0) setActiveClassName(imported[0].className);
        alert('導入成功！');
      } catch (err) {
        alert('導入失敗，請確保文件格式正確。');
      }
    };
    reader.readAsText(file);
  };

  const startRolling = () => {
    if (!activeClass || activeClass.students.length === 0) return;
    unlockAudio();

    const pool = activeClass.students.filter(s => !drawnIds.has(s.id));
    const effectivePool = pool.length > 0 ? pool : activeClass.students;
    
    setIsRolling(true);
    setRolledStudent(null);

    // EXACTLY 1.5 seconds = 1500ms (100ms interval * 15 steps)
    let count = 0;
    const interval = setInterval(() => {
      const random = effectivePool[Math.floor(Math.random() * effectivePool.length)];
      setRolledStudent(random);
      playSound('ROLL');
      
      count++;
      if (count >= 15) {
        clearInterval(interval);
        setTimeout(() => {
          setIsRolling(false);
          playSound('CLAP'); // Applaud on selection
          setDrawnIds(prev => {
            const next = new Set(prev);
            next.add(random.id);
            if (next.size >= activeClass.students.length) return new Set([random.id]); 
            return next;
          });
          setSelectedStudent(random);
          setIsActionModalOpen(true);
        }, 300);
      }
    }, 100);
  };

  const toggleSelectAll = () => {
    if (!activeClass) return;
    if (selectedIds.size === activeClass.students.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(activeClass.students.map(s => s.id)));
    }
  };

  const handleManualApply = () => {
    const input = document.getElementById('manual-points') as HTMLInputElement;
    const val = parseInt(input.value);
    if (!isNaN(val)) {
      handleApplyAction({ points: val, text: '手動輸入' }, val >= 0);
      input.value = '';
    }
  };

  return (
    <div className="min-h-screen relative pb-10">
      <div className="firework-bg">
        <div className="firework" style={{ left: '15%', top: '20%', color: '#ffb7c5' }}></div>
        <div className="firework" style={{ left: '85%', top: '30%', color: '#bae1ff' }}></div>
        <div className="firework" style={{ left: '50%', top: '15%', color: '#ffffba' }}></div>
      </div>

      <header className="p-6 text-center">
        <h1 className="text-4xl md:text-5xl font-heading text-pink-600 drop-shadow-lg mb-4 uppercase tracking-wider">
          Miss Iong's Class / 容老師的教室
        </h1>
        <div className="flex flex-wrap justify-center gap-3">
          <select 
            className="bg-white px-4 py-2 rounded-full border-2 border-pink-300 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-400 text-pink-600"
            value={activeClassName}
            onChange={(e) => { setActiveClassName(e.target.value); setSelectedIds(new Set()); setDrawnIds(new Set()); }}
          >
            {classes.map(c => <option key={c.className} value={c.className}>{c.className}</option>)}
          </select>

          <div className="flex items-center gap-1">
            <button onClick={startRolling} className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-l-full font-bold shadow-md transform hover:scale-105 transition flex items-center gap-2">
              <i className="fas fa-dice"></i> 
              <span>隨機抽查 ({drawnIds.size}/{activeClass?.students.length})</span>
            </button>
            <button 
              onClick={() => setDrawnIds(new Set())} 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-r-full font-bold shadow-md transform hover:scale-105 transition"
              title="重置名單"
            >
              <i className="fas fa-redo"></i>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => { 
                if (isMultiSelectMode && selectedIds.size > 0) {
                  setIsActionModalOpen(true);
                } else {
                  setIsMultiSelectMode(!isMultiSelectMode);
                  if (isMultiSelectMode) setSelectedIds(new Set());
                }
              }} 
              className={`${isMultiSelectMode ? 'bg-purple-500' : 'bg-purple-400'} hover:bg-purple-600 text-white px-6 py-2 rounded-full font-bold shadow-md transform hover:scale-105 transition`}
            >
              <i className={`fas ${isMultiSelectMode ? 'fa-check-double' : 'fa-list-ul'} mr-2`}></i>
              {isMultiSelectMode ? (selectedIds.size > 0 ? `更新 (${selectedIds.size})` : '取消多選') : '批量選擇'}
            </button>
            <button 
              onClick={() => setIsRulesModalOpen(true)}
              className="bg-pink-100 hover:bg-pink-200 text-pink-600 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2 border-pink-200 transition"
              title="評分規則"
            >
              <i className="fas fa-bell"></i>
            </button>
          </div>

          <div className="flex gap-1">
            <button onClick={handleExport} className="bg-blue-400 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-md transform hover:scale-105 transition">
              <i className="fas fa-download mr-2"></i> 導出
            </button>
            <label className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-md transform hover:scale-105 transition cursor-pointer">
              <i className="fas fa-upload mr-2"></i> 導入
              <input type="file" className="hidden" accept=".txt" onChange={handleImport} />
            </label>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white/70 p-4 rounded-xl backdrop-blur-sm border-2 border-pink-100 shadow-sm gap-4">
          <div className="flex flex-wrap gap-2 items-center text-gray-700">
            <i className="fas fa-sort mr-1 text-pink-400"></i> 排序:
            <button onClick={() => setSortType(SortType.ID)} className={`px-3 py-1 rounded-lg text-sm font-bold transition ${sortType === SortType.ID ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-600'}`}>學號</button>
            <button onClick={() => setSortType(SortType.SCORE_DESC)} className={`px-3 py-1 rounded-lg text-sm font-bold transition ${sortType === SortType.SCORE_DESC ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-600'}`}>高到低</button>
            <button onClick={() => setSortType(SortType.SCORE_ASC)} className={`px-3 py-1 rounded-lg text-sm font-bold transition ${sortType === SortType.SCORE_ASC ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-600'}`}>低到高</button>
            <button onClick={() => setSortType(SortType.NAME)} className={`px-3 py-1 rounded-lg text-sm font-bold transition ${sortType === SortType.NAME ? 'bg-pink-400 text-white' : 'bg-pink-50 text-pink-600'}`}>姓名</button>
          </div>
          <div className="flex items-center gap-4">
            {isMultiSelectMode && (
              <button onClick={toggleSelectAll} className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-bold border border-purple-200 hover:bg-purple-200 transition">
                {selectedIds.size === activeClass?.students.length ? '取消全選' : '全選'}
              </button>
            )}
            <div className="text-gray-500 text-sm font-bold uppercase">
              學生人數: {activeClass?.students.length || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {sortedStudents.map((student, index) => {
            const isSelected = selectedIds.has(student.id);
            const rank = sortType === SortType.SCORE_DESC ? index + 1 : null;
            
            return (
              <div 
                key={student.id} 
                onClick={() => {
                  if (isMultiSelectMode) {
                    const next = new Set(selectedIds);
                    if (isSelected) next.delete(student.id);
                    else next.add(student.id);
                    setSelectedIds(next);
                  } else {
                    setSelectedStudent(student);
                    setIsActionModalOpen(true);
                  }
                }}
                className={`bg-white p-4 rounded-3xl border-b-8 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all cursor-pointer text-center flex flex-col items-center group relative ${isSelected ? 'border-purple-500 scale-105 ring-4 ring-purple-200' : 'border-pink-200'}`}
              >
                {rank && (
                  <div className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10 uppercase">
                    Rank #{rank}
                  </div>
                )}
                {isMultiSelectMode && (
                  <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'bg-purple-500 border-purple-500' : 'bg-white border-gray-300'}`}>
                    {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                  </div>
                )}
                <div className="relative mb-2">
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${student.pokemonId}.png`} alt="pokemon" className="w-24 h-24 object-contain" />
                  <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsPokemonModalOpen(true); }} className="absolute bottom-0 right-0 bg-white shadow-md w-8 h-8 rounded-full border border-pink-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><i className="fas fa-sync text-pink-400 text-xs"></i></button>
                </div>
                <div className="font-heading text-pink-500 text-sm mb-1">#{student.id}</div>
                <div className="font-bold text-gray-800 text-lg mb-2 truncate w-full px-2 uppercase">{student.name}</div>
                <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-bold mb-3"><i className="fas fa-star"></i> {student.points}</div>
                <div className="grid grid-cols-2 w-full gap-2 border-t border-pink-50 pt-2 text-xs">
                  <div className="flex flex-col items-center"><span className="text-green-500 font-bold text-sm">+{student.plusCount}</span><span className="text-gray-400 uppercase">Pos</span></div>
                  <div className="flex flex-col items-center"><span className="text-red-400 font-bold text-sm">-{student.minusCount}</span><span className="text-gray-400 uppercase">Neg</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Action Modal */}
      {isActionModalOpen && (selectedStudent || isMultiSelectMode) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 candy-gradient flex flex-col md:flex-row items-center gap-6 relative">
              <button onClick={() => setIsActionModalOpen(false)} className="absolute top-6 right-6 text-pink-600 text-2xl hover:scale-110 transition"><i className="fas fa-times"></i></button>
              {isMultiSelectMode ? (
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-purple-400 shadow-md">
                   <i className="fas fa-users text-purple-400 text-5xl"></i>
                </div>
              ) : (
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedStudent?.pokemonId}.png`} alt="pk" className="w-32 h-32 bg-white rounded-full p-2 border-4 border-pink-400 shadow-md" />
              )}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-heading text-pink-700 uppercase">{isMultiSelectMode ? `批量更新 (${selectedIds.size})` : selectedStudent?.name}</h2>
                {!isMultiSelectMode && <p className="text-pink-600 font-bold text-lg">學號: #{selectedStudent?.id} • 當前分數: {selectedStudent?.points}</p>}
                <div className="mt-4 flex items-center gap-3 bg-white/50 p-3 rounded-2xl border-2 border-pink-200">
                  <label className="font-bold text-pink-700 text-sm whitespace-nowrap uppercase">手動輸入:</label>
                  <input 
                    id="manual-points" 
                    type="number" 
                    placeholder="輸入分數..." 
                    onKeyDown={(e) => { if (e.key === 'Enter') handleManualApply(); }}
                    className="w-full bg-white px-3 py-1 rounded-lg border-2 border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400" 
                  />
                  <button onClick={handleManualApply} className="bg-pink-500 text-white px-4 py-1 rounded-lg font-bold hover:bg-pink-600 transition uppercase">應用</button>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 font-heading text-xl mb-4 border-b-4 border-green-100 pb-2 uppercase">⭐ 加分 / POSITIVE</div>
                {POSITIVE_ACTIONS.map((act, idx) => (
                  <button key={idx} onClick={() => handleApplyAction(act, true)} className="w-full group bg-green-50 hover:bg-green-500 hover:text-white p-4 rounded-2xl transition-all text-left flex items-center justify-between border-2 border-transparent hover:border-green-300 shadow-sm">
                    <div><div className="font-bold text-gray-800 group-hover:text-white">{act.textZh}</div><div className="text-xs text-gray-500 group-hover:text-green-100">{act.textEn}</div></div>
                    <span className="font-heading text-lg text-green-500 group-hover:text-white">+{act.points}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600 font-heading text-xl mb-4 border-b-4 border-red-100 pb-2 uppercase">⚠️ 減分 / NEGATIVE</div>
                {NEGATIVE_ACTIONS.map((act, idx) => (
                  <button key={idx} onClick={() => handleApplyAction(act, false)} className="w-full group bg-red-50 hover:bg-red-500 hover:text-white p-4 rounded-2xl transition-all text-left flex items-center justify-between border-2 border-transparent hover:border-red-300 shadow-sm">
                    <div><div className="font-bold text-gray-800 group-hover:text-white">{act.textZh}</div><div className="text-xs text-gray-500 group-hover:text-red-100">{act.textEn}</div></div>
                    <span className="font-heading text-lg text-red-500 group-hover:text-white">{act.points}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 relative">
            <button onClick={() => setIsRulesModalOpen(false)} className="absolute top-6 right-6 text-pink-600 text-2xl hover:scale-110 z-10"><i className="fas fa-times"></i></button>
            <div className="p-8 candy-gradient border-b-4 border-pink-200 text-center">
              <h2 className="text-3xl font-heading text-pink-700">默書/測驗/考試 加分細則</h2>
              <p className="text-pink-600 font-bold uppercase text-xs mt-1">Dictation / Test / Exam Rules</p>
            </div>
            <div className="p-8 space-y-4">
              {SCORING_RULES.map((rule, idx) => (
                <div key={idx} className="flex justify-between items-center bg-pink-50 p-4 rounded-2xl border-2 border-pink-100 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-700">{rule.labelZh}</span>
                    <span className="text-xs text-gray-400 font-bold uppercase">{rule.labelEn}</span>
                  </div>
                  <span className="text-2xl font-heading text-pink-500 uppercase">{rule.points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Splash Animation (Congratulation / Effort) */}
      {splashData && (
        <div className={`fixed inset-0 flex items-center justify-center z-[120] animate-in fade-in duration-300 ${splashData.isPositive ? 'bg-pink-400/95' : 'bg-red-300/95'}`}>
          {splashData.isPositive && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="firework" style={{ left: '15%', top: '25%', color: '#fff', animationDelay: '0s' }}></div>
                <div className="firework" style={{ left: '85%', top: '15%', color: '#fff', animationDelay: '0.4s' }}></div>
                <div className="firework" style={{ left: '30%', top: '75%', color: '#fff', animationDelay: '0.8s' }}></div>
                <div className="firework" style={{ left: '70%', top: '85%', color: '#fff', animationDelay: '1.2s' }}></div>
            </div>
          )}
          
          <div className="text-center p-12 bg-white/95 rounded-[60px] shadow-2xl max-w-2xl w-full border-8 border-white mx-4 flex flex-col items-center relative z-10 animate-in zoom-in-90 duration-300">
            <h1 className="text-5xl font-heading mb-6 drop-shadow-sm leading-tight uppercase">
              {splashData.isPositive ? (
                <span className="text-pink-600">CONGRATULATIONS!<br/>恭喜你！</span>
              ) : (
                <span className="text-red-600">KEEP WORKING HARD!<br/>繼續努力！</span>
              )}
            </h1>
            
            <div className="text-4xl font-bold text-gray-800 mb-2 uppercase tracking-tight">
                {splashData.id ? `#${splashData.id} ` : ''}{splashData.names}
            </div>
            
            <div className={`text-3xl font-bold mb-6 uppercase flex items-center gap-3 ${splashData.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                <span className="bg-current text-white px-3 py-1 rounded-xl">{splashData.pointsChange}</span>
                <span>{splashData.actionLabel}</span>
            </div>

            <div className="relative mb-8">
              {splashData.pokemonId ? (
                <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${splashData.pokemonId}.png`} alt="pk" className="w-56 h-56 drop-shadow-xl animate-bounce" />
              ) : (
                <div className="w-56 h-56 bg-pink-50 rounded-full flex items-center justify-center shadow-inner"><i className="fas fa-users text-pink-300 text-6xl"></i></div>
              )}
              {splashData.isPositive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <i className="fas fa-star text-yellow-400 text-4xl animate-ping absolute -top-4 -left-4"></i>
                  <i className="fas fa-star text-pink-400 text-4xl animate-ping absolute -top-4 -right-4" style={{ animationDelay: '0.5s' }}></i>
                </div>
              )}
            </div>
            
            {splashData.count === 1 && splashData.finalPoints !== undefined && (
                <div className="flex flex-col items-center bg-pink-50 px-10 py-5 rounded-full shadow-inner border-2 border-pink-200">
                  <span className="text-pink-400 text-sm font-bold uppercase tracking-widest mb-1">當前最新分數是</span>
                  <span className="text-pink-700 text-5xl font-heading tracking-tighter">{splashData.finalPoints}</span>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Random Picker Animation */}
      {isRolling && rolledStudent && (
        <div className="fixed inset-0 bg-pink-500/95 flex items-center justify-center z-[110] transition-opacity">
          <div className="text-center p-12 bg-white rounded-[60px] shadow-2xl border-8 border-yellow-400 relative animate-in zoom-in-95">
             <div className="absolute top-6 right-10 font-heading text-pink-500 text-2xl">
                ({drawnIds.size + 1}/{activeClass?.students.length})
             </div>
            <h2 className="text-4xl font-heading text-pink-600 mb-8 animate-pulse uppercase tracking-widest">WHO WILL BE NEXT?<br/>下一個是誰呢？</h2>
            <div className="flex flex-col items-center justify-center shake">
              <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${rolledStudent.pokemonId}.png`} alt="picker" className="w-64 h-64 object-contain mb-4 drop-shadow-lg" />
              <div className="text-5xl font-heading text-gray-800 uppercase tracking-tight">{rolledStudent.name}</div>
              <div className="text-pink-400 font-bold mt-2 text-xl">學號: #{rolledStudent.id}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
