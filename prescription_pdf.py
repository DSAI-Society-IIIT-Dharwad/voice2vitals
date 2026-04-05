"""
prescription_pdf.py
===================
Utility to generate professional medical prescriptions as PDFs using fpdf2.
Optimized for Clinical AI Assistant v4.0.
"""

import os
from datetime import datetime
from typing import Any
from fpdf import FPDF
from pathlib import Path

class PrescriptionPDF(FPDF):
    def header(self):
        # Arial bold 15
        self.set_font('helvetica', 'B', 20)
        self.set_text_color(44, 62, 80)  # Dark Blue
        # Title
        self.cell(0, 10, 'Voice2Vitals Clinical AI Assistant', ln=True, align='C')
        # Subtitle
        self.set_font('helvetica', 'I', 10)
        self.set_text_color(127, 140, 141)  # Grey
        self.cell(0, 10, 'Automated Clinical Documentation | Powered by Groq', ln=True, align='C')
        # Line break
        self.ln(5)
        self.set_draw_color(44, 62, 80)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(10)

    def footer(self):
        # Position at 1.5 cm from bottom
        self.set_y(-15)
        # Arial italic 8
        self.set_font('helvetica', 'I', 8)
        self.set_text_color(149, 165, 166)
        # Page number
        self.cell(0, 10, f'Page {self.page_no()} | Generated on {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', align='C')

def generate_pdf_prescription(data: dict[str, Any], output_path: str) -> str:
    """
    Convert ClinicalPrescription dictionary to a professional PDF.
    """
    pdf = PrescriptionPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # --- Header Metadata ---
    pdf.set_font('helvetica', 'B', 12)
    pdf.set_text_color(52, 73, 94)
    
    # Left Side: Patient Info
    patient_name = data.get("Patient_Name", "Not specified")
    age = data.get("Age", "Not specified")
    gender = data.get("Gender", "Not specified")
    
    pdf.cell(100, 7, f"PATIENT: {patient_name.upper()}", ln=False)
    
    # Right Side: Date/Clinic
    clinic = data.get("Clinic_Name", "Voice2Vitals Clinical Center")
    pdf.set_font('helvetica', '', 10)
    pdf.cell(0, 7, f"Clinic: {clinic}", ln=True, align='R')
    
    pdf.set_font('helvetica', 'B', 10)
    pdf.cell(100, 7, f"AGE / GENDER: {age} / {gender}", ln=False)
    pdf.set_font('helvetica', '', 10)
    pdf.cell(0, 7, f"Date: {datetime.now().strftime('%d %B %Y')}", ln=True, align='R')
    
    pdf.ln(10)

    # --- Chief Complaint ---
    pdf.set_fill_color(236, 240, 241)
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, " CHIEF COMPLAINT", ln=True, fill=True)
    pdf.set_font('helvetica', '', 11)
    pdf.multi_cell(0, 8, data.get("Chief_Complaint", "None reported"))
    pdf.ln(5)

    # --- Symptoms ---
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, " SYMPTOMS", ln=True, fill=True)
    pdf.set_font('helvetica', '', 11)
    symptoms = data.get("Symptoms", [])
    if not symptoms:
        pdf.cell(0, 8, "No specific symptoms recorded.", ln=True)
    else:
        for s in symptoms:
            pdf.cell(0, 8, f"  - {s}", ln=True)
    pdf.ln(5)

    # --- Vital Signs ---
    vitals = data.get("Vital_Signs", {})
    has_vitals = any(v and v != "Not recorded" for v in vitals.values())
    if has_vitals:
        pdf.set_font('helvetica', 'B', 12)
        pdf.cell(0, 10, " VITAL SIGNS", ln=True, fill=True)
        pdf.set_font('helvetica', '', 11)
        v_str = []
        for k, v in vitals.items():
            if v and v != "Not recorded":
                v_str.append(f"{k}: {v}")
        pdf.multi_cell(0, 8, " | ".join(v_str))
        pdf.ln(5)

    # --- Diagnosis ---
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, " PROVISIONAL DIAGNOSIS", ln=True, fill=True)
    pdf.set_font('helvetica', 'B', 11)
    pdf.set_text_color(192, 57, 43)  # Red for diagnosis
    pdf.multi_cell(0, 8, data.get("Diagnosis", "Pending clinical correlation"))
    pdf.set_text_color(44, 62, 80)
    pdf.ln(5)

    # --- Medications (Rx Table) ---
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, " Rx - MEDICATIONS", ln=True, fill=True)
    pdf.ln(2)
    
    meds = data.get("Medications", [])
    if not meds:
        pdf.set_font('helvetica', 'I', 11)
        pdf.cell(0, 8, "No medications prescribed.", ln=True)
    else:
        # Table Header
        pdf.set_font('helvetica', 'B', 10)
        pdf.set_fill_color(52, 152, 219)
        pdf.set_text_color(255, 255, 255)
        pdf.cell(70, 8, " Medicine Name", border=1, fill=True)
        pdf.cell(30, 8, " Dosage", border=1, fill=True)
        pdf.cell(60, 8, " Frequency / Duration", border=1, fill=True)
        pdf.cell(30, 8, " Route", border=1, fill=True, ln=True)
        
        pdf.set_text_color(44, 62, 80)
        pdf.set_font('helvetica', '', 10)
        for m in meds:
            pdf.cell(70, 8, f" {m.get('name', '?')}", border=1)
            pdf.cell(30, 8, f" {m.get('dosage', '?')}", border=1)
            pdf.cell(60, 8, f" {m.get('frequency', '?')}", border=1)
            pdf.cell(30, 8, f" {m.get('route', '?')}", border=1, ln=True)
    pdf.ln(5)

    # --- Advice & Follow Up ---
    pdf.set_font('helvetica', 'B', 12)
    pdf.cell(0, 10, " ADVICE & LIFESTYLE", ln=True, fill=True)
    pdf.set_font('helvetica', '', 11)
    advice = data.get("Advice", [])
    for a in advice:
        pdf.cell(0, 8, f"  * {a}", ln=True)
    
    pdf.ln(5)
    pdf.set_font('helvetica', 'B', 11)
    pdf.cell(0, 8, f"FOLLOW-UP: {data.get('Follow_Up', 'As required')}", ln=True)
    
    warnings = data.get("Warnings", "None noted")
    if warnings and warnings != "None noted":
        pdf.set_text_color(192, 57, 43)
        pdf.cell(0, 8, f"WARNINGS: {warnings}", ln=True)
        pdf.set_text_color(44, 62, 80)

    # Save
    pdf.output(output_path)
    return output_path

if __name__ == "__main__":
    # Test generation
    test_data = {
        "Patient_Name": "Bhavik",
        "Age": "28",
        "Gender": "Male",
        "Chief_Complaint": "Severe headache and fever since last night.",
        "Symptoms": ["Fever (101 F)", "Body ache", "Weakness"],
        "Vital_Signs": {"BP": "120/80", "Pulse": "88 bpm"},
        "Diagnosis": "Viral Fever (A90)",
        "Medications": [
            {"name": "Dolo 650", "dosage": "650 mg", "frequency": "One tablet twice a day for 3 days", "route": "oral"}
        ],
        "Advice": ["Drink plenty of water", "Full bed rest"],
        "Follow_Up": "After 3 days"
    }
    generate_pdf_prescription(test_data, "test_prescription.pdf")
    print("Test PDF generated: test_prescription.pdf")
