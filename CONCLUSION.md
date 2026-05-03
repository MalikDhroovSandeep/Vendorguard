6. Conclusion

6.1 Conclusion

1. System Overview – VendorGuard is a modular, AI-driven web-based platform that automates end-to-end vendor lifecycle management including onboarding, KYC verification, procurement, invoicing, dispute resolution, returns processing, and risk assessment.

2. Integrated Vendor Management Approach – The system combines vendor profile management, procurement workflows, AI-driven risk scoring, performance insight generation, and anomaly detection within a single unified framework accessible through role-based dashboards for Administrators, Internal Users, and Vendors.

3. Hybrid AI Architecture – VendorGuard demonstrates a hybrid model by integrating traditional weighted risk scoring algorithms with supervised machine learning techniques (Logistic Regression, Random Forest) for risk classification, statistical trend analysis for performance insights, and threshold-based deviation analysis (z-score, moving average) for anomaly detection.

4. Modular and Scalable Design – The layered architecture with clear separation between presentation (Next.js, React, Tailwind CSS), business logic (Next.js API Routes), AI/ML (Python, scikit-learn), and data (PostgreSQL, Prisma ORM) layers supports independent module enhancement without impacting existing functionality.

5. Academic and Practical Relevance – The project effectively demonstrates core concepts of vendor risk management, procurement automation, role-based access control, and applied machine learning suitable for both educational and practical enterprise use cases.


6.2 Limitations

1. Limited AI Training Data – The AI risk scoring and classification models are trained on limited and partially synthetic vendor datasets, which may reduce prediction accuracy in large-scale real-world environments with diverse vendor profiles.

2. No Real-Time Event Streaming – The system performs on-demand risk scoring and anomaly detection triggered by API calls rather than through continuous real-time event streaming or live monitoring pipelines.

3. Single-Organisation Scope – The current implementation supports a single organisational tenant and does not provide multi-tenancy or cross-organisation vendor benchmarking capabilities.

4. No Automated Remediation – VendorGuard identifies and classifies vendor risks and anomalies but does not provide automatic mitigation actions such as vendor suspension, order blocking, or escalation workflows triggered without manual intervention.

5. Limited ML Model Explainability – While risk scores and predictions are provided, the system does not currently offer detailed model explainability features (e.g., SHAP values or feature importance visualisations) to help users understand which factors contributed most to a given risk classification.

6. File Upload Size Constraints – Large document uploads (e.g., KYC files exceeding server limits) may result in timeout errors due to the absence of early file size validation middleware before forwarding to Cloudinary.


6.3 Future Scope of the Project

1. Real-Time Event-Driven Processing – Future versions can integrate event streaming (e.g., Apache Kafka or WebSockets) for real-time vendor risk monitoring, live dashboard updates, and instant alerting on critical anomalies.

2. Advanced ML Model Training – The AI component can be improved using larger real-world procurement datasets, advanced ensemble methods, and deep learning techniques for more accurate risk classification and prediction.

3. Multi-Tenant Architecture – The platform can be extended to support multiple organisations with isolated data, allowing enterprise SaaS deployment and cross-organisation vendor benchmarking.

4. Automated Workflow Triggers – Rule-based automation can be added to trigger actions such as vendor suspension, order holds, or compliance escalations when risk thresholds are exceeded, without requiring manual intervention.

5. ML Model Explainability – Integration of explainability tools such as SHAP (Shapley Additive Explanations) or LIME (Local Interpretable Model-agnostic Explanations) to provide transparent, interpretable AI insights for procurement decision-makers.

6. Cloud and Container Deployment – Deployment using Docker containers and cloud platforms (AWS, Azure, or GCP) can improve scalability, portability, and high-availability for production environments.

7. Mobile Application – A native or cross-platform mobile application can be developed using React Native to provide on-the-go vendor management, KYC approvals, and push notifications for field procurement teams.

8. Integration with ERP Systems – APIs can be developed to integrate VendorGuard with existing Enterprise Resource Planning systems (SAP, Oracle) for seamless data exchange and unified procurement workflows.


7. Bibliography

- Next.js Documentation - https://nextjs.org/docs
- React Documentation - https://react.dev
- Tailwind CSS Documentation - https://tailwindcss.com/docs
- TypeScript Documentation - https://www.typescriptlang.org/docs
- Prisma ORM Documentation - https://www.prisma.io/docs
- PostgreSQL Documentation - https://www.postgresql.org/docs
- NextAuth.js Documentation - https://next-auth.js.org
- scikit-learn Documentation - https://scikit-learn.org/stable
- Python Documentation - https://docs.python.org/3
- NumPy Documentation - https://numpy.org/doc
- Cloudinary Documentation - https://cloudinary.com/documentation
- Nodemailer Documentation - https://nodemailer.com
- Chart.js Documentation - https://www.chartjs.org/docs
- jsPDF Documentation - https://raw.githack.com/MrRio/jsPDF/master/docs
- bcryptjs – https://www.npmjs.com/package/bcryptjs
- "Machine Learning for Supply Chain Risk Management" – Baryannis et al., International Journal of Production Research, 2019.
- "Vendor Risk Assessment Using Predictive Analytics" – Chen \u0026 Liu, Journal of Business Research, 2020.
- "Anomaly Detection in Procurement Data" – Hilti et al., IEEE Access, 2021.
- NIST Cybersecurity Framework – https://www.nist.gov/cyberframework
- OWASP Secure Coding Practices – https://owasp.org/www-project-secure-coding-practices-quick-reference-guide
