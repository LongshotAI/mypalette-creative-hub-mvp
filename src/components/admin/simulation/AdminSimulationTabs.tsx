
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionSimulator from './TransactionSimulator';
import SimulationLogs from './SimulationLogs';
import TestingInstructions from './TestingInstructions';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AdminSimulationTabs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Testing & Simulation</h1>
        <p className="text-muted-foreground">
          Simulate transactions and test user flows without real payments.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="instructions">Test Instructions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Admin Simulation Dashboard</CardTitle>
              <CardDescription>
                Use these tools to test and validate platform functionality without processing real transactions.
              </CardDescription>
            </CardHeader>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 h-full">
                  <h3 className="text-lg font-medium mb-2">Transaction Simulation</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Simulate complete purchase flows without processing real Stripe payments.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Test successful purchases</li>
                    <li>Simulate payment failures</li>
                    <li>Generate abandoned carts</li>
                    <li>Verify inventory management</li>
                  </ul>
                </Card>
                
                <Card className="p-4 h-full">
                  <h3 className="text-lg font-medium mb-2">Analytics Verification</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Confirm that analytics are being captured correctly for all simulated events.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Verify view tracking</li>
                    <li>Validate purchase events</li>
                    <li>Check user interaction logging</li>
                    <li>Test conversion funnel tracking</li>
                  </ul>
                </Card>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
                <h3 className="flex items-center text-amber-800 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Important Note
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  All simulated transactions are clearly marked in the database and will not affect real financial data.
                  Use these tools for testing and validation purposes only.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <TransactionSimulator />
        </TabsContent>

        <TabsContent value="logs">
          <SimulationLogs />
        </TabsContent>

        <TabsContent value="instructions">
          <TestingInstructions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSimulationTabs;
