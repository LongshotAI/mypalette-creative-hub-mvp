
import React from 'react';
import KnowledgeBaseManager from './knowledge/KnowledgeBaseManager';

const AdminKnowledgeBase = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Knowledge Base Management</h2>
        <p className="text-muted-foreground">
          Manage the knowledge base to enhance AI chat assistance for users
        </p>
      </div>
      
      <KnowledgeBaseManager />
    </div>
  );
};

export default AdminKnowledgeBase;
