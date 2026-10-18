import React, { useEffect, useState, useMemo } from 'react';
import { Download, Filter, Search } from 'lucide-react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { ButtonSpinner } from '../ui/Loader';
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
      .then(res => setRecords((res as any).records || (res as any).history || []))
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

    let topCrop = 'N/A';
    let maxCount = 0;
    Object.entries(cropCounts).forEach(([crop, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCrop = crop;
      }
    });

    return {
      avgYield: validYieldCount > 0 ? (totalYield / validYieldCount).toFixed(2) : '0.00',
      avgSpread: boundCount > 0 ? `\u00b1${(totalBoundSpread / boundCount / 2).toFixed(2)}` : '\u00b11.15',
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
    link.setAttribute('download', `terraflect_prediction_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flex: 1,
      minHeight: 0,
      gap: 10,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Compact Top Header */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 12,
        padding: '10px 16px',
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        flexShrink: 0
      }}>
        <div>
          <h3 style={{ fontSize: 16, color: 'var(--color-offwhite)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            Prediction History & Trend Analysis
          </h3>
          <p style={{ fontSize: 11.5, color: 'var(--color-muted)', margin: '2px 0 0' }}>
            Past predictions saved in Terraflect database. Review harvest trends and export data.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {records.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8 }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          )}
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            background: 'rgba(228, 253, 151, 0.12)',
            border: '1px solid var(--color-forest-border)',
            padding: '4px 10px',
            borderRadius: 100,
            color: 'var(--color-lime)'
          }}>
            {records.length} RUNS SAVED
          </span>
        </div>
      </div>

      {/* Compact 4 KPI Metric Cards */}
      {analytics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          flexShrink: 0
        }}>
          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 10,
            padding: '9px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Total Predictions Made
            </span>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-offwhite)', marginTop: 2 }}>
              {analytics.totalRuns} <span style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--color-muted)' }}>runs</span>
            </div>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 10,
            padding: '9px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Average Harvest Yield
            </span>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-lime)', marginTop: 2 }}>
              {analytics.avgYield} <span style={{ fontSize: 11.5, fontWeight: 400 }}>t/ha</span>
            </div>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 10,
            padding: '9px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Most Frequent Crop
            </span>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-offwhite)', marginTop: 2 }}>
              {analytics.topCrop}
            </div>
          </div>

          <div style={{
            background: 'var(--color-forest-surface)',
            borderRadius: 10,
            padding: '9px 14px',
            border: '1px solid var(--color-forest-border)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-muted)', textTransform: 'uppercase' }}>
              Avg Uncertainty Margin
            </span>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--color-offwhite)', marginTop: 2 }}>
              {analytics.avgSpread} <span style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--color-muted)' }}>t/ha</span>
            </div>
          </div>
        </div>
      )}

      {/* Compact Filter & Search Bar */}
      {records.length > 0 && (
        <div style={{
          background: 'var(--color-forest-surface)',
          borderRadius: 10,
          padding: '8px 14px',
          border: '1px solid var(--color-forest-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search by country, crop, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-offwhite)',
                fontSize: 12.5,
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={13} style={{ color: 'var(--color-muted)' }} />
            <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="form-input"
              style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
            >
              <option value="ALL">All Crops ({records.length})</option>
              {uniqueCrops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Table Container with Internal Scroll (No Full-Page Scroll) */}
      <div style={{
        background: 'var(--color-forest-surface)',
        borderRadius: 12,
        border: '1px solid var(--color-forest-border)',
        boxShadow: 'var(--shadow-card)',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-muted)', margin: 'auto' }}>
            <ButtonSpinner size={24} text="Loading prediction history..." />
          </div>
        ) : error ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#F87171', fontSize: 13, margin: 'auto' }}>
            {error}
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', maxWidth: 420, margin: 'auto' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(228, 253, 151, 0.12)',
              color: 'var(--color-lime)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px'
            }}>
              <SparklesIcon style={{ width: 24, height: 24 }} />
            </div>
            <h4 style={{ fontSize: 16, color: 'var(--color-offwhite)', fontWeight: 700, marginBottom: 6 }}>
              No Predictions Saved Yet
            </h4>
            <p style={{ fontSize: 12.5, color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Whenever you run a yield prediction, it will appear here with full parameters, numbers, and export options.
            </p>
            {onNavigateToPredict && (
              <button
                className="btn-primary"
                onClick={onNavigateToPredict}
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                <SparklesIcon style={{ width: 15, height: 15 }} />
                <span>Make Your First Prediction</span>
              </button>
            )}
          </div>
        ) : (
          <div style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'auto',
            scrollbarWidth: 'thin'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 12.5 }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#141F13', borderBottom: '1px solid var(--color-forest-border)' }}>
                <tr>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Date & Time</th>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Country / Region</th>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Crop</th>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Year</th>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Rainfall</th>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>Avg Temp</th>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-lime)' }}>Predicted Yield</th>
                  <th style={{ padding: '9px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>90% Range (Min–Max)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, idx) => (
                  <tr 
                    key={r.id || idx} 
                    style={{ 
                      borderBottom: '1px solid rgba(169, 180, 158, 0.08)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-muted)' }}>
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 14px', fontWeight: 700, color: 'var(--color-offwhite)' }}>
                      {r.country}
                    </td>
                    <td style={{ padding: '8px 14px', color: 'var(--color-offwhite)' }}>
                      <span style={{
                        background: 'rgba(228, 253, 151, 0.12)',
                        color: 'var(--color-lime)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 600,
                        fontSize: 11.5
                      }}>
                        {r.crop}
                      </span>
                    </td>
                    <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>
                      {r.year}
                    </td>
                    <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>
                      {r.rainfall_mm} mm
                    </td>
                    <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', color: 'var(--color-offwhite)' }}>
                      {r.avg_temp_c} °C
                    </td>
                    <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 13.5, color: 'var(--color-lime)' }}>
                      {typeof r.predicted_yield_tonnes_per_ha === 'number' 
                        ? `${r.predicted_yield_tonnes_per_ha.toFixed(2)} t/ha`
                        : '—'}
                    </td>
                    <td style={{ padding: '8px 14px', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                      {r.conformal_lower_bound !== undefined && r.conformal_upper_bound !== undefined ? (
                        <span style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--color-forest-border)',
                          padding: '2px 8px',
                          borderRadius: 4,
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
