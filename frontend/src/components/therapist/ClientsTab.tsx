import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, User, Calendar, Users, ChevronRight, MessageSquare, Clock, Brain, Target, FileText, BarChart3, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClientProgressTimeline } from './ClientProgressTimeline';

const mockClients = [
  {
    id: 'user_001',
    name: 'Alex Morgan',
    email: 'alex.m@email.com',
    lastSession: '2026-01-31',
    groups: ['Workplace Wellness Warriors'],
    tags: ['High intensity', 'Burnout'],
    primaryConcern: 'Chronic overwork leading to burnout symptoms',
    sessionCount: 8,
    attendanceRate: 95,
    currentMood: 'improving',
  },
  {
    id: 'user_002',
    name: 'Jordan Kim',
    email: 'jordan.k@email.com',
    lastSession: '2026-01-30',
    groups: ['Workplace Wellness Warriors', 'Career Transition'],
    tags: ['Moderate', 'Work-life balance'],
    primaryConcern: 'Work-life balance after promotion',
    sessionCount: 12,
    attendanceRate: 88,
    currentMood: 'stable',
  },
  {
    id: 'user_003',
    name: 'Sam Taylor',
    email: 'sam.t@email.com',
    lastSession: '2026-01-29',
    groups: ['Workplace Wellness Warriors'],
    tags: ['Moderate', 'Remote work'],
    primaryConcern: 'Remote work isolation and overwork',
    sessionCount: 6,
    attendanceRate: 100,
    currentMood: 'stable',
  },
  {
    id: 'user_004',
    name: 'Riley Parker',
    email: 'riley.p@email.com',
    lastSession: '2026-01-28',
    groups: ['Anxiety Support Circle'],
    tags: ['High intensity', 'Job anxiety'],
    primaryConcern: 'Anxiety about job security',
    sessionCount: 10,
    attendanceRate: 90,
    currentMood: 'needs-attention',
  },
  {
    id: 'user_005',
    name: 'Casey Lee',
    email: 'casey.l@email.com',
    lastSession: '2026-01-27',
    groups: ['Workplace Wellness Warriors'],
    tags: ['Moderate', 'Perfectionism'],
    primaryConcern: 'Perfectionism and fear of failure at work',
    sessionCount: 4,
    attendanceRate: 75,
    currentMood: 'stable',
  },
];

const mockChatHistory = [
  { id: '1', date: '2026-01-30', preview: 'Discussed weekend work anxiety...', messages: 12 },
  { id: '2', date: '2026-01-25', preview: 'Follow-up on breathing exercises...', messages: 8 },
  { id: '3', date: '2026-01-20', preview: 'Initial check-in about sleep issues...', messages: 15 },
];

interface Client {
  id: string;
  name: string;
  email: string;
  lastSession: string;
  groups: string[];
  tags: string[];
  primaryConcern: string;
  sessionCount: number;
  attendanceRate: number;
  currentMood: string;
}

const moodStyles = {
  improving: { label: 'Improving', className: 'bg-success/10 text-success' },
  stable: { label: 'Stable', className: 'bg-muted text-muted-foreground' },
  'needs-attention': { label: 'Needs Attention', className: 'bg-warning/10 text-warning' },
};

export function ClientsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Client Cards */}
      <div className="grid gap-3">
        {filteredClients.map((client) => {
          const moodInfo = moodStyles[client.currentMood as keyof typeof moodStyles] || moodStyles.stable;
          return (
            <Card 
              key={client.id} 
              className="shadow-soft hover:shadow-soft-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedClient(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-foreground">{client.name}</h3>
                      <Badge className={cn("text-xs", moodInfo.className)}>
                        {moodInfo.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Last: {new Date(client.lastSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {client.sessionCount} sessions
                      </span>
                      {client.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Groups */}
                  <div className="hidden md:flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {client.groups.length} group{client.groups.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No clients match your search</p>
          </CardContent>
        </Card>
      )}

      {/* Client Profile Sheet */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-[600px] p-0 overflow-hidden">
          {selectedClient && (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-border bg-muted/30">
                <SheetHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <SheetTitle className="text-left text-xl">{selectedClient.name}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                      <div className="flex gap-2 mt-2">
                        {selectedClient.groups.map(group => (
                          <Badge key={group} variant="outline" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetHeader>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-card rounded-lg p-3 text-center shadow-soft">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{selectedClient.sessionCount}</p>
                    <p className="text-[10px] text-muted-foreground">Total Sessions</p>
                  </div>
                  <div className="bg-card rounded-lg p-3 text-center shadow-soft">
                    <div className="flex items-center justify-center gap-1 text-success mb-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{selectedClient.attendanceRate}%</p>
                    <p className="text-[10px] text-muted-foreground">Attendance</p>
                  </div>
                  <div className="bg-card rounded-lg p-3 text-center shadow-soft">
                    <div className="flex items-center justify-center gap-1 text-info mb-1">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-foreground capitalize">
                      {selectedClient.currentMood.replace('-', ' ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Current Mood</p>
                  </div>
                </div>
              </div>

              {/* Tabs Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0 h-auto">
                  <TabsTrigger 
                    value="overview" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                  >
                    Progress
                  </TabsTrigger>
                  <TabsTrigger 
                    value="chat" 
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3"
                  >
                    Chat History
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1">
                  <TabsContent value="overview" className="mt-0 p-6 space-y-6">
                    {/* Primary Concern */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Primary Concern
                      </h4>
                      <p className="text-foreground bg-muted/30 p-3 rounded-lg">{selectedClient.primaryConcern}</p>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedClient.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="pt-4 border-t border-border space-y-2">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <FileText className="w-4 h-4" />
                        View All Session Notes
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <MessageSquare className="w-4 h-4" />
                        View Chat History
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0 p-6">
                    <ClientProgressTimeline clientName={selectedClient.name} />
                  </TabsContent>

                  <TabsContent value="chat" className="mt-0 p-6">
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Recent chat conversations with {selectedClient.name.split(' ')[0]}
                      </p>
                      {mockChatHistory.map((chat) => (
                        <Card key={chat.id} className="shadow-soft hover:shadow-soft-lg transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                  {new Date(chat.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {chat.messages} messages
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {chat.preview}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
