import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import { AppProvider } from './context/AppContext';
import Toolbar from './components/Toolbar';
import JSONInputArea from './components/JSONInputArea';
import DAGVisualizer from './components/DAGVisualizer';
import StatusBar from './components/StatusBar';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="app-container">
          <Toolbar />
          <JSONInputArea />
          <ReactFlowProvider>
            <DAGVisualizer />
          </ReactFlowProvider>
          <StatusBar />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
