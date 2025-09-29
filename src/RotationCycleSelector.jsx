import React from 'react';
import { rotation_cycles } from './customPlanningLogic.js';

const RotationCycleSelector = ({
  selectedRotationCycle,
  setSelectedRotationCycle
}) => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white'
    }}>
      <div style={{
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#495057' }}>Rotation Cycles Management</h3>
        <p style={{ margin: 0, color: '#6c757d', fontSize: '14px' }}>
          Select and configure the rotation cycle patterns for doctor assignments.
        </p>
      </div>

      <label htmlFor="rotation-cycle-select" style={{
        display: 'block',
        fontWeight: 'bold',
        marginBottom: '8px',
        color: '#495057'
      }}>
        🍯 Select Rotation Cycle:
      </label>
      <select
        id="rotation-cycle-select"
        value={selectedRotationCycle}
        onChange={(e) => {
          console.log(`🔄 Rotation cycle changed to: ${e.target.value}`);
          setSelectedRotationCycle(e.target.value);
        }}
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ced4da',
          borderRadius: '4px',
          fontSize: '14px',
          backgroundColor: 'white'
        }}
      >
        {Object.entries(rotation_cycles).map(([key, cycle]) => (
          <option key={key} value={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)} - {cycle.description}
          </option>
        ))}
      </select>
      <div style={{
        fontSize: '12px',
        marginTop: '6px',
        fontStyle: 'italic',
        color: '#6c757d',
        lineHeight: '1.4'
      }}>
        📝 {rotation_cycles[selectedRotationCycle]?.description}
      </div>

      {/* Visual Display of Selected Rotation Cycle */}
      <div style={{
        marginTop: '12px',
        backgroundColor: 'white',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '8px 12px',
          borderBottom: '1px solid #dee2e6',
          fontSize: '13px',
          fontWeight: 'bold',
          color: '#495057'
        }}>
          🔄 Rotation Periods Overview
        </div>

        <div style={{ overflow: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '11px'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '50px'
                }}>Period</th>
                <th style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '45px'
                }}>HTC1</th>
                <th style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '45px'
                }}>HDJ</th>
                <th style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '45px'
                }}>AMI</th>
                <th style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '45px'
                }}>HTC2</th>
                <th style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '45px'
                }}>EMIT</th>
                <th style={{
                  padding: '6px 8px',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  minWidth: '55px'
                }}>EMATIT</th>
              </tr>
            </thead>
            <tbody>
              {JSON.parse(JSON.stringify(rotation_cycles[selectedRotationCycle]?.periods || [])).map((period, index) => (
                <tr key={period.period} style={{
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                }}>
                  <td style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#007bff'
                  }}>
                    {period.period}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    backgroundColor: period.HTC1 === 'FL' ? '#e3f2fd' :
                                   period.HTC1 === 'CL' ? '#f3e5f5' :
                                   period.HTC1 === 'NS' ? '#e8f5e8' : '#fff3e0'
                  }}>
                    {period.HTC1}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    backgroundColor: period.HDJ === 'FL' ? '#e3f2fd' :
                                   period.HDJ === 'CL' ? '#f3e5f5' :
                                   period.HDJ === 'NS' ? '#e8f5e8' : '#fff3e0'
                  }}>
                    {period.HDJ}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    backgroundColor: period.AMI === 'FL' ? '#e3f2fd' :
                                   period.AMI === 'CL' ? '#f3e5f5' :
                                   period.AMI === 'NS' ? '#e8f5e8' : '#fff3e0'
                  }}>
                    {period.AMI}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    backgroundColor: period.HTC2 === 'MG' ? '#fff3e0' :
                                   period.HTC2 === 'MDLC' ? '#fce4ec' :
                                   period.HTC2 === 'RNV' ? '#e0f2f1' : '#f3e5f5'
                  }}>
                    {period.HTC2}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    backgroundColor: period.EMIT === 'MG' ? '#fff3e0' :
                                   period.EMIT === 'MDLC' ? '#fce4ec' :
                                   period.EMIT === 'RNV' ? '#e0f2f1' : '#f3e5f5'
                  }}>
                    {period.EMIT}
                  </td>
                  <td style={{
                    padding: '6px 8px',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    backgroundColor: period.EMATIT === 'MG' ? '#fff3e0' :
                                   period.EMATIT === 'MDLC' ? '#fce4ec' :
                                   period.EMATIT === 'RNV' ? '#e0f2f1' : '#f3e5f5'
                  }}>
                    {period.EMATIT}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RotationCycleSelector;