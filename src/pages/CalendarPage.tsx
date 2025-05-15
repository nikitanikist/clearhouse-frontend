
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CalendarPage = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View and manage important dates and deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
            <CardDescription>Select a date to view or add events</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="mx-auto"
            />
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Events for {date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</CardTitle>
            <CardDescription>Manage your schedule and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 text-muted-foreground">
              No events scheduled for this date. Click to add a new event.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
