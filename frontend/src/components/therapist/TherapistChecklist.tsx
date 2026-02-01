import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X,
  ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskTag = 'before-session' | 'after-session' | 'admin' | null;

interface Task {
  id: string;
  text: string;
  completed: boolean;
  tag: TaskTag;
}

const tagLabels: Record<Exclude<TaskTag, null>, string> = {
  'before-session': 'Before session',
  'after-session': 'After session',
  'admin': 'Admin'
};

const tagStyles: Record<Exclude<TaskTag, null>, string> = {
  'before-session': 'bg-primary/8 text-primary/80 border-primary/15',
  'after-session': 'bg-success/8 text-success/80 border-success/15',
  'admin': 'bg-muted/50 text-muted-foreground border-border/50'
};

const initialTasks: Task[] = [
  { id: '1', text: 'Review briefing pack for Anxiety Support Circle', completed: false, tag: 'before-session' },
  { id: '2', text: 'Write follow-up notes from last session', completed: false, tag: 'after-session' },
  { id: '3', text: 'Prepare grounding exercise', completed: false, tag: 'before-session' },
];

export function TherapistChecklist() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskTag, setNewTaskTag] = useState<TaskTag>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
      tag: newTaskTag
    };
    setTasks([...tasks, task]);
    setNewTaskText('');
    setNewTaskTag(null);
    setIsAdding(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, text: editText.trim() } : t
    ));
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <ListTodo className="w-4 h-4" />
            Your Tasks
            <span className="text-xs font-normal text-muted-foreground/60">
              ({incompleteTasks.length} remaining)
            </span>
          </CardTitle>
          {!isAdding && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs text-muted-foreground hover:text-primary"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add task
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-1 pb-4">
        {/* Add new task inline */}
        {isAdding && (
          <div className="space-y-2 p-3 mb-2 bg-muted/30 rounded-lg border border-border/30">
            <Input
              placeholder="What do you need to do?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              className="h-8 text-sm border-border/50 bg-background"
              autoFocus
            />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Tag:</span>
              {(Object.keys(tagLabels) as Exclude<TaskTag, null>[]).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setNewTaskTag(newTaskTag === tag ? null : tag)}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border transition-all",
                    newTaskTag === tag 
                      ? tagStyles[tag]
                      : "bg-transparent text-muted-foreground/70 border-border/50 hover:border-primary/40"
                  )}
                >
                  {tagLabels[tag]}
                </button>
              ))}
              <div className="flex-1" />
              <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-6 text-xs px-3" onClick={addTask} disabled={!newTaskText.trim()}>
                Add task
              </Button>
            </div>
          </div>
        )}

        {/* Incomplete tasks */}
        {incompleteTasks.length === 0 && completedTasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tasks yet. Add one to stay organized.
          </p>
        )}

        {incompleteTasks.map((task) => (
          <div 
            key={task.id} 
            className="group flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors"
          >
            <Checkbox 
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              className="mt-0.5 border-border/60"
            />
            <div className="flex-1 min-w-0">
              {editingId === task.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(task.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="h-7 text-sm flex-1"
                    autoFocus
                  />
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => saveEdit(task.id)}>
                    <Check className="w-3.5 h-3.5 text-success" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={cancelEdit}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-foreground/90">{task.text}</span>
                  {task.tag && (
                    <Badge variant="outline" className={cn("text-[9px] h-4 px-1.5 font-normal rounded-full", tagStyles[task.tag])}>
                      {tagLabels[task.tag]}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {editingId !== task.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => startEdit(task)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Completed tasks (faded) */}
        {completedTasks.length > 0 && (
          <div className="pt-3 mt-2 border-t border-border/20 space-y-0.5">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50 mb-2 px-3">Completed</p>
            {completedTasks.map((task) => (
              <div 
                key={task.id} 
                className="group flex items-center gap-3 py-1.5 px-3 rounded-lg opacity-40 hover:opacity-60 transition-opacity"
              >
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                  className="border-muted-foreground/30"
                />
                <span className="text-sm text-muted-foreground line-through flex-1">{task.text}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
