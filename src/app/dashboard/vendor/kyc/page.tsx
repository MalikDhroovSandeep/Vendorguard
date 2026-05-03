'use client';

import { useState, useEffect } from 'react';

interface KYCData {
    vendor: {
        id: string;
        businessName: string;
        businessType: string;
        industryCategory: string;
        businessDescription: string | null;
        yearEstablished: number | null;
        kycStatus: string;
    } | null;
    contact: {
        contactName: string;
        designation: string | null;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        pinCode: string;
    } | null;
    kyc: {
        gstNumber: string | null;
        panNumber: string | null;
        businessDocType: string | null;
        businessDocNumber: string | null;
        businessDocAuthority: string | null;
        businessDocIssueDate: string | null;
        // Document URLs
        gstDocument: string | null;
        panDocument: string | null;
        businessDocument: string | null;
    } | null;
}

interface DocumentState {
    gstDocument: string | null;
    panDocument: string | null;
    businessDocument: string | null;
}

export default function KYCPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [kycStatus, setKycStatus] = useState('PENDING');
    const [documents, setDocuments] = useState<DocumentState>({
        gstDocument: null,
        panDocument: null,
        businessDocument: null,
    });
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        industry: '',
        description: '',
        foundedYear: '',
        contactName: '',
        designation: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        gst: '',
        pan: '',
        docType: '',
        docNumber: '',
        issuingAuthority: '',
        issueDate: ''
    });

    useEffect(() => {
        const fetchKYC = async () => {
            try {
                const res = await fetch('/api/vendor/kyc');
                if (res.ok) {
                    const data: KYCData = await res.json();
                    if (data.vendor) {
                        setKycStatus(data.vendor.kycStatus);
                        setFormData(prev => ({
                            ...prev,
                            businessName: data.vendor?.businessName || '',
                            businessType: data.vendor?.businessType || '',
                            industry: data.vendor?.industryCategory || '',
                            description: data.vendor?.businessDescription || '',
                            foundedYear: data.vendor?.yearEstablished?.toString() || '',
                        }));
                    }
                    if (data.contact) {
                        setFormData(prev => ({
                            ...prev,
                            contactName: data.contact?.contactName || '',
                            designation: data.contact?.designation || '',
                            contactEmail: data.contact?.email || '',
                            contactPhone: data.contact?.phone || '',
                            address: data.contact?.address || '',
                            city: data.contact?.city || '',
                            state: data.contact?.state || '',
                            pincode: data.contact?.pinCode || '',
                        }));
                    }
                    if (data.kyc) {
                        setFormData(prev => ({
                            ...prev,
                            gst: data.kyc?.gstNumber || '',
                            pan: data.kyc?.panNumber || '',
                            docType: data.kyc?.businessDocType || '',
                            docNumber: data.kyc?.businessDocNumber || '',
                            issuingAuthority: data.kyc?.businessDocAuthority || '',
                            issueDate: data.kyc?.businessDocIssueDate ? data.kyc.businessDocIssueDate.split('T')[0] : '',
                        }));
                        // Load document URLs
                        setDocuments({
                            gstDocument: data.kyc?.gstDocument || null,
                            panDocument: data.kyc?.panDocument || null,
                            businessDocument: data.kyc?.businessDocument || null,
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch KYC data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchKYC();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: keyof DocumentState) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Invalid file type. Allowed: PDF, JPG, PNG' });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File too large. Maximum size: 5MB' });
            return;
        }

        setUploading(docType);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'kyc');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                setDocuments(prev => ({ ...prev, [docType]: data.url }));
                setMessage({ type: 'success', text: 'Document uploaded successfully!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Upload failed' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
        } finally {
            setUploading(null);
        }
    };

    const handleSubmit = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/vendor/kyc', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessDetails: {
                        businessDescription: formData.description,
                        yearEstablished: formData.foundedYear,
                    },
                    contact: {
                        contactName: formData.contactName,
                        designation: formData.designation,
                        email: formData.contactEmail,
                        phone: formData.contactPhone,
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pinCode: formData.pincode,
                    },
                    kyc: {
                        gstNumber: formData.gst,
                        panNumber: formData.pan,
                        businessDocType: formData.docType || null,
                        businessDocNumber: formData.docNumber,
                        businessDocAuthority: formData.issuingAuthority,
                        businessDocIssueDate: formData.issueDate || null,
                    },
                    documents: {
                        gstDocument: documents.gstDocument,
                        panDocument: documents.panDocument,
                        businessDocument: documents.businessDocument,
                    },
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'KYC data saved successfully!' });
                setKycStatus('SUBMITTED');
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save KYC' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const getStatusDisplay = () => {
        const statusMap: Record<string, { text: string; color: string }> = {
            PENDING: { text: 'Not Submitted', color: 'text-yellow-600 dark:text-yellow-400' },
            SUBMITTED: { text: 'Under Review', color: 'text-blue-600 dark:text-blue-400' },
            VERIFIED: { text: 'Verified', color: 'text-green-600 dark:text-green-400' },
            REJECTED: { text: 'Rejected', color: 'text-red-600 dark:text-red-400' },
        };
        return statusMap[kycStatus] || statusMap.PENDING;
    };

    const statusDisplay = getStatusDisplay();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-500">Loading KYC data...</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile & KYC</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your business identity and compliance details.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                        Status
                    </div>
                    <span className={`flex items-center gap-2 ${statusDisplay.color} font-bold pr-2`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${kycStatus === 'PENDING' ? 'bg-yellow-400 animate-pulse' : kycStatus === 'VERIFIED' ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                        {statusDisplay.text}
                    </span>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section 1: Business Details */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">1</div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Business Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Name</label>
                                <input type="text" name="businessName" value={formData.businessName} placeholder="e.g. Acme Supplies Pvt Ltd" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 cursor-not-allowed" disabled />
                                <p className="text-xs text-slate-500 mt-1">Contact admin to change business name</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Type</label>
                                <input type="text" value={formData.businessType.replace('_', ' ')} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 cursor-not-allowed" disabled />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Industry Category</label>
                                <input type="text" value={formData.industry} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-slate-400 cursor-not-allowed" disabled />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Business Description</label>
                                <textarea name="description" value={formData.description} rows={3} placeholder="Briefly describe your business activities..." className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none" onChange={handleChange}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Year of Establishment</label>
                                <input type="number" name="foundedYear" value={formData.foundedYear} placeholder="YYYY" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Contact & Address */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">2</div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Contact & Address</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact Person Name</label>
                                <input type="text" name="contactName" value={formData.contactName} placeholder="Full Name" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Designation</label>
                                <input type="text" name="designation" value={formData.designation} placeholder="e.g. Sales Manager" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Official Email</label>
                                <input type="email" name="contactEmail" value={formData.contactEmail} placeholder="name@company.com" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                                <input type="tel" name="contactPhone" value={formData.contactPhone} placeholder="+91 98765 43210" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>

                            <div className="col-span-2 border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Registered Office Address</label>
                                <input type="text" name="address" value={formData.address} placeholder="Street Address, Building, Floor" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">City</label>
                                <input type="text" name="city" value={formData.city} placeholder="City" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">State</label>
                                <select name="state" value={formData.state} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-slate-50 dark:hover:bg-slate-700/50" onChange={handleChange}>
                                    <option value="">Select State</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">PIN Code</label>
                                <input type="text" name="pincode" value={formData.pincode} placeholder="123456" className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" onChange={handleChange} />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: KYC Metadata & Actions */}
                <div className="space-y-8">
                    {/* Section 3: KYC Metadata */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">3</div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">KYC Documents</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm uppercase tracking-wide">Tax Registration</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">GST Number</label>
                                        <input type="text" name="gst" value={formData.gst} placeholder="22AAAAA0000A1Z5" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PAN Number</label>
                                        <input type="text" name="pan" value={formData.pan} placeholder="ABCDE1234F" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Document Uploads Section */}
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-3 text-sm uppercase tracking-wide">Upload Documents</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Upload PDF or images (max 5MB each)</p>
                                <div className="space-y-4">
                                    {/* GST Document Upload */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">GST Certificate</label>
                                        <div className="flex items-center gap-2">
                                            <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${documents.gstDocument ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}>
                                                <span className="material-icons-round text-lg text-slate-400">{uploading === 'gstDocument' ? 'hourglass_empty' : documents.gstDocument ? 'check_circle' : 'cloud_upload'}</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                                    {uploading === 'gstDocument' ? 'Uploading...' : documents.gstDocument ? 'Uploaded ✓' : 'Choose file'}
                                                </span>
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload(e, 'gstDocument')} disabled={uploading !== null} />
                                            </label>
                                            {documents.gstDocument && (
                                                <a href={documents.gstDocument} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="View Document">
                                                    <span className="material-icons-round text-lg">visibility</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {/* PAN Document Upload */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">PAN Card</label>
                                        <div className="flex items-center gap-2">
                                            <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${documents.panDocument ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}>
                                                <span className="material-icons-round text-lg text-slate-400">{uploading === 'panDocument' ? 'hourglass_empty' : documents.panDocument ? 'check_circle' : 'cloud_upload'}</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                                    {uploading === 'panDocument' ? 'Uploading...' : documents.panDocument ? 'Uploaded ✓' : 'Choose file'}
                                                </span>
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload(e, 'panDocument')} disabled={uploading !== null} />
                                            </label>
                                            {documents.panDocument && (
                                                <a href={documents.panDocument} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="View Document">
                                                    <span className="material-icons-round text-lg">visibility</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {/* Business Document Upload */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Business Proof Document</label>
                                        <div className="flex items-center gap-2">
                                            <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${documents.businessDocument ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}`}>
                                                <span className="material-icons-round text-lg text-slate-400">{uploading === 'businessDocument' ? 'hourglass_empty' : documents.businessDocument ? 'check_circle' : 'cloud_upload'}</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                                    {uploading === 'businessDocument' ? 'Uploading...' : documents.businessDocument ? 'Uploaded ✓' : 'Choose file'}
                                                </span>
                                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFileUpload(e, 'businessDocument')} disabled={uploading !== null} />
                                            </label>
                                            {documents.businessDocument && (
                                                <a href={documents.businessDocument} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="View Document">
                                                    <span className="material-icons-round text-lg">visibility</span>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-2 text-sm uppercase tracking-wide">Business Proof</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Document Type</label>
                                        <select name="docType" value={formData.docType} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" onChange={handleChange}>
                                            <option value="">Select Document</option>
                                            <option value="REGISTRATION_CERT">Certificate of Incorporation</option>
                                            <option value="UDYAM">Udyam Registration</option>
                                            <option value="TRADE_LICENSE">Trade License</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Document Number</label>
                                        <input type="text" name="docNumber" value={formData.docNumber} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Issuing Authority</label>
                                        <input type="text" name="issuingAuthority" value={formData.issuingAuthority} placeholder="e.g. Govt of India" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Issue Date</label>
                                        <input type="date" name="issueDate" value={formData.issueDate} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-blue-500" onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Actions */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 sticky top-6">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Actions</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Review all details carefully. Once submitted, you cannot edit fields without admin approval.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={saving || kycStatus === 'VERIFIED'}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-icons-round text-sm">send</span>
                                {saving ? 'Submitting...' : kycStatus === 'VERIFIED' ? 'KYC Verified' : 'Submit for Review'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
