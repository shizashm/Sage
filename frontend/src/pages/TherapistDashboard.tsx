import { useState } from 'react';
import { TherapistLayout } from '@/components/layouts/TherapistLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarTab } from '@/components/therapist/CalendarTab';
import { GroupsTab } from '@/components/therapist/GroupsTab';
import { ClientsTab } from '@/components/therapist/ClientsTab';
import { CalendarDays, LayoutGrid, Users } from 'lucide-react';

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <TherapistLayout>
      <div className="animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-xs mx-auto mb-6 h-10 p-1 bg-muted/50">
            <TabsTrigger value="calendar" className="flex-1 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Groups</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex-1 gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <CalendarTab />
          </TabsContent>

          <TabsContent value="groups" className="mt-0">
            <GroupsTab />
          </TabsContent>

          <TabsContent value="clients" className="mt-0">
            <ClientsTab />
          </TabsContent>
        </Tabs>
      </div>
    </TherapistLayout>
  );
}
