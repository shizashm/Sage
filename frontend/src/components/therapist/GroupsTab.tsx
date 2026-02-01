import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, Calendar, ChevronRight, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const mockGroups = [
  {
    id: 'grp_001',
    name: 'Workplace Wellness Warriors',
    focusArea: 'Work-Life Balance',
    nextSession: '2026-02-03T18:00:00Z',
    participantCount: 6,
    matchScore: 94,
    status: 'ready',
  },
  {
    id: 'grp_002',
    name: 'Anxiety Support Circle',
    focusArea: 'Anxiety Management',
    nextSession: '2026-02-04T14:00:00Z',
    participantCount: 5,
    matchScore: 91,
    status: 'ready',
  },
  {
    id: 'grp_003',
    name: 'New Parents Network',
    focusArea: 'Postpartum Support',
    nextSession: '2026-02-05T10:00:00Z',
    participantCount: 4,
    matchScore: 88,
    status: 'needs_review',
  },
  {
    id: 'grp_004',
    name: 'Grief and Loss Support',
    focusArea: 'Bereavement',
    nextSession: '2026-02-07T15:00:00Z',
    participantCount: 6,
    matchScore: 92,
    status: 'ready',
  },
  {
    id: 'grp_005',
    name: 'Career Transition Circle',
    focusArea: 'Life Changes',
    nextSession: '2026-02-08T11:00:00Z',
    participantCount: 5,
    matchScore: 89,
    status: 'ready',
  },
];

function formatNextSession(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function GroupsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.focusArea.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{mockGroups.length} groups</span>
        </div>
      </div>

      {/* Groups Table */}
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Group</TableHead>
                <TableHead>Next Session</TableHead>
                <TableHead className="text-center">Participants</TableHead>
                <TableHead className="text-center">Match Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow key={group.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{group.name}</p>
                      <p className="text-sm text-muted-foreground">{group.focusArea}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatNextSession(group.nextSession)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{group.participantCount}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendingUp className={cn(
                        'w-4 h-4',
                        group.matchScore >= 90 ? 'text-success' : 'text-warning'
                      )} />
                      <span className={cn(
                        'font-medium',
                        group.matchScore >= 90 ? 'text-success' : 'text-warning-foreground'
                      )}>
                        {group.matchScore}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {group.status === 'ready' ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-warning/10 text-warning-foreground border-warning/30">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Review
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => navigate(`/therapist/group/${group.id}`)}
                    >
                      Briefing
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredGroups.length === 0 && (
        <Card className="shadow-soft">
          <CardContent className="p-8 text-center">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground">No groups match your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
