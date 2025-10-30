import React from "react";

function PatientList({ patients, currentPatient, addPatient, markAsDone, newPatientName, setNewPatientName }) {
  return (
    <div>
      <h2>Current Patient:</h2>
      {currentPatient ? (
        <p style={styles.currentPatient}>{currentPatient}</p>
      ) : (
        <p style={styles.noPatient}>No patient currently being inspected.</p>
      )}

      {currentPatient && (
        <button onClick={markAsDone} style={styles.doneButton}>
          Done (Next Patient)
        </button>
      )}

      

      <input
        type="text"
        value={newPatientName}
        onChange={(e) => setNewPatientName(e.target.value)}
        placeholder="Enter patient's name"
        style={styles.input}
      />
      <button onClick={addPatient} style={styles.addButton}>
        Add Patient
      </button>
    </div>
  );
}

const styles = {
  currentPatient: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#27ae60",
  },
  noPatient: {
    fontSize: "18px",
    color: "#e74c3c",
  },
  doneButton: {
    padding: "10px 20px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px",
  },
  patientList: {
    listStyle: "none",
    padding: 0,
  },
  patientItem: {
    fontSize: "16px",
    backgroundColor: "#ecf0f1",
    padding: "10px",
    margin: "5px",
    borderRadius: "5px",
  },
  input: {
    padding: "10px",
    margin: "10px",
    width: "200px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px",
  },
};

export default PatientList;
