import { useState } from 'react';
import { TherapistLayout } from '@/components/layouts/TherapistLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  FileText, 
  Video, 
  Activity, 
  BookOpen,
  Send,
  Filter,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Resource {
  id: string;
  name: string;
  description: string;
  type: 'worksheet' | 'video' | 'exercise' | 'article';
  tags: string[];
  assignedCount: number;
}

const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Deep Breathing Exercise',
    description: 'A guided 5-minute breathing exercise to reduce acute anxiety and stress.',
    type: 'exercise',
    tags: ['anxiety', 'stress', 'beginner'],
    assignedCount: 24,
  },
  {
    id: '2',
    name: 'Sleep Hygiene Checklist',
    description: 'Daily habits and environment tips for better sleep quality.',
    type: 'worksheet',
    tags: ['sleep', 'habits', 'self-care'],
    assignedCount: 18,
  },
  {
    id: '3',
    name: 'Understanding Your Triggers',
    description: 'Video explaining how to identify and manage emotional triggers.',
    type: 'video',
    tags: ['anxiety', 'emotions', 'awareness'],
    assignedCount: 31,
  },
  {
    id: '4',
    name: 'Thought Record Worksheet',
    description: 'CBT-based worksheet for challenging negative thought patterns.',
    type: 'worksheet',
    tags: ['cbt', 'depression', 'thoughts'],
    assignedCount: 45,
  },
  {
    id: '5',
    name: 'Progressive Muscle Relaxation',
    description: 'Step-by-step guide to full body relaxation technique.',
    type: 'exercise',
    tags: ['stress', 'relaxation', 'body'],
    assignedCount: 22,
  },
  {
    id: '6',
    name: 'Grief Processing Guide',
    description: 'Article on understanding the stages and non-linear nature of grief.',
    type: 'article',
    tags: ['grief', 'loss', 'healing'],
    assignedCount: 12,
  },
  {
    id: '7',
    name: 'Mindful Walking Exercise',
    description: 'A grounding exercise combining movement with mindfulness.',
    type: 'exercise',
    tags: ['mindfulness', 'grounding', 'movement'],
    assignedCount: 15,
  },
  {
    id: '8',
    name: 'Communication Skills Video',
    description: 'Learn assertive communication techniques for workplace settings.',
    type: 'video',
    tags: ['communication', 'workplace', 'assertiveness'],
    assignedCount: 28,
  },
];

const typeIcons = {
  worksheet: FileText,
  video: Video,
  exercise: Activity,
  article: BookOpen,
};

const typeColors = {
  worksheet: 'bg-blue-500/10 text-blue-600',
  video: 'bg-purple-500/10 text-purple-600',
  exercise: 'bg-green-500/10 text-green-600',
  article: 'bg-orange-500/10 text-orange-600',
};

export default function ResourceLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [resources, setResources] = useState(mockResources);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const handleAssign = (resource: Resource) => {
    setSelectedResource(resource);
    setAssignDialogOpen(true);
  };

  const confirmAssign = () => {
    toast.success(`"${selectedResource?.name}" assigned to client`);
    setAssignDialogOpen(false);
    setSelectedResource(null);
  };

  const handleAddResource = () => {
    toast.success('Resource added successfully');
    setAddDialogOpen(false);
  };

  return (
    <TherapistLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Resource Library</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Therapy resources to assign to clients
            </p>
          </div>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Resource Name</Label>
                  <Input placeholder="e.g., Grounding Techniques" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Brief description of the resource..." />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="worksheet">Worksheet</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input placeholder="e.g., anxiety, stress, beginner" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddResource}>
                  Add Resource
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search resources or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="worksheet">Worksheets</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="exercise">Exercises</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Resource Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => {
            const Icon = typeIcons[resource.type];
            return (
              <Card key={resource.id} className="shadow-soft hover:shadow-soft-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      typeColors[resource.type]
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border shadow-lg">
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-medium text-foreground mb-1">{resource.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {resource.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {resource.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Assigned {resource.assignedCount} times
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => handleAssign(resource)}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredResources.length === 0 && (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No resources match your search</p>
            </CardContent>
          </Card>
        )}

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Assign <strong>"{selectedResource?.name}"</strong> to a client
              </p>
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alex">Alex Morgan</SelectItem>
                    <SelectItem value="jordan">Jordan Kim</SelectItem>
                    <SelectItem value="sam">Sam Taylor</SelectItem>
                    <SelectItem value="riley">Riley Parker</SelectItem>
                    <SelectItem value="casey">Casey Lee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Add a note (optional)</Label>
                <Textarea placeholder="e.g., Try this before our next session..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAssign} className="gap-2">
                <Send className="w-4 h-4" />
                Assign Resource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TherapistLayout>
  );
}
