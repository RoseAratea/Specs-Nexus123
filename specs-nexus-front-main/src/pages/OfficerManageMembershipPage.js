import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerLayout from '../components/OfficerLayout';
import {
  getOfficerMemberships,
  createOfficerMembership,
  verifyOfficerMembership,
  getOfficerRequirements,
  updateOfficerRequirement,
  deleteOfficerRequirement,
  uploadOfficerQRCode,
  getQRCode,
  createOfficerRequirement,
} from '../services/officerMembershipService';
import OfficerMembershipModal from '../components/OfficerMembershipModal';
import OfficerDenialReasonModal from '../components/OfficerDenialReasonModal';
import OfficerRequirementModal from '../components/OfficerRequirementModal';
import OfficerQRManagementModal from '../components/OfficerQRManagementModal';
import OfficerAddRequirementModal from '../components/OfficerAddRequirementModal';
import ReceiptModal from '../components/ReceiptModal';
import StatusModal from '../components/StatusModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Loading from '../components/Loading';
import '../styles/OfficerManageMembershipPage.css';

const OfficerManageMembershipPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRequirementModal, setShowRequirementModal] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [showQRManagementModal, setShowQRManagementModal] = useState(false);
  const [showAddRequirementModal, setShowAddRequirementModal] = useState(false);
  const [showDenialReasonModal, setShowDenialReasonModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState(null);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filterBlock, setFilterBlock] = useState('All');
  const [filterYear, setFilterYear] = useState('All');
  const [filterRequirement, setFilterRequirement] = useState('All');
  const [searchName, setSearchName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false,
  });

  const token = localStorage.getItem('officerAccessToken');
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [membershipData, requirementData] = await Promise.all([
        getOfficerMemberships(token),
        getOfficerRequirements(token),
      ]);
      console.log('Membership Data:', membershipData);
      setMemberships(membershipData);
      setRequirements(requirementData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login');
      } else {
        setStatusModal({
          isOpen: true,
          title: 'Error Fetching Data',
          message: 'Failed to load memberships or requirements. Please try again.',
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) {
      navigate('/officer-login');
      return;
    }
    const storedOfficer = localStorage.getItem('officerInfo');
    if (!storedOfficer) {
      navigate('/officer-login');
    } else {
      fetchData();
    }
  }, [token, navigate, fetchData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleVerifyAction = async (membershipId, action) => {
    if (action === 'deny') {
      setSelectedMembershipId(membershipId);
      setShowDenialReasonModal(true);
    } else {
      setConfirmationModal({
        isOpen: true,
        title: 'Approve Membership',
        message: 'Are you sure you want to approve this membership payment?',
        onConfirm: async () => {
          setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
          try {
            await verifyOfficerMembership(membershipId, action, null, token);
            await fetchData();
            setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
            setStatusModal({
              isOpen: true,
              title: 'Membership Approved',
              message: 'The membership payment has been approved successfully.',
              type: 'success',
            });
          } catch (error) {
            console.error('Error approving membership:', error);
            setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
            setStatusModal({
              isOpen: true,
              title: 'Error Approving Membership',
              message: error.response?.data?.detail || 'Failed to approve membership. Please try again.',
              type: 'error',
            });
          }
        },
        isLoading: false,
      });
    }
  };

  const handleDenialReasonSubmit = async (denialReason) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Confirm Denial',
      message: `Are you sure you want to deny this membership payment with reason: "${denialReason}"?`,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await verifyOfficerMembership(selectedMembershipId, 'deny', denialReason, token);
          await fetchData();
          setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          setStatusModal({
            isOpen: true,
            title: 'Membership Denied',
            message: 'The membership payment has been denied successfully.',
            type: 'success',
          });
          setShowDenialReasonModal(false);
          setSelectedMembershipId(null);
        } catch (error) {
          console.error('Error denying membership:', error);
          setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          setStatusModal({
            isOpen: true,
            title: 'Error Denying Membership',
            message: error.response?.data?.detail || 'Failed to deny membership. Please try again.',
            type: 'error',
          });
        }
      },
      isLoading: false,
    });
  };

  const handleSave = async (formData, membershipId) => {
    try {
      if (membershipId) {
        setStatusModal({
          isOpen: true,
          title: 'Update Not Supported',
          message: 'Membership update is not supported in this version.',
          type: 'error',
        });
      } else {
        await createOfficerMembership(formData, token);
        await fetchData();
        setShowModal(false);
        setStatusModal({
          isOpen: true,
          title: 'Membership Created',
          message: 'The membership has been created successfully.',
          type: 'success',
        });
      }
    } catch (error) {
      console.error('Error saving membership:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error Saving Membership',
        message: error.response?.data?.detail || 'Failed to save membership. Please try again.',
        type: 'error',
      });
    }
  };

  const handleQRUpload = async (paymentType, file) => {
    try {
      await uploadOfficerQRCode(paymentType, file, token);
      setShowQRManagementModal(false);
      setStatusModal({
        isOpen: true,
        title: 'QR Code Uploaded',
        message: 'The QR code has been uploaded successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to upload QR code:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error Uploading QR Code',
        message: error.response?.data?.detail || 'Failed to upload QR code. Please try again.',
        type: 'error',
      });
    }
  };

  const handleRequirementUpdate = async (amount) => {
    if (!selectedRequirement || !selectedRequirement.requirement) return;
    try {
      await updateOfficerRequirement(selectedRequirement.requirement, { amount }, token);
      await fetchData();
      setShowRequirementModal(false);
      setSelectedRequirement(null);
      setStatusModal({
        isOpen: true,
        title: 'Requirement Updated',
        message: 'The requirement has been updated successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating requirement:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error Updating Requirement',
        message: error.response?.data?.detail || 'Failed to update requirement. Please try again.',
        type: 'error',
      });
    }
  };

  const handleRequirementArchive = (requirement) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Archive Requirement',
      message: `Are you sure you want to archive the requirement "${requirement}"?`,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteOfficerRequirement(requirement, token);
          await fetchData();
          setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          setStatusModal({
            isOpen: true,
            title: 'Requirement Archived',
            message: 'The requirement has been archived successfully.',
            type: 'success',
          });
        } catch (error) {
          console.error('Error archiving requirement:', error);
          setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          setStatusModal({
            isOpen: true,
            title: 'Error Archiving Requirement',
            message: error.response?.data?.detail || 'Failed to archive requirement. Please try again.',
            type: 'error',
          });
        }
      },
      isLoading: false,
    });
  };

  const handleAddRequirement = async (newReq) => {
    try {
      await createOfficerRequirement(newReq, token);
      await fetchData();
      setShowAddRequirementModal(false);
      setStatusModal({
        isOpen: true,
        title: 'Requirement Added',
        message: 'The new requirement has been added successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error adding requirement:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to add requirement. Please try again.';
      console.error('Full error response:', error.response?.data);
      setStatusModal({
        isOpen: true,
        title: 'Error Adding Requirement',
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const openReceiptModal = (url) => {
    setSelectedReceiptUrl(url);
    setShowReceiptModal(true);
  };

  const formatPaymentMethod = (method) => {
    if (!method) return '-';
    return method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
  };

  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return '-';
    return `₱${parseFloat(amount).toFixed(2)}`;
  };

  const filteredMemberships = memberships.filter((m) => {
    const statusMatch =
      activeTab === 'all'
        ? true
        : (m.payment_status && m.payment_status.toLowerCase() === 'verifying') ||
          (m.status && m.status.toLowerCase() === 'processing');
    const blockMatch = filterBlock === 'All' ? true : m.user?.block === filterBlock;
    const yearMatch = filterYear === 'All' ? true : m.user?.year === filterYear;
    const reqMatch = filterRequirement === 'All' ? true : m.requirement === filterRequirement;
    const nameMatch = searchName === '' ? true : m.user?.full_name.toLowerCase().includes(searchName.toLowerCase());
    return statusMatch && blockMatch && yearMatch && reqMatch && nameMatch;
  });

  const uniqueBlocks = [...new Set(memberships.map((m) => m.user?.block).filter(Boolean))].sort();
  const uniqueYears = [...new Set(memberships.map((m) => m.user?.year).filter(Boolean))].sort();
  const uniqueRequirements = [...new Set(memberships.map((m) => m.requirement).filter(Boolean))].sort();

  if (isLoading) {
    return <Loading message="Loading Officer Info..." />;
  }

  return (
    <OfficerLayout>
      <div className="officer-manage-membership-page">
        <header>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>
            Membership Management
          </h1>
        </header>

        <section className="requirement-section">
          <table className="requirement-table">
            <thead>
              <tr>
                <th>Requirement</th>
                <th>Price</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {requirements.length > 0 ? (
                requirements.map((r) => (
                  <tr key={`req-${r.id}`}>
                    <td>{r.requirement || '-'}</td>
                    <td>{formatPrice(r.amount)}</td>
                    <td>
                      <div className="manage-actions" role="group" aria-label="Manage requirement actions">
                        <button
                          className="btn-edit-icon"
                          onClick={() => {
                            setSelectedRequirement(r);
                            setShowRequirementModal(true);
                          }}
                          aria-label="Edit requirement price"
                          aria-describedby={`edit-tooltip-${r.id}`}
                          title="Edit Price"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <span id={`edit-tooltip-${r.id}`} className="sr-only">Edit requirement price</span>
                        <button
                          className="btn-archive-icon"
                          onClick={() => handleRequirementArchive(r.requirement)}
                          aria-label="Archive requirement"
                          aria-describedby={`archive-tooltip-${r.id}`}
                          title="Archive"
                        >
                          <i className="fas fa-archive"></i>
                        </button>
                        <span id={`archive-tooltip-${r.id}`} className="sr-only">Archive requirement</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>
                    No requirements found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="requirement-management">
            <button className="manage-qr-code-btn" onClick={() => setShowQRManagementModal(true)}>
              Manage QR Code
            </button>
            <button className="add-requirement-btn" onClick={() => setShowAddRequirementModal(true)}>
              Add Requirement
            </button>
          </div>
        </section>

        <section className="membership-tabs">
          <button className={activeTab === 'all' ? 'active' : ''} onClick={() => handleTabChange('all')}>
            ALL MEMBERS
          </button>
          <button className={activeTab === 'verifying' ? 'active' : ''} onClick={() => handleTabChange('verifying')}>
            VERIFYING
          </button>
        </section>

        <section className="additional-filters">
          <div className="filter-item">
            <label>Block</label>
            <select value={filterBlock} onChange={(e) => setFilterBlock(e.target.value)}>
              <option value="All">All Blocks</option>
              {uniqueBlocks.map((block) => (
                <option key={block} value={block}>
                  {block}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Year</label>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="All">All Years</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Requirement</label>
            <select value={filterRequirement} onChange={(e) => setFilterRequirement(e.target.value)}>
              <option value="All">All Requirements</option>
              {uniqueRequirements.map((req) => (
                <option key={req} value={req}>
                  {req}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item filter-search">
            <label>Search Name</label>
            <div className="search-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Enter full name..."
              />
            </div>
          </div>
        </section>

        <section className="table-container">
          <table className="membership-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Block</th>
                <th>Year</th>
                <th>Requirement</th>
                <th>Price</th>
                <th>Payment Type</th>
                <th>Payment Date</th>
                <th>Approval Date</th>
                {activeTab === 'verifying' && <th>Receipt</th>}
                <th>Status</th>
                {activeTab === 'verifying' && <th>Verification</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.length > 0 ? (
                filteredMemberships.map((m) => (
                  <tr key={m.id}>
                    <td>{m.user?.full_name || '-'}</td>
                    <td>{m.user?.block || '-'}</td>
                    <td>{m.user?.year || '-'}</td>
                    <td>{m.requirement || '-'}</td>
                    <td>{formatPrice(m.amount)}</td>
                    <td>{formatPaymentMethod(m.payment_method)}</td>
                    <td>
                      {m.payment_date
                        ? new Date(m.payment_date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '-'}
                    </td>
                    <td>
                      {m.approval_date
                        ? new Date(m.approval_date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '-'}
                    </td>
                    {activeTab === 'verifying' && (
                      <td>
                        {m.receipt_path ? (
                          <img
                            src={m.receipt_path}
                            alt="Receipt"
                            width="50"
                            onClick={() => openReceiptModal(m.receipt_path)}
                            onError={() => console.error(`Failed to load receipt image: ${m.receipt_path}`)}
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                    )}
                    <td>{activeTab === 'verifying' ? (m.status || m.payment_status || '-') : m.payment_status || '-'}</td>
                    {activeTab === 'verifying' && (
                      <td>
                        <div className="verification-actions" role="group" aria-label="Verification actions">
                          <button
                            className="btn-approve-icon"
                            onClick={() => handleVerifyAction(m.id, 'approve')}
                            aria-label="Approve membership"
                            aria-describedby={`approve-tooltip-${m.id}`}
                            title="Approve"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <span id={`approve-tooltip-${m.id}`} className="sr-only">Approve membership</span>
                          <button
                            className="btn-deny-icon"
                            onClick={() => handleVerifyAction(m.id, 'deny')}
                            aria-label="Deny membership"
                            aria-describedby={`deny-tooltip-${m.id}`}
                            title="Deny"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                          <span id={`deny-tooltip-${m.id}`} className="sr-only">Deny membership</span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeTab === 'verifying' ? 11 : 8} style={{ textAlign: 'center', padding: '2rem' }}>
                    No memberships found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <OfficerMembershipModal show={showModal} onClose={() => setShowModal(false)} onSave={handleSave} />
        <OfficerRequirementModal
          show={showRequirementModal}
          requirementData={selectedRequirement}
          onClose={() => {
            setShowRequirementModal(false);
            setSelectedRequirement(null);
          }}
          onSave={handleRequirementUpdate}
        />
        <OfficerQRManagementModal
          show={showQRManagementModal}
          onClose={() => setShowQRManagementModal(false)}
          onQRUpload={handleQRUpload}
        />
        <OfficerAddRequirementModal
          show={showAddRequirementModal}
          onClose={() => setShowAddRequirementModal(false)}
          onSave={handleAddRequirement}
        />
        <OfficerDenialReasonModal
          show={showDenialReasonModal}
          onClose={() => {
            setShowDenialReasonModal(false);
            setSelectedMembershipId(null);
          }}
          onSubmit={handleDenialReasonSubmit}
        />
        <ReceiptModal
          show={showReceiptModal}
          receiptUrl={selectedReceiptUrl}
          onClose={() => setShowReceiptModal(false)}
        />
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Confirm"
          cancelText="Cancel"
          type="danger"
          isLoading={confirmationModal.isLoading}
        />
      </div>
    </OfficerLayout>
  );
};

export default OfficerManageMembershipPage;