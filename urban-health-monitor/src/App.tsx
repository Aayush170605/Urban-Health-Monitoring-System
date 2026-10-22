import React, { useState } from 'react';
import { DemoProvider } from './state/DemoProvider';
import {
  Header,
  OverviewCards,
  VulnerabilityRanking,
  DemoControls,
  MetricLayerSelector,
  CityGridMap,
  MapLegend,
  LocationDetails,
  TrendChart,
  AlertsPanel,
  RouteComparisonCard,
  ComparisonTable,
  AboutDialog,
  Footer,
} from './components';

function AppContent() {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <div className="app">
      <Header onAboutClick={() => setAboutOpen(true)} />
      <main className="main-content">
        <OverviewCards />
        <VulnerabilityRanking />
        <DemoControls />
        <div className="dashboard-grid">
          <div className="map-section">
            <MetricLayerSelector />
            <CityGridMap />
            <MapLegend />
          </div>
          <div className="detail-section">
            <LocationDetails />
          </div>
        </div>
        <div className="bottom-section">
          <div className="bottom-left">
            <TrendChart />
          </div>
          <div className="bottom-right">
            <AlertsPanel />
          </div>
        </div>
        <RouteComparisonCard />
        <ComparisonTable />
      </main>
      <Footer />
      {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}
    </div>
  );
}

function App() {
  return (
    <DemoProvider>
      <AppContent />
    </DemoProvider>
  );
}

export default App;
