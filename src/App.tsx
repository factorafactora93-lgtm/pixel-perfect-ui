import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  StickyNote, 
  Settings, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Search,
  ChevronRight,
  Menu,
  Bell,
  LogOut,
  Calendar,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

import { storage, STORAGE_KEYS, Task, Note } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// --- Components ---

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'لوحة التحكم', icon: LayoutDashboard, path: '/' },
    { name: 'المهام', icon: CheckSquare, path: '/tasks' },
    { name: 'الملاحظات', icon: StickyNote, path: '/notes' },
    { name: 'الإعدادات', icon: Settings, path: '/settings' },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      />
      <aside 
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-card border-l transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        dir="rtl"
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <img src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/844fee38-c8fd-489f-a611-6bd48e94c767/app-logo-0b79ebaa-1781516545021.webp" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="font-bold text-xl tracking-tight">نظّمني</span>
          </div>
          
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => isOpen && toggle()}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground font-medium' 
                      : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="bg-accent/50 rounded-xl p-4 flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-background">
                <AvatarImage src="https://storage.googleapis.com/dala-prod-public-storage/generated-images/844fee38-c8fd-489f-a611-6bd48e94c767/user-avatar-ea9bcde3-1781516546111.webp" />
                <AvatarFallback>م</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">محمد أحمد</p>
                <p className="text-xs text-muted-foreground truncate">الخطة المجانية</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between" dir="rtl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
          <Menu size={24} />
        </Button>
        <div className="relative max-w-md hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="بحث عن مهام أو ملاحظات..." className="pr-10 bg-accent/30 border-none focus-visible:ring-1" />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-2 left-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>
        <Button variant="ghost" size="icon">
          <LogOut size={20} className="text-muted-foreground" />
        </Button>
      </div>
    </header>
  );
};

// --- Views ---

const Dashboard = ({ tasks, notes }: { tasks: Task[]; notes: Note[] }) => {
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const recentNotes = notes.slice(0, 3);
  
  const stats = [
    { label: 'إجمالي المهام', value: tasks.length, icon: CheckSquare, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'المهام المعلقة', value: pendingTasks, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'الملاحظات', value: notes.length, icon: StickyNote, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'نسبة الإنجاز', value: tasks.length ? `${Math.round((completedTasks/tasks.length)*100)}%` : '0%', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">أهلاً بك، محمد! 👋</h1>
        <p className="text-muted-foreground mt-1">إليك ملخص لنشاطك اليوم وما يجب القيام به.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden relative">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.color.replace('text', 'bg')}`} />
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon size={24} className={stat.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>المهام القادمة</CardTitle>
              <CardDescription>المهام ذات الأولوية العالية والمواعيد القريبة.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/tasks">عرض الكل</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(t => !t.completed).slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-accent/10 hover:bg-accent/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-destructive' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.dueDate || 'بدون موعد'}</p>
                  </div>
                </div>
                <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 h-5">
                  {task.priority === 'high' ? 'مهم جداً' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                </Badge>
              </div>
            ))}
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-4">
                  <CheckCircle2 className="text-muted-foreground" size={24} />
                </div>
                <p className="text-muted-foreground">لا يوجد مهام حالياً. استمتع بوقتك!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>آخر الملاحظات</CardTitle>
            <CardDescription>أفكارك المدونة مؤخراً.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotes.map(note => (
              <div key={note.id} className="p-4 rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer">
                <h4 className="font-bold text-sm mb-1">{note.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{note.content}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{note.category}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(note.updatedAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">لم تضف أي ملاحظات بعد.</p>
              </div>
            )}
            <Button variant="ghost" className="w-full text-sm text-primary" asChild>
              <Link to="/notes">اكتشف المزيد <ChevronRight size={14} className="mr-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const TasksView = ({ tasks, onAddTask, onToggleTask, onDeleteTask }: { 
  tasks: Task[]; 
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    onAddTask({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      dueDate: newDueDate,
      completed: false
    });
    
    setNewTitle('');
    setNewDesc('');
    setNewPriority('medium');
    setNewDueDate('');
    setIsAddOpen(false);
    toast.success('تمت إضافة المهمة بنجاح');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">المهام</h1>
          <p className="text-muted-foreground mt-1">نظم وقتك وأنجز المزيد من المهام اليوم.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} />
              <span>إضافة مهمة جديدة</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>إضافة مهمة جديدة</DialogTitle>
                <DialogDescription>أدخل تفاصيل المهمة التي تود جدولتها.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">عنوان المهمة</Label>
                  <Input id="title" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="مثلاً: شراء بقالة..." required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="desc">الوصف (اختياري)</Label>
                  <Textarea id="desc" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="تفاصيل إضافية..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">الأولوية</Label>
                    <Select value={newPriority} onValueChange={(val: any) => setNewPriority(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">عادي</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="high">مهم جداً</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="date">التاريخ</Label>
                    <Input id="date" type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full">حفظ المهمة</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={filter === 'all' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>الكل</Button>
        <Button variant={filter === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('pending')}>قيد التنفيذ</Button>
        <Button variant={filter === 'completed' ? 'secondary' : 'ghost'} size="sm" onClick={() => setFilter('completed')}>المكتملة</Button>
      </div>

      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map(task => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center justify-between p-4 rounded-xl border bg-card transition-all hover:shadow-sm ${task.completed ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className={`flex-shrink-0 transition-colors ${task.completed ? 'text-green-500' : 'text-muted-foreground'}`}
                >
                  {task.completed ? <CheckCircle2 size={24} fill="currentColor" className="text-white" /> : <Circle size={24} />}
                </button>
                <div>
                  <h3 className={`font-semibold transition-all ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {task.dueDate || 'لا يوجد موعد'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      task.priority === 'high' ? 'bg-destructive/10 text-destructive' : 
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all"
                onClick={() => {
                  onDeleteTask(task.id);
                  toast.error('تم حذف المهمة');
                }}
              >
                <Trash2 size={18} />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-accent/5 rounded-2xl border border-dashed">
            <CheckSquare className="text-muted-foreground/30 mb-4" size={48} />
            <p className="text-muted-foreground font-medium">لا توجد مهام مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

const NotesView = ({ notes, onAddNote, onDeleteNote }: { 
  notes: Note[]; 
  onAddNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void;
  onDeleteNote: (id: string) => void;
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('عام');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    
    onAddNote({
      title: newTitle,
      content: newContent,
      category: newCategory
    });
    
    setNewTitle('');
    setNewContent('');
    setNewCategory('عام');
    setIsAddOpen(false);
    toast.success('تم حفظ الملاحظة');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الملاحظات</h1>
          <p className="text-muted-foreground mt-1">سجل أفكارك وخواطرك في مكان واحد آمن.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus size={18} />
              <span>ملاحظة جديدة</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>إنشاء ملاحظة جديدة</DialogTitle>
                <DialogDescription>دون أفكارك هنا، سيتم حفظها تلقائياً.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="note-title">العنوان</Label>
                  <Input id="note-title" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="مثلاً: أفكار للمشروع القادم..." required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">التصنيف</Label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عام">عام</SelectItem>
                      <SelectItem value="عمل">عمل</SelectItem>
                      <SelectItem value="شخصي">شخصي</SelectItem>
                      <SelectItem value="دراسة">دراسة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">المحتوى</Label>
                  <Textarea id="content" value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="اكتب ملاحظتك هنا..." className="min-h-[150px]" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">حفظ الملاحظة</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {notes.map(note => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative"
            >
              <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="h-1 w-full bg-purple-500/20 group-hover:bg-purple-500 transition-colors" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-[10px] font-normal">{note.category}</Badge>
                    <button 
                      onClick={() => onDeleteNote(note.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                </CardContent>
                <CardFooter className="pt-0 pb-4 flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(note.updatedAt).toLocaleDateString('ar-EG')}
                  </span>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {notes.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
            <StickyNote size={64} className="mb-4" />
            <p className="text-xl font-medium">لا توجد ملاحظات حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- App Content with Logic ---

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // Load initial data
  useEffect(() => {
    const savedTasks = storage.get<Task[]>(STORAGE_KEYS.TASKS, []);
    const savedNotes = storage.get<Note[]>(STORAGE_KEYS.NOTES, []);
    setTasks(savedTasks);
    setNotes(savedNotes);
  }, []);

  // Persist tasks
  useEffect(() => {
    storage.set(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  // Persist notes
  useEffect(() => {
    storage.set(STORAGE_KEYS.NOTES, notes);
  }, [notes]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addNote = (noteData: Omit<Note, 'id' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Math.random().toString(36).substr(2, 9),
      updatedAt: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-accent/20 flex font-sans selection:bg-primary/20" dir="rtl">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard tasks={tasks} notes={notes} />} />
              <Route path="/tasks" element={<TasksView tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} />} />
              <Route path="/notes" element={<NotesView notes={notes} onAddNote={addNote} onDeleteNote={deleteNote} />} />
              <Route path="/settings" element={
                <div className="flex flex-col items-center justify-center h-[60vh]" dir="rtl">
                  <Settings size={48} className="text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-bold">الإعدادات</h2>
                  <p className="text-muted-foreground">هذه الصفحة ستكون متاحة قريباً.</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
      
      <Toaster position="bottom-left" closeButton richColors dir="rtl" />
    </div>
  );
}

// --- Main App Entry ---

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
