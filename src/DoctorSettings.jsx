import React, { useState } from 'react';
import './DoctorSchedule.css';
import { docActivities, rotationTemplates, buildDoctorSchedule, doctorProfiles } from './doctorSchedules.js';
import { activityColors } from './schedule';

// Custom function to merge rotation template with backbone constraints
// Backbone always takes precedence (overrides template when conflicts occur)
const mergeTemplateWithBackbone = (templateName, backbone) => {
  const template = rotationTemplates[templateName];
  if (!template) {
    console.error(`Template ${templateName} not found`);
    return { ...backbone }; // Return backbone if template not found
  }

  // Start with a deep copy of the backbone
  const mergedSchedule = JSON.parse(JSON.stringify(backbone));

  // Merge template activities, but only into empty backbone slots
  Object.entries(template).forEach(([day, slots]) => {
    Object.entries(slots).forEach(([timeSlot, activities]) => {
      // Only fill template activities if backbone slot is empty
      if (mergedSchedule[day] && mergedSchedule[day][timeSlot] && 
          mergedSchedule[day][timeSlot].length === 0) {
        mergedSchedule[day][timeSlot] = [...activities]; // Copy activities
      }
      // If backbone has activities, they take precedence (template is ignored for this slot)
    });
  });

  return mergedSchedule;
};

const DoctorSettings = () => {
  const [activeTab, setActiveTab] = useState('doctors');

  return (
    <div className="doctor-settings-container">
      <h2>Schedule Settings</h2>
      
      {/* Main Tabs */}
      <div className="main-tabs">
        <button 
          className={activeTab === 'doctors' ? 'active' : ''}
          onClick={() => setActiveTab('doctors')}
        >
          Doctors
        </button>
        <button 
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          Rotation Templates
        </button>
      </div>

      {/* Tab Content */}
      <div className="main-tab-content">
        {activeTab === 'doctors' && <DoctorsManager />}
        {activeTab === 'templates' && <RotationTemplatesManager />}
      </div>
    </div>
  );
};

// Function to transform doctorProfiles data to UI state format
const transformDoctorProfilesToUIState = () => {
  return Object.entries(doctorProfiles).map(([doctorCode, profile]) => ({
    id: doctorCode,
    name: doctorCode,
    backbone: profile.backbone,
    skills: profile.skills,
    rotations: profile.rotations,
    isImported: true // Flag to distinguish imported doctors from custom ones
  }));
};

// Add Doctor Form Component
const AddDoctorForm = ({ newDoctorName, setNewDoctorName, onAdd, onCancel }) => {
  const handleSubmit = () => {
    if (!newDoctorName.trim()) {
      alert('Please enter a doctor name');
      return;
    }
    onAdd();
  };

  return (
    <div className="add-doctor-form">
      <h4>Add Custom Doctor</h4>
      <p>Add additional doctors beyond the system-imported ones.</p>
      
      <input
        type="text"
        placeholder="Enter doctor name"
        value={newDoctorName}
        onChange={(e) => setNewDoctorName(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
      />

      <div className="form-actions">
        <button onClick={handleSubmit} disabled={!newDoctorName.trim()}>
          Add Doctor
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

// Extracted Doctors Manager Component
const DoctorsManager = () => {
  const [doctors, setDoctors] = useState(() => {
    // Initialize with existing doctor data from doctorSchedules.js
    return transformDoctorProfilesToUIState();
  });
  const [newDoctorName, setNewDoctorName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const addDoctor = () => {
    if (newDoctorName.trim()) {
      // Check if doctor name already exists
      const nameExists = doctors.some(doc => 
        doc.name.toLowerCase() === newDoctorName.trim().toLowerCase()
      );
      
      if (nameExists) {
        alert('A doctor with this name already exists. Please choose a different name.');
        return;
      }

      const newDoctor = {
        id: `custom_${Date.now()}`, // Use custom prefix for new doctors
        name: newDoctorName.trim(),
        backbone: {
          Monday: { "9am-1pm": [], "2pm-6pm": [] },
          Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
          Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
          Thursday: { "9am-1pm": [], "2pm-6pm": [] },
          Friday: { "9am-1pm": [], "2pm-6pm": [] },
        },
        skills: [],
        rotations: {},
        isImported: false // Mark as custom doctor
      };
      setDoctors([...doctors, newDoctor]);
      setNewDoctorName('');
      setShowAddForm(false);
    }
  };

  const deleteDoctor = (doctorId) => {
    setDoctors(doctors.filter(doc => doc.id !== doctorId));
  };

  const updateDoctor = (doctorId, updatedDoctor) => {
    setDoctors(doctors.map(doc => 
      doc.id === doctorId ? { ...doc, ...updatedDoctor } : doc
    ));
  };

  const importedDoctors = doctors.filter(doc => doc.isImported);
  const customDoctors = doctors.filter(doc => !doc.isImported);

  return (
    <div className="doctors-manager">
      {/* Summary */}
      <div className="doctors-summary">
        <h3>Doctors Management</h3>
        <p>
          <span className="summary-item">
            <strong>{importedDoctors.length}</strong> doctors imported from system data
          </span>
          {customDoctors.length > 0 && (
            <span className="summary-item">
              <strong>{customDoctors.length}</strong> custom doctor{customDoctors.length > 1 ? 's' : ''} added
            </span>
          )}
        </p>
      </div>

      {/* Add New Doctor Section */}
      {!showAddForm ? (
        <button 
          onClick={() => setShowAddForm(true)} 
          className="add-doctor-button"
        >
          Add Custom Doctor
        </button>
      ) : (
        <AddDoctorForm 
          newDoctorName={newDoctorName}
          setNewDoctorName={setNewDoctorName}
          onAdd={addDoctor}
          onCancel={() => {
            setShowAddForm(false);
            setNewDoctorName('');
          }}
        />
      )}

      {/* Doctor List */}
      <div className="doctors-list">
        {doctors.map(doctor => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onUpdate={(updatedDoctor) => updateDoctor(doctor.id, updatedDoctor)}
            onDelete={() => deleteDoctor(doctor.id)}
          />
        ))}
      </div>
    </div>
  );
};

const DoctorCard = ({ doctor, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('backbone');

  const updateBackbone = (day, timeSlot, activities) => {
    const newBackbone = {
      ...doctor.backbone,
      [day]: {
        ...doctor.backbone[day],
        [timeSlot]: activities
      }
    };
    onUpdate({ backbone: newBackbone });
  };

  const updateSkills = (newSkills) => {
    onUpdate({ skills: newSkills });
  };

  const addRotation = (rotationName, rotationData) => {
    const newRotations = {
      ...doctor.rotations,
      [rotationName]: rotationData
    };
    onUpdate({ rotations: newRotations });
  };

  const deleteRotation = (rotationName) => {
    const newRotations = { ...doctor.rotations };
    delete newRotations[rotationName];
    onUpdate({ rotations: newRotations });
  };

  const updateRotation = (rotationName, updatedRotationData) => {
    const newRotations = {
      ...doctor.rotations,
      [rotationName]: updatedRotationData
    };
    onUpdate({ rotations: newRotations });
  };

  return (
    <div className="doctor-card">
      <div className="doctor-card-header">
        <div className="doctor-info">
          <h3>{doctor.name}</h3>
          {doctor.isImported && (
            <span className="doctor-type-badge imported">Imported from System</span>
          )}
          {!doctor.isImported && (
            <span className="doctor-type-badge custom">Custom Doctor</span>
          )}
        </div>
        <div className="doctor-card-actions">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          {!doctor.isImported && (
            <button onClick={onDelete} className="delete-button">Delete</button>
          )}
          {doctor.isImported && (
            <span className="imported-notice" title="Imported doctors cannot be deleted, but can be edited">
              System Doctor
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="doctor-card-content">
          <div className="tabs">
            <button 
              className={activeTab === 'backbone' ? 'active' : ''}
              onClick={() => setActiveTab('backbone')}
            >
              Backbone
            </button>
            <button 
              className={activeTab === 'skills' ? 'active' : ''}
              onClick={() => setActiveTab('skills')}
            >
              Skills
            </button>
            <button 
              className={activeTab === 'rotations' ? 'active' : ''}
              onClick={() => setActiveTab('rotations')}
            >
              Rotations
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'backbone' && (
              <BackboneEditor 
                backbone={doctor.backbone} 
                onUpdate={updateBackbone} 
              />
            )}
            {activeTab === 'skills' && (
              <SkillsEditor 
                skills={doctor.skills} 
                onUpdate={updateSkills} 
              />
            )}
            {activeTab === 'rotations' && (
              <RotationsManager 
                rotations={doctor.rotations}
                backbone={doctor.backbone}
                skills={doctor.skills}
                onAdd={addRotation}
                onDelete={deleteRotation}
                onUpdate={updateRotation}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const BackboneEditor = ({ backbone, onUpdate }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (day, timeSlot) => {
    setSelectedSlot({ day, timeSlot, activities: backbone[day][timeSlot] });
  };

  const updateSlot = (activities) => {
    if (selectedSlot) {
      onUpdate(selectedSlot.day, selectedSlot.timeSlot, activities);
      setSelectedSlot(null);
    }
  };

  return (
    <div className="backbone-editor">
      <h4>Backbone Schedule (Base Constraints)</h4>
      <p>Click on a time slot to edit. Backbone activities take precedence over rotations.</p>
      
      <div className="editable-schedule">
        <div className="header-row">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <div key={day} className="day-header">
              <div>{day}</div>
              <div className="am-pm-header">
                <div>AM</div>
                <div>PM</div>
              </div>
            </div>
          ))}
        </div>

        <div className="schedule-columns">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <div key={day} className="day-column">
              <EditableTimeSlot
                day={day}
                timeSlot="9am-1pm"
                activities={backbone[day]["9am-1pm"]}
                onClick={() => handleSlotClick(day, "9am-1pm")}
              />
              <EditableTimeSlot
                day={day}
                timeSlot="2pm-6pm"
                activities={backbone[day]["2pm-6pm"]}
                onClick={() => handleSlotClick(day, "2pm-6pm")}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedSlot && (
        <TimeSlotEditor
          slot={selectedSlot}
          onSave={updateSlot}
          onCancel={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

const EditableTimeSlot = ({ day, timeSlot, activities, onClick }) => {
  return (
    <div className="editable-timeslot" onClick={onClick}>
      <div className="timeslot-label">{timeSlot.includes('9am') ? 'AM' : 'PM'}</div>
      <div className="timeslot-content">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={index}
              className="activity-block"
              style={{
                backgroundColor: activityColors[activity] || '#ccc',
                height: `${(docActivities[activity]?.duration || 1) * 25}px`,
              }}
            >
              {activity}
            </div>
          ))
        ) : (
          <div className="no-schedule">Empty</div>
        )}
      </div>
    </div>
  );
};

const TimeSlotEditor = ({ slot, onSave, onCancel }) => {
  const [selectedActivities, setSelectedActivities] = useState(slot.activities);
  
  const backboneOptions = ['TP', 'Cs', 'Chefferie']; // Common backbone activities
  
  const handleActivityToggle = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleClear = () => {
    setSelectedActivities([]);
  };

  return (
    <div className="timeslot-editor-overlay">
      <div className="timeslot-editor">
        <h4>Edit {slot.day} {slot.timeSlot}</h4>
        
        <div className="activity-options">
          <div className="activity-section">
            <h5>Backbone Activities:</h5>
            {backboneOptions.map(activity => (
              <label key={activity} className="activity-option">
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity)}
                  onChange={() => handleActivityToggle(activity)}
                />
                <span 
                  className="activity-preview"
                  style={{ backgroundColor: activityColors[activity] || '#ccc' }}
                >
                  {activity}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="editor-actions">
          <button onClick={handleClear}>Clear</button>
          <button onClick={() => onSave(selectedActivities)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const SkillsEditor = ({ skills, onUpdate }) => {
  const handleSkillToggle = (skill) => {
    if (skills.includes(skill)) {
      onUpdate(skills.filter(s => s !== skill));
    } else {
      onUpdate([...skills, skill]);
    }
  };

  return (
    <div className="skills-editor">
      <h4>Doctor Skills</h4>
      <p>Select activities this doctor can perform:</p>
      
      <div className="skills-grid">
        {Object.keys(docActivities).map(activity => (
          <label key={activity} className="skill-option">
            <input
              type="checkbox"
              checked={skills.includes(activity)}
              onChange={() => handleSkillToggle(activity)}
            />
            <span 
              className="skill-preview"
              style={{ backgroundColor: activityColors[activity] || '#ccc' }}
            >
              {activity} ({docActivities[activity].duration}h)
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

const RotationCard = ({ name, rotation, backbone, skills, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Determine if rotation is template-based or custom
  const isTemplate = typeof rotation === 'string';
  const rotationType = isTemplate ? `Template: ${rotation}` : 'Custom';

  // Get the actual schedule to display
  const getRotationSchedule = () => {
    if (isTemplate) {
      // For template rotations, merge template with backbone using our custom function
      try {
        return mergeTemplateWithBackbone(rotation, backbone);
      } catch (error) {
        console.error('Error building template schedule:', error);
        return backbone; // Fallback to backbone
      }
    } else {
      // Custom rotation - use as is
      return rotation;
    }
  };

  const schedule = getRotationSchedule();

  return (
    <div className="rotation-card">
      <div className="rotation-card-header">
        <div className="rotation-info">
          <h5>{name}</h5>
          <span className="rotation-type">{rotationType}</span>
        </div>
        <div className="rotation-actions">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'View Schedule'}
          </button>
          {!isTemplate && (
            <button onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Done Editing' : 'Edit'}
            </button>
          )}
          <button onClick={onDelete} className="delete-button">Delete</button>
        </div>
      </div>

      {isExpanded && (
        <div className="rotation-card-content">
          {isTemplate && (
            <div className="template-info">
              <p><strong>Template-based rotation:</strong> This schedule is generated from the "{rotation}" template merged with your backbone constraints. To customize it, you can delete this rotation and create a custom one.</p>
            </div>
          )}
          
          {isEditing && !isTemplate ? (
            <RotationScheduleEditor
              schedule={schedule}
              skills={skills}
              onUpdate={onUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="rotation-schedule-display">
              <div className="header-row">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <div key={day} className="day-header">
                    <div>{day}</div>
                    <div className="am-pm-header">
                      <div>AM</div>
                      <div>PM</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="schedule-columns">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <div key={day} className="day-column">
                    <div className="display-timeslot">
                      <div className="timeslot-label">AM</div>
                      <div className="timeslot-content">
                        {schedule[day]["9am-1pm"].length > 0 ? (
                          schedule[day]["9am-1pm"].map((activity, index) => (
                            <div
                              key={index}
                              className="activity-block"
                              style={{
                                backgroundColor: activityColors[activity] || '#ccc',
                                height: `${(docActivities[activity]?.duration || 1) * 25}px`,
                              }}
                            >
                              {activity}
                            </div>
                          ))
                        ) : (
                          <div className="no-schedule">Empty</div>
                        )}
                      </div>
                    </div>
                    <div className="display-timeslot">
                      <div className="timeslot-label">PM</div>
                      <div className="timeslot-content">
                        {schedule[day]["2pm-6pm"].length > 0 ? (
                          schedule[day]["2pm-6pm"].map((activity, index) => (
                            <div
                              key={index}
                              className="activity-block"
                              style={{
                                backgroundColor: activityColors[activity] || '#ccc',
                                height: `${(docActivities[activity]?.duration || 1) * 25}px`,
                              }}
                            >
                              {activity}
                            </div>
                          ))
                        ) : (
                          <div className="no-schedule">Empty</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const RotationScheduleEditor = ({ schedule, skills, onUpdate, onCancel }) => {
  const [editingSchedule, setEditingSchedule] = useState(() => {
    // Deep clone the schedule for editing
    return JSON.parse(JSON.stringify(schedule));
  });
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (day, timeSlot) => {
    setSelectedSlot({ 
      day, 
      timeSlot, 
      activities: editingSchedule[day][timeSlot] 
    });
  };

  const updateSlot = (activities) => {
    if (selectedSlot) {
      const newSchedule = {
        ...editingSchedule,
        [selectedSlot.day]: {
          ...editingSchedule[selectedSlot.day],
          [selectedSlot.timeSlot]: activities
        }
      };
      setEditingSchedule(newSchedule);
      setSelectedSlot(null);
    }
  };

  const handleSave = () => {
    onUpdate(editingSchedule);
    onCancel();
  };

  return (
    <div className="rotation-schedule-editor">
      <h5>Edit Rotation Schedule</h5>
      <p>Click on any time slot to edit activities. You can assign any activity from the doctor's skills.</p>
      
      <div className="editable-schedule">
        <div className="header-row">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <div key={day} className="day-header">
              <div>{day}</div>
              <div className="am-pm-header">
                <div>AM</div>
                <div>PM</div>
              </div>
            </div>
          ))}
        </div>

        <div className="schedule-columns">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <div key={day} className="day-column">
              <EditableTimeSlot
                day={day}
                timeSlot="9am-1pm"
                activities={editingSchedule[day]["9am-1pm"]}
                onClick={() => handleSlotClick(day, "9am-1pm")}
              />
              <EditableTimeSlot
                day={day}
                timeSlot="2pm-6pm"
                activities={editingSchedule[day]["2pm-6pm"]}
                onClick={() => handleSlotClick(day, "2pm-6pm")}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="editor-actions">
        <button onClick={handleSave}>Save Changes</button>
        <button onClick={onCancel}>Cancel</button>
      </div>

      {selectedSlot && (
        <RotationTimeSlotEditor
          slot={selectedSlot}
          skills={skills}
          onSave={updateSlot}
          onCancel={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

const RotationTimeSlotEditor = ({ slot, skills, onSave, onCancel }) => {
  const [selectedActivities, setSelectedActivities] = useState(slot.activities);
  
  const handleActivityToggle = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleClear = () => {
    setSelectedActivities([]);
  };

  return (
    <div className="timeslot-editor-overlay">
      <div className="timeslot-editor">
        <h4>Edit {slot.day} {slot.timeSlot}</h4>
        
        <div className="activity-options">
          <div className="activity-section">
            <h5>Available Activities (from doctor's skills):</h5>
            {skills.map(activity => (
              <label key={activity} className="activity-option">
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity)}
                  onChange={() => handleActivityToggle(activity)}
                />
                <span 
                  className="activity-preview"
                  style={{ backgroundColor: activityColors[activity] || '#ccc' }}
                >
                  {activity} ({docActivities[activity]?.duration || 1}h)
                </span>
              </label>
            ))}
            
            <div className="activity-section">
              <h5>Other Activities:</h5>
              {['TP', 'Cs', 'Chefferie'].map(activity => (
                <label key={activity} className="activity-option">
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activity)}
                    onChange={() => handleActivityToggle(activity)}
                  />
                  <span 
                    className="activity-preview"
                    style={{ backgroundColor: activityColors[activity] || '#ccc' }}
                  >
                    {activity}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-actions">
          <button onClick={handleClear}>Clear</button>
          <button onClick={() => onSave(selectedActivities)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const RotationsManager = ({ rotations, backbone, skills, onAdd, onDelete, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [rotationMode, setRotationMode] = useState('template'); // 'template' or 'custom'
  const [newRotationName, setNewRotationName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [previewSchedule, setPreviewSchedule] = useState(null);

  // Generate preview when template is selected
  const handleTemplateChange = (templateName) => {
    setSelectedTemplate(templateName);
    if (templateName) {
      try {
        // Use our custom merging function to merge template with backbone
        const preview = mergeTemplateWithBackbone(templateName, backbone);
        setPreviewSchedule(preview);
      } catch (error) {
        console.error('Error generating preview:', error);
        setPreviewSchedule(null);
      }
    } else {
      setPreviewSchedule(null);
    }
  };

  const handleAddRotation = () => {
    if (!newRotationName.trim()) return;

    let rotationData;
    if (rotationMode === 'template' && selectedTemplate) {
      // Generate the actual schedule by merging template with backbone
      // Use the previewSchedule if available, otherwise generate fresh
      if (previewSchedule) {
        rotationData = previewSchedule;
      } else {
        try {
          rotationData = mergeTemplateWithBackbone(selectedTemplate, backbone);
        } catch (error) {
          console.error('Error creating rotation from template:', error);
          rotationData = { ...backbone }; // Fallback to backbone
        }
      }
    } else {
      // Create custom rotation starting with backbone
      rotationData = JSON.parse(JSON.stringify(backbone)); // Deep copy
    }

    onAdd(newRotationName, rotationData);
    setNewRotationName('');
    setSelectedTemplate('');
    setPreviewSchedule(null);
    setShowAddForm(false);
  };

  return (
    <div className="rotations-manager">
      <h4>Rotations</h4>
      
      <div className="existing-rotations">
        {Object.entries(rotations).map(([name, rotation]) => (
          <RotationCard
            key={name}
            name={name}
            rotation={rotation}
            backbone={backbone}
            skills={skills}
            onDelete={() => onDelete(name)}
            onUpdate={(updatedRotation) => onUpdate && onUpdate(name, updatedRotation)}
          />
        ))}
      </div>

      {!showAddForm ? (
        <button onClick={() => setShowAddForm(true)} className="add-rotation-button">
          Add New Rotation
        </button>
      ) : (
        <div className="add-rotation-form">
          <input
            type="text"
            placeholder="Rotation name"
            value={newRotationName}
            onChange={(e) => setNewRotationName(e.target.value)}
          />
          
          <div className="rotation-mode-selector">
            <label>
              <input
                type="radio"
                value="template"
                checked={rotationMode === 'template'}
                onChange={(e) => setRotationMode(e.target.value)}
              />
              Use Template
            </label>
            <label>
              <input
                type="radio"
                value="custom"
                checked={rotationMode === 'custom'}
                onChange={(e) => setRotationMode(e.target.value)}
              />
              Custom (Start with Backbone)
            </label>
          </div>

          {rotationMode === 'template' && (
            <>
              <select 
                value={selectedTemplate} 
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                <option value="">Select template...</option>
                {Object.keys(rotationTemplates).map(template => (
                  <option key={template} value={template}>{template}</option>
                ))}
              </select>
              
              {previewSchedule && (
                <div className="template-preview">
                  <h5>Preview: {selectedTemplate} merged with your backbone</h5>
                  <div className="preview-schedule">
                    <div className="header-row">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                        <div key={day} className="day-header">
                          <div>{day}</div>
                          <div className="am-pm-header">
                            <div>AM</div>
                            <div>PM</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="schedule-columns">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                        <div key={day} className="day-column">
                          <div className="preview-timeslot">
                            <div className="timeslot-label">AM</div>
                            <div className="timeslot-content">
                              {previewSchedule[day]["9am-1pm"].map((activity, index) => (
                                <div
                                  key={index}
                                  className="activity-block"
                                  style={{
                                    backgroundColor: activityColors[activity] || '#ccc',
                                    height: `${(docActivities[activity]?.duration || 1) * 20}px`,
                                  }}
                                >
                                  {activity}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="preview-timeslot">
                            <div className="timeslot-label">PM</div>
                            <div className="timeslot-content">
                              {previewSchedule[day]["2pm-6pm"].map((activity, index) => (
                                <div
                                  key={index}
                                  className="activity-block"
                                  style={{
                                    backgroundColor: activityColors[activity] || '#ccc',
                                    height: `${(docActivities[activity]?.duration || 1) * 20}px`,
                                  }}
                                >
                                  {activity}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="form-actions">
            <button onClick={handleAddRotation} disabled={rotationMode === 'template' && !selectedTemplate}>
              Add Rotation
            </button>
            <button onClick={() => {
              setShowAddForm(false);
              setPreviewSchedule(null);
              setSelectedTemplate('');
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Rotation Templates Manager Component
const RotationTemplatesManager = () => {
  const [templates, setTemplates] = useState(() => {
    // Initialize with existing templates from doctorSchedules.js
    return Object.keys(rotationTemplates).reduce((acc, templateName) => {
      acc[templateName] = rotationTemplates[templateName];
      return acc;
    }, {});
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const addTemplate = (templateName, templateData) => {
    setTemplates(prev => ({
      ...prev,
      [templateName]: templateData
    }));
    setShowAddForm(false);
  };

  const updateTemplate = (templateName, updatedTemplateData) => {
    setTemplates(prev => ({
      ...prev,
      [templateName]: updatedTemplateData
    }));
  };

  const deleteTemplate = (templateName) => {
    setTemplates(prev => {
      const updated = { ...prev };
      delete updated[templateName];
      return updated;
    });
  };

  return (
    <div className="rotation-templates-manager">
      <div className="templates-header">
        <h3>Rotation Templates</h3>
        <p>Manage global rotation templates that can be used by doctors. These templates define weekly schedules for different types of rotations.</p>
      </div>

      {/* Add New Template Button */}
      {!showAddForm ? (
        <button 
          onClick={() => setShowAddForm(true)} 
          className="add-template-button"
        >
          Add New Template
        </button>
      ) : (
        <AddTemplateForm 
          onAdd={addTemplate}
          onCancel={() => setShowAddForm(false)}
          existingTemplates={Object.keys(templates)}
        />
      )}

      {/* Templates List */}
      <div className="templates-list">
        {Object.entries(templates).map(([templateName, templateData]) => (
          <TemplateCard
            key={templateName}
            templateName={templateName}
            templateData={templateData}
            onUpdate={(updatedData) => updateTemplate(templateName, updatedData)}
            onDelete={() => deleteTemplate(templateName)}
          />
        ))}
      </div>
    </div>
  );
};

// Template Card Component
const TemplateCard = ({ templateName, templateData, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the "${templateName}" template? This action cannot be undone.`)) {
      onDelete();
    }
  };

  return (
    <div className="template-card">
      <div className="template-card-header">
        <div className="template-info">
          <h4>{templateName}</h4>
          <span className="template-type">Rotation Template</span>
        </div>
        <div className="template-actions">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'View Schedule'}
          </button>
          <button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Done Editing' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="delete-button">Delete</button>
        </div>
      </div>

      {isExpanded && (
        <div className="template-card-content">
          {isEditing ? (
            <TemplateEditor
              templateName={templateName}
              templateData={templateData}
              onUpdate={onUpdate}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="template-schedule-display">
              <div className="header-row">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <div key={day} className="day-header">
                    <div>{day}</div>
                    <div className="am-pm-header">
                      <div>AM</div>
                      <div>PM</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="schedule-columns">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <div key={day} className="day-column">
                    <div className="display-timeslot">
                      <div className="timeslot-label">AM</div>
                      <div className="timeslot-content">
                        {templateData[day]["9am-1pm"].length > 0 ? (
                          templateData[day]["9am-1pm"].map((activity, index) => (
                            <div
                              key={index}
                              className="activity-block"
                              style={{
                                backgroundColor: activityColors[activity] || '#ccc',
                                height: `${(docActivities[activity]?.duration || 1) * 25}px`,
                              }}
                            >
                              {activity}
                            </div>
                          ))
                        ) : (
                          <div className="no-schedule">Empty</div>
                        )}
                      </div>
                    </div>
                    <div className="display-timeslot">
                      <div className="timeslot-label">PM</div>
                      <div className="timeslot-content">
                        {templateData[day]["2pm-6pm"].length > 0 ? (
                          templateData[day]["2pm-6pm"].map((activity, index) => (
                            <div
                              key={index}
                              className="activity-block"
                              style={{
                                backgroundColor: activityColors[activity] || '#ccc',
                                height: `${(docActivities[activity]?.duration || 1) * 25}px`,
                              }}
                            >
                              {activity}
                            </div>
                          ))
                        ) : (
                          <div className="no-schedule">Empty</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add Template Form Component
const AddTemplateForm = ({ onAdd, onCancel, existingTemplates }) => {
  const [templateName, setTemplateName] = useState('');
  const [selectedBaseTemplate, setSelectedBaseTemplate] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleSubmit = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    if (existingTemplates.includes(templateName)) {
      alert('A template with this name already exists');
      return;
    }

    let templateData;
    if (isCustom || !selectedBaseTemplate) {
      // Create empty template
      templateData = {
        Monday: { "9am-1pm": [], "2pm-6pm": [] },
        Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
        Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
        Thursday: { "9am-1pm": [], "2pm-6pm": [] },
        Friday: { "9am-1pm": [], "2pm-6pm": [] },
      };
    } else {
      // Copy from existing template
      templateData = JSON.parse(JSON.stringify(rotationTemplates[selectedBaseTemplate]));
    }

    onAdd(templateName, templateData);
    setTemplateName('');
    setSelectedBaseTemplate('');
    setIsCustom(false);
  };

  return (
    <div className="add-template-form">
      <h4>Add New Rotation Template</h4>
      
      <input
        type="text"
        placeholder="Template name (e.g., 'New_Rotation')"
        value={templateName}
        onChange={(e) => setTemplateName(e.target.value)}
      />

      <div className="template-creation-mode">
        <label>
          <input
            type="radio"
            checked={!isCustom}
            onChange={() => setIsCustom(false)}
          />
          Copy from existing template
        </label>
        <label>
          <input
            type="radio"
            checked={isCustom}
            onChange={() => setIsCustom(true)}
          />
          Start with empty template
        </label>
      </div>

      {!isCustom && (
        <select 
          value={selectedBaseTemplate} 
          onChange={(e) => setSelectedBaseTemplate(e.target.value)}
        >
          <option value="">Select base template...</option>
          {Object.keys(rotationTemplates).map(template => (
            <option key={template} value={template}>{template}</option>
          ))}
        </select>
      )}

      <div className="form-actions">
        <button 
          onClick={handleSubmit}
          disabled={!templateName.trim() || (!isCustom && !selectedBaseTemplate)}
        >
          Create Template
        </button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

// Template Editor Component
const TemplateEditor = ({ templateName, templateData, onUpdate, onCancel }) => {
  const [editingSchedule, setEditingSchedule] = useState(() => {
    return JSON.parse(JSON.stringify(templateData));
  });
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleSlotClick = (day, timeSlot) => {
    setSelectedSlot({ 
      day, 
      timeSlot, 
      activities: editingSchedule[day][timeSlot] 
    });
  };

  const updateSlot = (activities) => {
    if (selectedSlot) {
      const newSchedule = {
        ...editingSchedule,
        [selectedSlot.day]: {
          ...editingSchedule[selectedSlot.day],
          [selectedSlot.timeSlot]: activities
        }
      };
      setEditingSchedule(newSchedule);
      setSelectedSlot(null);
    }
  };

  const handleSave = () => {
    onUpdate(editingSchedule);
    onCancel();
  };

  return (
    <div className="template-editor">
      <h5>Edit Template: {templateName}</h5>
      <p>Click on any time slot to edit activities for this rotation template.</p>
      
      <div className="editable-schedule">
        <div className="header-row">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
            <div key={day} className="day-header">
              <div>{day}</div>
              <div className="am-pm-header">
                <div>AM</div>
                <div>PM</div>
              </div>
            </div>
          ))}
        </div>

        <div className="schedule-columns">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
            <div key={day} className="day-column">
              <EditableTimeSlot
                day={day}
                timeSlot="9am-1pm"
                activities={editingSchedule[day]["9am-1pm"]}
                onClick={() => handleSlotClick(day, "9am-1pm")}
              />
              <EditableTimeSlot
                day={day}
                timeSlot="2pm-6pm"
                activities={editingSchedule[day]["2pm-6pm"]}
                onClick={() => handleSlotClick(day, "2pm-6pm")}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="editor-actions">
        <button onClick={handleSave}>Save Template</button>
        <button onClick={onCancel}>Cancel</button>
      </div>

      {selectedSlot && (
        <TemplateTimeSlotEditor
          slot={selectedSlot}
          onSave={updateSlot}
          onCancel={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
};

// Template Time Slot Editor Component
const TemplateTimeSlotEditor = ({ slot, onSave, onCancel }) => {
  const [selectedActivities, setSelectedActivities] = useState(slot.activities);
  
  const allActivities = Object.keys(docActivities);
  
  const handleActivityToggle = (activity) => {
    if (selectedActivities.includes(activity)) {
      setSelectedActivities(selectedActivities.filter(a => a !== activity));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  const handleClear = () => {
    setSelectedActivities([]);
  };

  return (
    <div className="timeslot-editor-overlay">
      <div className="timeslot-editor">
        <h4>Edit Template {slot.day} {slot.timeSlot}</h4>
        
        <div className="activity-options">
          <div className="activity-section">
            <h5>Available Activities:</h5>
            {allActivities.map(activity => (
              <label key={activity} className="activity-option">
                <input
                  type="checkbox"
                  checked={selectedActivities.includes(activity)}
                  onChange={() => handleActivityToggle(activity)}
                />
                <span 
                  className="activity-preview"
                  style={{ backgroundColor: activityColors[activity] || '#ccc' }}
                >
                  {activity} ({docActivities[activity]?.duration || 1}h)
                </span>
              </label>
            ))}
            
            <div className="activity-section">
              <h5>Other Activities:</h5>
              {['TP', 'Cs', 'Chefferie'].map(activity => (
                <label key={activity} className="activity-option">
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(activity)}
                    onChange={() => handleActivityToggle(activity)}
                  />
                  <span 
                    className="activity-preview"
                    style={{ backgroundColor: activityColors[activity] || '#ccc' }}
                  >
                    {activity}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-actions">
          <button onClick={handleClear}>Clear</button>
          <button onClick={() => onSave(selectedActivities)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;