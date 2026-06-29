# YouTube Demo Video Script - FIXIT AI AGENT

**Duration**: 5 Minutes
**Format**: Screen Share + Voiceover + Webcam Overlay

---

## 00:00 - 00:45 | 1. The Problem (Visual: Problem Slide or Stock Video)

* **Speaker**: "Every day, thousands of homeowners and businesses across Cameroon and other African nations struggle with maintenance repairs. Need a plumber? An electrician? Or AC repair? Finding a trusted technician is frustrating. You can't describe the issue clearly, you don't know who to trust, prices are volatile, and scheduling is a nightmare. This leads to slow responses, lost business revenue, and constant friction."
* **Visual**: Show the Landing Page of FIXIT AI AGENT. Scroll down to highlight the challenges: "Difficulty describing issues, pricing uncertainty, scheduling problems."

---

## 00:45 - 01:30 | 2. The Solution (Visual: Live Dashboard Walkthrough)

* **Speaker**: "Meet **FIXIT AI AGENT**, an AI-powered artisan dispatching and repair management platform built on Google ADK and Model Context Protocol. By combining a beautiful React frontend with a sophisticated multi-agent pipeline, we automate the entire repair journey: intake, diagnosis, matching, quotation, and booking."
* **Visual**: Show the Customer Dashboard. Point out the summaries: "Repair Requests", "Pending Quotes", "Active Bookings". Click on "File Repair Request".

---

## 01:30 - 02:30 | 3. Multi-Agent & MCP Architecture (Visual: Systems Architecture Diagram)

* **Speaker**: "Under the hood, FIXIT orchestrates seven specialized agents using the Google ADK framework. 
  1. The **Intake Agent** collects descriptions.
  2. The **Diagnosis Agent** determines trade category and urgency.
  3. The **Matching Agent** uses our custom MCP Location Tool to query the database and rank local artisans by proximity and ratings.
  4. The **Cost Estimation Agent** calculates labor, parts, and travel fees.
  5. The **Scheduling Agent** books the job.
  All agents call database tools via a unified **Model Context Protocol (MCP)** server, reading and writing live data directly in MongoDB."
* **Visual**: Transition to the README.md showing the Mermaid architecture diagrams. Zoom into the ADK and MCP interaction.

---

## 02:30 - 04:15 | 4. Live Demonstration (Visual: Live Web App Run)

* **Speaker**: "Let's see it in action. I'm a customer in Yaoundé, and my AC unit is leaking water. I'll type that in. As I click submit, the Intake and Diagnosis agents process my message. 
  Within seconds, the AC category is classified, and the diagnosis is logged. The Matching agent has found Boris Talla, an AC Specialist in Yaoundé. 
  Now, checking my Estimates tab, the Cost Estimation agent has generated a detailed quotation of 25,000 FCFA. 
  I'll accept it. Now in Appointments, I can choose a date and confirm the booking. The Scheduling agent updates the calendar and dispatches an in-app alert."
* **Visual**: Type "My AC is leaking water" in the Repair Request Page. Show the AI response generating. Go to the Estimate Page and click Accept. Go to the Appointment Page and select a date, then click Confirm. Navigate to the Notification Center to show the confirmation alert.

---

## 04:15 - 05:00 | 5. Security & Business Impact (Visual: Analytics Page)

* **Speaker**: "Security is a core priority. All endpoints are secured using JWT, request validation, and rate limiters, while the ADK system prompts are protected against prompt injection. 
  For administrators, our Business Analytics Agent aggregates database statistics into a premium, real-time dashboard tracking revenue projections, technician utilization, and customer satisfaction.
  FIXIT is portofolio-ready and deploys instantly on free-tier services like Vercel and Render. Thank you for watching our Kaggle Capstone demonstration!"
* **Visual**: Show the Admin Dashboard with the list of artisans and jobs queue. Then click on the Analytics Dashboard to show the progress bars and revenue metrics. End with a slide showing links to the GitHub repository and writeup.
