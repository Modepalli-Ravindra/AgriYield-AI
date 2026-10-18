import React, { useEffect, useState, useMemo } from 'react';
import { 
  Loader2, 
  Download, 
  Filter, 
  Search, 
  Sprout
} from 'lucide-react';
import type { HistoryRecord } from '../../types';
import * as api from '../../api';

interface HistoryTabProps {
  onNavigateToPredict?: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onNavigateToPredict }) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    api.fetchPredictionHistory()
      .then(res => setRecords(res.records || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesCrop = selectedCrop === 'ALL' || r.crop.toLowerCase() === selectedCrop.toLowerCase();
      const matchesSearch = !searchQuery || 
        r.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(r.year).includes(searchQuery);
      return matchesCrop && matchesSearch;
    });
  }, [records, selectedCrop, searchQuery]);

  const uniqueCrops = useMemo(() => {
    const crops = new Set<string>();
    records.forEach(r => { if (r.crop) crops.add(r.crop); });
    return Array.from(crops);
  }, [records]);

  const analytics = useMemo(() => {
    if (records.length === 0) return null;
    
    let totalYield = 0;
    let validYieldCount = 0;
    let totalBoundSpread = 0;
    let boundCount = 0;
    const cropCounts: Record<string, number> = {};

    records.forEach(r => {
      if (typeof r.predicted_yield_tonnes_per_ha === 'number') {
        totalYield += r.predicted_yield_tonnes_per_ha;
        validYieldCount++;
      }
      if (typeof r.conformal_lower_bound === 'number' && typeof r.conformal_upper_bound === 'number') {
        totalBoundSpread += (r.conformal_upper_bound - r.conformal_lower_bound);
        boundCount++;
      }
      cropCounts[r.crop] = (cropCounts[r.crop] || 0) + 1;
    });

    let topCrop = 'None';
    let topCropCount = 0;
    Object.entries(cropCounts).forEach(([crop, count]) => {
      if (count > topCropCount) {
        topCropCount = count;
        topCrop = crop;
      }
    });

    return {
      avgYield: validYieldCount > 0 ? (totalYield / validYieldCount).toFixed(2) : '0.00',
      avgSpread: boundCount > 0 ? `±${(totalBoundSpread / boundCount / 2).toFixed(2)}` : '±1.15',
      topCrop,
      totalRuns: records.length
    };
  }, [records]);

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Timestamp', 'Country', 'Crop', 'Year', 'Rainfall_mm', 'Avg_Temp_C', 'Predicted_Yield_t_ha', 'Conformal_Lower', 'Conformal_Upper'];
    const rows = records.map(r => [
      new Date(r.created_at).toISOString(),
      `"${r.country}"`,
      `"${r.crop}"`,
      r.year,
      r.rainfall_mm,
      r.avg_temp_c,
      r.predicted_yield_tonnes_per_ha?.toFixed(3) || '',
      r.conformal_lower_bound?.toFixed(3) || '',
      r.conformal_upper_bound?.toFixed(3) || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `agriyield_prediction_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        padding: '24px 28px',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h3 style={{ fontSize: 20, color: 'var(--color-offwhite)', fontWeight: 800 }}>
            Prediction History & Trend Analysis
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--color-muted)', marginTop: 4 }}>
            Past predictions saved in InsForge PostgreSQL. Review harvest trends, compare past estimates, and export data.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {records.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: 13 }}
            >
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          )}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            background: 'rgba(228, 253, 151, 0.12)',
            border: '1px solid var(--color-forest-border)',
            padding: '6px 14px',
            borderRadius: 100,
            color: 'var(--color-lime)'
          }}>
            {records.length} RUNS SAVED
          </span>
        </div>
      </div>

      {analytics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16
        }}>
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 16,
            padding: 20,
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Total Predictions Made
            </span>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginTop: 4 }}>
              {analytics.totalRuns} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-muted)' }}>runs</span>
            </div>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 16,
            padding: 20,
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Average Harvest Yield
            </span>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-lime)', marginTop: 4 }}>
              {analytics.avgYield} <span style={{ fontSize: 14, fontWeight: 400 }}>t/ha</span>
            </div>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 16,
            padding: 20,
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Most Frequently Analyzed
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-offwhite)', marginTop: 4 }}>
              {analytics.topCrop}
            </div>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 16,
            padding: 20,
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Average Uncertainty Margin
            </span>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-offwhite)', marginTop: 4 }}>
              {analytics.avgSpread} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-muted)' }}>t/ha</span>
            </div>
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 16,
          padding: '14px 20px',
          border: '1px solid var(--color-forest-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search by country, crop, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-offwhite)',
                fontSize: 13.5,
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Filter size={15} style={{ color: 'var(--color-muted)' }} />
            <span style={{ fontSize: 13, color: 'var(--color-muted)' }}>Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
            >
              <option value="ALL">All Crops ({records.length})</option>
              {uniqueCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 20,
        border: '1px solid var(--color-forest-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--color-muted)' }}>
            <Loader2 size={26} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--color-lime)' }} />
            <span>Loading your prediction history...</span>
          </div>
        ) : error ? (
          <div style={{ padding: 36, textAlign: 'center', color: '#F87171', fontSize: 14 }}>
            {error}
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <Sprout size={28} />
            </div>
            <h4 style={{ fontSize: 18, color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 8 }}>
              No Predictions Saved Yet
            </h4>
            <p style={{ fontSize: 14, color: 'var(--color-muted)', lineHeight: 1.55, marginBottom: 20 }}>
              Whenever you run a single or batch yield prediction, it will automatically appear here with full climate parameters, yield numbers, and export options.
            </p>
            {onNavigateToPredict && (
              <button
                className="btn-primary"
                onClick={onNavigateToPredict}
                style={{ padding: '10px 22px', fontSize: 14 }}
              >
                <Sprout size={16} />
                <span>Make Your First Prediction</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#141F13', borderBottom: '1px solid var(--color-forest-border)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Date & Time</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Country / Region</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Crop</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Year</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Rainfall</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Avg Temp</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-lime)' }}>Predicted Yield</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>90% Range (Min–Max)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => (
                  <tr 
                    key={r.id || idx} 
                    style={{ 
                      borderBottom: '1px solid rgba(169, 180, 158, 0.1)'
                    }}
                  >
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-muted)' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--color-offwhite)' }}>
                      {r.country}
                    </td>
                    <td style={{ padding: '14px 18px', color: 'var(--color-offwhite)' }}>
                      <span style={{
                        background: 'rgba(228, 253, 151, 0.12)',
                        color: 'var(--color-lime)',
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontWeight: 600
                      }}>
                        {r.crop}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                      {r.year}
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>
                      {r.rainfall_mm} mm
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>
                      {r.avg_temp_c}°C
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 14.5, color: 'var(--color-lime)' }}>
                      {typeof r.predicted_yield_tonnes_per_ha === 'number' 
                        ? `${r.predicted_yield_tonnes_per_ha.toFixed(2)} t/ha`
                        : '—'}
                    </td>
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>
                      {r.conformal_lower_bound !== undefined && r.conformal_upper_bound !== undefined ? (
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid var(--color-forest-border)',
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontWeight: 600,
                          color: 'var(--color-offwhite)'
                        }}>
                          {r.conformal_lower_bound.toFixed(2)} – {r.conformal_upper_bound.toFixed(2)} t/ha
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
