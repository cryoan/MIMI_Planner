import React, { useState } from 'react';
import './DoctorSchedule.css';
import { docActivities, rotationTemplates, buildDoctorSchedule } from './doctorSchedules.js';
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
  const [doctors, setDoctors] = useState([]);
  const [newDoctorName, setNewDoctorName] = useState('');

  const addDoctor = () => {
    if (newDoctorName.trim()) {
      const newDoctor = {
        id: Date.now(),
        name: newDoctorName.trim(),
        backbone: {
          Monday: { "9am-1pm": [], "2pm-6pm": [] },
          Tuesday: { "9am-1pm": [], "2pm-6pm": [] },
          Wednesday: { "9am-1pm": [], "2pm-6pm": [] },
          Thursday: { "9am-1pm": [], "2pm-6pm": [] },
          Friday: { "9am-1pm": [], "2pm-6pm": [] },
        },
        skills: [],
        rotations: {}
      };
      setDoctors([...doctors, newDoctor]);
      setNewDoctorName('');
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

  return (
    <div className="doctor-settings-container">
      <h2>Doctor Schedule Settings</h2>
      
      {/* Add New Doctor Section */}
      <div className="add-doctor-section">
        <h3>Add New Doctor</h3>
        <div className="add-doctor-form">
          <input
            type="text"
            placeholder="Enter doctor name"
            value={newDoctorName}
            onChange={(e) => setNewDoctorName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDoctor()}
          />
          <button onClick={addDoctor}>Add Doctor</button>
        </div>
      </div>

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
        <h3>{doctor.name}</h3>
        <div className="doctor-card-actions">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button onClick={onDelete} className="delete-button">Delete</button>
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

export default DoctorSettings;