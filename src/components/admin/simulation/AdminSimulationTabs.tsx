
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TransactionSimulator from './TransactionSimulator';
import SimulationLogs from './SimulationLogs';
import TestingInstructions from './TestingInstructions';

const AdminSimulationTabs = () => {
  const [activeTab, setActiveTab] = useState('simulator');

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Testing & Simulation</h2>
      <p className="text-muted-foreground">
        Test platform functionality and simulate transactions in a controlled environment.
      </p>
      
      <Tabs defaultValue="simulator" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulator">Transaction Simulator</TabsTrigger>
          <TabsTrigger value="logs">Simulation Logs</TabsTrigger>
          <TabsTrigger value="instructions">Testing Instructions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulator" className="mt-6">
          <TransactionSimulator />
        </TabsContent>
        
        <TabsContent value="logs" className="mt-6">
          <SimulationLogs />
        </TabsContent>
        
        <TabsContent value="instructions" className="mt-6">
          <TestingInstructions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSimulationTabs;
