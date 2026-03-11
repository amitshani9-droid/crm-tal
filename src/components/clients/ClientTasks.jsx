import React, { useEffect } from 'react';
import { CheckCircle, Circle, Plus, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '../../hooks/useTasks';

function ClientTasks({ clientId }) {
    const { tasks, isLoading, fetchTasks, addTask, toggleTask, deleteTask } = useTasks(clientId);
    const [newTaskTitle, setNewTaskTitle] = React.useState('');

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        await addTask(newTaskTitle);
        setNewTaskTitle('');
    };

    return (
        <div className="form-section client-tasks" style={{ marginTop: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <span className="icon">✅</span> משימות ומעקב
            </h3>

            <div className="task-input-area" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    className="glass-input"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="הוסף משימה חדשה..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    style={{ flex: 1 }}
                />
                <button 
                    onClick={handleAddTask} 
                    disabled={!newTaskTitle.trim()}
                    className="btn-primary"
                    style={{ padding: '0 15px' }}
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {isLoading ? (
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>טוען משימות...</div>
                ) : (
                    <AnimatePresence>
                        {tasks.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>אין משימות פתוחות...</p>
                        ) : (
                            tasks.map(task => (
                                <motion.div 
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="task-item glass-card"
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        padding: '12px 15px',
                                        background: task.completed ? 'rgba(16, 185, 129, 0.05)' : 'var(--clr-glass-bg)',
                                        borderColor: task.completed ? '#10b981' : 'var(--clr-glass-border)',
                                        opacity: task.completed ? 0.7 : 1
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }} onClick={() => toggleTask(task)}>
                                        {task.completed ? (
                                            <CheckCircle size={20} color="#10b981" />
                                        ) : (
                                            <Circle size={20} color="#64748b" />
                                        )}
                                        <span style={{ 
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                            color: task.completed ? '#64748b' : 'inherit',
                                            fontWeight: 500
                                        }}>
                                            {task.title}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}

export default ClientTasks;
