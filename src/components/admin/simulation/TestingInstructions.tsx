
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle } from 'lucide-react';

const TestingInstructions = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>
            Step-by-step guides for testing key platform functionality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="purchase-flow">
              <AccordionTrigger>End-to-End Purchase Flow Testing</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <p>Follow these steps to conduct a complete end-to-end test of the purchase flow:</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 1: Navigate as a User</h4>
                    <p>Start by logging in as an admin and browse to the public portfolio pages.</p>
                    <p>Click on an artwork to open the artwork detail view.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <em>Verification: Analytics events for view tracking should be recorded in the analytics_events table.</em>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 2: Test Purchase Button</h4>
                    <p>Confirm the purchase button appears and displays the correct price.</p>
                    <p>For artwork by the same user, verify "Your Artwork" shows instead of the purchase button.</p>
                    <p>For sold out artwork, verify the "Sold Out" status appears.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 3: Simulate Transaction</h4>
                    <p>Return to the Admin Simulation page and set up a transaction for the artwork you viewed.</p>
                    <p>Run simulations for all three transaction types:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Successful Payment</li>
                      <li>Failed Payment</li>
                      <li>Abandoned Checkout</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 4: Verify Order Records</h4>
                    <p>Check the Dashboard Order History to confirm orders are displayed correctly.</p>
                    <p>Verify that statuses are correctly displayed as "Completed", "Failed", or "Pending".</p>
                    <p>Check that price formatting and artwork details are displayed accurately.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 5: Verify Analytics</h4>
                    <p>Check the Analytics Dashboard to confirm purchase events are tracked.</p>
                    <p>Verify that purchase completions appear in conversion metrics.</p>
                    <p>Check the Analytics Events table directly in the database to confirm all events are logged with proper user IDs and metadata.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 6: Inventory Management</h4>
                    <p>For simulated successful purchases of limited-edition artworks:</p>
                    <p>Verify that inventory counts are updated correctly.</p>
                    <p>Once sold out, confirm the "Sold Out" badge appears appropriately.</p>
                  </div>

                  <div className="rounded-md bg-green-50 p-3 border border-green-100">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-800">Expected Outcomes</h4>
                        <ul className="list-disc pl-5 mt-1 text-green-700 space-y-1">
                          <li>Successful transactions should appear in the order history with "Completed" status</li>
                          <li>Failed transactions should appear with "Failed" status</li>
                          <li>All transactions should generate appropriate analytics events</li>
                          <li>Inventory should update for successful purchases only</li>
                          <li>All simulations should be clearly marked as test data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="analytics-verification">
              <AccordionTrigger>Analytics Verification Testing</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <p>Follow these steps to verify that analytics tracking is working properly across the platform:</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 1: Generate View Events</h4>
                    <p>Browse through multiple portfolios and artworks as both logged-in and anonymous users.</p>
                    <p>Make sure to view at least 5 different artworks and 3 different portfolios.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <em>Verification: The analytics_events table should record view events with appropriate metadata.</em>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 2: Test Interaction Tracking</h4>
                    <p>Perform various interactions including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Clicking on artist profiles</li>
                      <li>Using search functionality</li>
                      <li>Filtering portfolios</li>
                      <li>Opening artwork details</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-1">
                      <em>Verification: These interactions should be recorded in the analytics_events table with appropriate event_type and metadata.</em>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 3: Simulate Conversion Events</h4>
                    <p>Use the Transaction Simulator to create:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>At least 2 successful purchases</li>
                      <li>1 failed transaction</li>
                      <li>1 abandoned cart</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-1">
                      <em>Verification: Corresponding conversion events should appear in analytics_events.</em>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 4: Verify Analytics Dashboard</h4>
                    <p>Log in as an artist who has at least one artwork with view events.</p>
                    <p>Check the Artist Analytics Dashboard to verify:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>View counts are accurately displayed</li>
                      <li>Conversion metrics reflect simulated purchases</li>
                      <li>Charts and graphs update to reflect new data</li>
                      <li>Time period filters (7/30/90 days) function correctly</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 5: Device Tracking Verification</h4>
                    <p>If possible, view the platform from multiple devices (desktop, mobile, tablet).</p>
                    <p>Check the analytics data to confirm device type is correctly recorded.</p>
                    <p>Verify that the device breakdown appears correctly in the Analytics Dashboard.</p>
                  </div>

                  <div className="rounded-md bg-green-50 p-3 border border-green-100">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-800">Expected Outcomes</h4>
                        <ul className="list-disc pl-5 mt-1 text-green-700 space-y-1">
                          <li>All user interactions should be tracked in analytics_events</li>
                          <li>Conversion events should be properly linked to artworks and users</li>
                          <li>Analytics Dashboard should accurately reflect all tracked events</li>
                          <li>Device detection should correctly identify the user's device type</li>
                          <li>Time period filtering should show the correct data ranges</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="inventory-management">
              <AccordionTrigger>Inventory Management Testing</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <p>Follow these steps to verify that inventory management works correctly when artworks are purchased:</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 1: Create Test Artwork</h4>
                    <p>Create a new artwork with limited stock (set quantity to 1).</p>
                    <p>Ensure it's marked for sale with a valid price.</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <em>Verification: Artwork should be visible in public portfolios with a purchase button.</em>
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 2: Simulate a Successful Purchase</h4>
                    <p>Use the Transaction Simulator to create a successful purchase for this artwork.</p>
                    <p>Note the artwork ID for later verification.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 3: Verify Sold Out Status</h4>
                    <p>Navigate to the artwork in the public view.</p>
                    <p>Verify that it now shows as "Sold Out" instead of displaying a purchase button.</p>
                    <p>Check the artwork in the artist's dashboard to confirm it shows as sold.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 4: Test Multiple Editions</h4>
                    <p>Create another artwork with multiple editions (set quantity to 3).</p>
                    <p>Simulate two successful purchases for this artwork.</p>
                    <p>Verify that the artwork is still for sale but inventory is reduced.</p>
                    <p>Simulate a third purchase and verify it now shows as sold out.</p>
                  </div>

                  <div className="rounded-md bg-green-50 p-3 border border-green-100">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-800">Expected Outcomes</h4>
                        <ul className="list-disc pl-5 mt-1 text-green-700 space-y-1">
                          <li>Single-edition artworks should show as sold out after one purchase</li>
                          <li>Multi-edition artworks should show remaining inventory correctly</li>
                          <li>Sold out artworks should display the "Sold Out" status</li>
                          <li>Artists should see accurate inventory counts in their dashboard</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="error-handling">
              <AccordionTrigger>Error Handling & Edge Cases</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <p>Follow these steps to verify that the application handles errors and edge cases gracefully:</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 1: Network Errors</h4>
                    <p>Test the application's behavior when network requests fail:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Use browser devtools to simulate offline mode during a purchase flow</li>
                      <li>Attempt to complete a purchase with slow network speed</li>
                      <li>Verify error messages are displayed appropriately</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 2: Concurrent Purchases</h4>
                    <p>Simulate multiple users attempting to purchase the same limited-edition artwork:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Create an artwork with limited quantity (1)</li>
                      <li>Use the Transaction Simulator to create two simultaneous purchases for the same artwork</li>
                      <li>Verify only one purchase completes successfully and inventory is updated correctly</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 3: Handling Deleted Artworks</h4>
                    <p>Test scenarios with deleted content:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Create a purchase for an artwork, then delete the artwork</li>
                      <li>Verify order history still displays properly even with deleted artwork</li>
                      <li>Verify analytics tracking remains intact for deleted items</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold">Step 4: Price Changes</h4>
                    <p>Test scenarios with price updates:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Create an artwork with a specific price</li>
                      <li>Initiate but don't complete a purchase</li>
                      <li>Change the artwork price</li>
                      <li>Verify the purchase flow handles this correctly</li>
                    </ul>
                  </div>
                  
                  <div className="rounded-md bg-green-50 p-3 border border-green-100">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-800">Expected Outcomes</h4>
                        <ul className="list-disc pl-5 mt-1 text-green-700 space-y-1">
                          <li>Network errors should display appropriate error messages</li>
                          <li>Inventory should be properly managed even with concurrent purchases</li>
                          <li>Order history should gracefully handle deleted artworks</li>
                          <li>Price changes should be handled properly in the purchase flow</li>
                          <li>All errors should be properly logged for debugging</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingInstructions;
