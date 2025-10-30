# generate_kb_pdf_utf8.py

from fpdf import FPDF

# -----------------------------
# Knowledge base text
# -----------------------------
kb_text = """
Dr. John Smith is a board-certified general practitioner with over 15 years of experience providing comprehensive primary care to patients of all ages. He is dedicated to preventive medicine and patient-centered care, focusing on managing chronic conditions, promoting healthy lifestyles, and providing personalized guidance for each individual...
Dr. John Smith is a board-certified general practitioner with over 15 years of experience providing comprehensive primary care to patients of all ages. He is dedicated to preventive medicine and patient-centered care, focusing on managing chronic conditions, promoting healthy lifestyles, and providing personalized guidance for each individual. His practice emphasizes the importance of both physical and mental well-being, and he works closely with patients to develop long-term health strategies tailored to their needs.

**Services Offered**

1. **Preventive Care:** Routine health check-ups, vaccinations, screenings for diabetes, hypertension, cholesterol, and cancer. Dr. Smith stresses the importance of early detection and regular monitoring to prevent serious health issues. Patients are advised to maintain an updated vaccination schedule and undergo annual wellness exams.

2. **Chronic Disease Management:** Expertise in managing conditions such as diabetes, high blood pressure, asthma, arthritis, and thyroid disorders. Dr. Smith provides individualized treatment plans, monitors medication adherence, and adjusts therapies as needed. He also educates patients on lifestyle changes, diet, and exercise routines that complement medical treatment.

3. **Acute Care:** Diagnosis and treatment of common illnesses such as respiratory infections, influenza, urinary tract infections, gastrointestinal issues, and minor injuries. Dr. Smith emphasizes evidence-based practices and ensures that patients receive the most effective care promptly.

4. **Pediatric Care:** Comprehensive care for children, including growth and development monitoring, immunizations, nutritional counseling, and management of common pediatric conditions such as ear infections, asthma, and allergies.

5. **Women’s Health:** Routine gynecological care including Pap smears, breast examinations, family planning guidance, and menopause management. Dr. Smith collaborates with gynecologists and specialists when advanced care is required.

6. **Mental Health Screening:** Regular evaluation for anxiety, depression, and stress-related conditions. Dr. Smith integrates mental health support into routine check-ups and provides referrals to psychologists or psychiatrists when necessary.

**Clinic Operations**

- **Hours:** Monday to Friday, 9:00 AM – 5:00 PM. Emergency consultations available upon request.
- **Appointments:** Patients are encouraged to schedule in advance. Walk-ins are accepted depending on availability. Online booking is supported through the clinic website.
- **Insurance & Billing:** The clinic supports major insurance providers. Staff assists with claims, billing, and payment plans to reduce patient stress and ensure timely care.

**Telemedicine Services**

Dr. Smith provides virtual consultations for patients who cannot visit in person. Telemedicine appointments are suitable for follow-ups, minor health issues, medication management, and chronic disease monitoring. Patients should provide a brief summary of symptoms, current medications, and relevant medical history prior to the appointment. Secure video platforms are used to maintain patient privacy.

**Patient Education**

Dr. Smith believes patient education is essential for long-term health. During consultations, patients receive guidance on healthy diets, exercise routines, stress management, and lifestyle modifications. Handouts and digital resources are provided for easy reference. Workshops on nutrition, diabetes management, and heart health are organized periodically.

**Common Health Topics Covered**

1. **Diabetes Management:** Blood sugar monitoring, diet plans, insulin administration guidance, and lifestyle modifications to prevent complications.
2. **Hypertension:** Home blood pressure monitoring, medication compliance, dietary sodium reduction, and exercise programs.
3. **Asthma & Respiratory Health:** Trigger identification, inhaler techniques, allergy management, and action plans for asthma attacks.
4. **Weight Management & Nutrition:** Personalized diet plans, tracking progress, and behavioral counseling to promote sustainable weight loss.
5. **Immunizations:** Seasonal flu shots, childhood vaccines, travel vaccinations, and updates for adult immunizations.

**Emergency & Urgent Care**

While the clinic handles most acute conditions, patients experiencing severe symptoms such as chest pain, difficulty breathing, uncontrolled bleeding, or neurological deficits are advised to call emergency services immediately. Dr. Smith coordinates care with local hospitals and specialists when urgent intervention is needed.

**Follow-up & Monitoring**

Regular follow-ups are scheduled based on patient condition and treatment plan. Dr. Smith uses electronic health records to track progress, lab results, and previous visits to ensure continuity of care. Patients are reminded of upcoming appointments via email, SMS, or phone calls.

**Lifestyle & Wellness Guidance**

1. **Exercise:** Recommendations are based on patient age, medical conditions, and fitness level. Dr. Smith encourages a mix of cardiovascular, strength, and flexibility exercises.
2. **Diet & Nutrition:** Emphasis on balanced diets rich in vegetables, fruits, whole grains, and lean proteins. Guidance is given for special conditions like diabetes, hypertension, and high cholesterol.
3. **Stress Management:** Counseling on stress reduction techniques such as mindfulness, meditation, breathing exercises, and time management.
4. **Sleep Hygiene:** Education on the importance of quality sleep, sleep schedules, and environment optimization.

**Medication Counseling**

Dr. Smith ensures patients understand their prescriptions, proper dosages, side effects, and interactions with other medications. Medication adherence is monitored during follow-ups, and alternatives are provided if side effects occur.

**Patient Communication**

Open and clear communication is a cornerstone of Dr. Smith’s practice. Patients are encouraged to ask questions, seek clarification, and participate in decision-making about their health care. Feedback is welcomed to improve service quality.

**Privacy & Confidentiality**

All patient information is treated as strictly confidential. Electronic health records are encrypted and securely stored. Telemedicine sessions are conducted on secure platforms that comply with HIPAA and local privacy regulations.

**Summary**

Dr. John Smith’s clinic provides comprehensive, patient-centered care emphasizing prevention, chronic disease management, and patient education. With a focus on physical and mental health, telemedicine accessibility, and personalized treatment plans, patients can expect a high standard of care tailored to their individual needs. The knowledge base includes information on services, clinic operations, common conditions, patient education, lifestyle guidance, and follow-up protocols. This allows a chatbot using this knowledge base to accurately respond to patient inquiries and provide context-aware guidance on the doctor’s behalf.

"""

# -----------------------------
# PDF Setup
# -----------------------------
pdf = FPDF()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)

# Add a font that supports UTF-8
# Use any TTF font file you have that supports Unicode
# Example: download Arial.ttf or LiberationSans-Regular.ttf
pdf.add_font("ArialUnicode", "", "Arial.ttf", uni=True)
pdf.set_font("ArialUnicode", size=12)

# -----------------------------
# Add the text
# -----------------------------
pdf.multi_cell(0, 8, kb_text)

# -----------------------------
# Output PDF
# -----------------------------
pdf.output("doctor_kb_sample.pdf")
print("PDF generated successfully: doctor_kb_sample.pdf")
