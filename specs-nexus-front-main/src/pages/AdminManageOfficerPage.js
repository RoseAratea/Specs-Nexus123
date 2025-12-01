import React, { useEffect, useState, useCallback } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import {
  getOfficers,
  getUsers,
  createOfficersBulk,
  deleteOfficer,
} from '../services/officerService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusModal from '../components/StatusModal';
import Loading from '../components/Loading';
import '../styles/AdminManageOfficerPage.css';

const ITEMS_PER_PAGE = 10;

const AdminManageOfficerPage = () => {
  const [officers, setOfficers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedOfficerIds, setSelectedOfficerIds] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
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

  const currentAdmin = JSON.parse(localStorage.getItem('officerInfo') || '{}');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [officersData, usersData] = await Promise.all([getOfficers(), getUsers()]);
      const filteredOfficers = officersData.filter((officer) => officer.id !== currentAdmin.id);
      setOfficers(filteredOfficers);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setStatusModal({
        isOpen: true,
        title: 'Error Fetching Data',
        message: 'Failed to load officers and users. Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAdmin.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePromoteStudents = () => {
    setShowUserModal(true);
  };

  const handleRevoke = (officerId) => {
    setConfirmationModal({
      isOpen: true,
      title: 'Demote Officer Status',
      message: 'Are you sure you want to demote this officer’s status? This action cannot be undone.',
      onConfirm: () => confirmRevoke(officerId),
      isLoading: false,
    });
  };

  const confirmRevoke = async (officerId) => {
    setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await deleteOfficer(officerId);
      await fetchData();
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      setStatusModal({
        isOpen: true,
        title: 'Officer Status Demoted',
        message: 'The officer’s status has been successfully demoted.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to demote officer status:', error);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      setStatusModal({
        isOpen: true,
        title: 'Error Revoking Officer Status',
        message: error.response?.data?.message || 'Failed to demote the officer’s status. Please try again.',
        type: 'error',
      });
    }
  };

  const handleBulkRevoke = () => {
    if (selectedOfficerIds.length === 0) {
      setStatusModal({
        isOpen: true,
        title: 'No Selection',
        message: 'Please select at least one officer to demote.',
        type: 'error',
      });
      return;
    }
    setConfirmationModal({
      isOpen: true,
      title: 'Demote Selected Officer Status',
      message: `Are you sure you want to demote the officer status of ${selectedOfficerIds.length} officer(s)? This action cannot be undone.`,
      onConfirm: confirmBulkRevoke,
      isLoading: false,
    });
  };

  const confirmBulkRevoke = async () => {
    setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await Promise.all(selectedOfficerIds.map((id) => deleteOfficer(id)));
      await fetchData();
      setSelectedOfficerIds([]);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      setStatusModal({
        isOpen: true,
        title: 'Officer Status Demoted',
        message: 'Selected officers’ status has been successfully demoted.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to demote selected officers’ status:', error);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      setStatusModal({
        isOpen: true,
        title: 'Error Revoking Officer Status',
        message: error.response?.data?.message || 'Failed to demote selected officers’ status. Please try again.',
        type: 'error',
      });
    }
  };

  const handleCheckboxChange = (officerId, isChecked) => {
    setSelectedOfficerIds((prev) =>
      isChecked ? [...prev, officerId] : prev.filter((id) => id !== officerId)
    );
  };

  const handleUserCheckboxChange = (userId, isChecked) => {
    setSelectedUserIds((prev) =>
      isChecked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setConfirmationModal({
        isOpen: true,
        title: 'Select All Officers',
        message: `Are you sure you want to select all ${filteredOfficers.length} officers?`,
        onConfirm: () => {
          setSelectedOfficerIds(filteredOfficers.map((o) => o.id));
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        },
        isLoading: false,
      });
    } else {
      setSelectedOfficerIds([]);
    }
  };

  const handleSelectAllUsers = (isChecked) => {
    if (isChecked) {
      setConfirmationModal({
        isOpen: true,
        title: 'Select All Students',
        message: `Are you sure you want to select all ${filteredUsers.length} filtered students?`,
        onConfirm: () => {
          setSelectedUserIds(filteredUsers.map((u) => u.id));
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        },
        isLoading: false,
      });
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUserIds([]);
    setUserSearchQuery('');
    setYearFilter('');
    setBlockFilter('');
  };

  const handleCloseStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseConfirmationModal = () => {
    if (!confirmationModal.isLoading) {
      setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handlePromote = async () => {
    if (selectedUserIds.length === 0) {
      setStatusModal({
        isOpen: true,
        title: 'No Selection',
        message: 'Please select at least one student to promote.',
        type: 'error',
      });
      return;
    }
    setConfirmationModal({
      isOpen: true,
      title: 'Promote Students to Officers',
      message: `Are you sure you want to promote ${selectedUserIds.length} student(s) to officers?`,
      onConfirm: confirmPromote,
      isLoading: false,
    });
  };

  const confirmPromote = async () => {
    setConfirmationModal((prev) => ({ ...prev, isLoading: true }));
    try {
      await createOfficersBulk(selectedUserIds, 'Officer');
      setStatusModal({
        isOpen: true,
        title: 'Students Promoted',
        message: 'Selected students have been promoted to officers successfully!',
        type: 'success',
      });
      setShowUserModal(false);
      setSelectedUserIds([]);
      setUserSearchQuery('');
      setYearFilter('');
      setBlockFilter('');
      await fetchData();
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    } catch (error) {
      console.error('Failed to promote students:', error);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      setStatusModal({
        isOpen: true,
        title: 'Error Promoting Students',
        message: error.response?.data?.message || 'Failed to promote selected students to officers. Please try again.',
        type: 'error',
      });
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredOfficers = officers
    .filter(
      (officer) =>
        (officer.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (officer.student_number || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((officer) => (yearFilter ? officer.year === yearFilter : true))
    .filter((officer) => (blockFilter ? officer.block === blockFilter : true));

  const filteredUsers = users
    .filter(
      (user) =>
        (user.full_name || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (user.student_number || '').toLowerCase().includes(userSearchQuery.toLowerCase())
    )
    .filter((user) => (yearFilter ? user.year === yearFilter : true))
    .filter((user) => (blockFilter ? user.block === blockFilter : true));

  const sortedOfficers = filteredOfficers.sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    if (sortConfig.direction === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    }
    return bValue.toString().localeCompare(aValue.toString());
  });

  const paginatedOfficers = sortedOfficers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(sortedOfficers.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const uniqueYears = [...new Set(officers.map((officer) => officer.year).filter(Boolean))].sort();
  const uniqueBlocks = [...new Set(officers.map((officer) => officer.block).filter(Boolean))].sort();
  const uniqueUserYears = [...new Set(users.map((user) => user.year).filter(Boolean))].sort();
  const uniqueUserBlocks = [...new Set(users.map((user) => user.block).filter(Boolean))].sort();

  if (isLoading) return <Loading message="Loading Officers and Students..." />;

  return (
    <OfficerLayout>
      <main className="z-container">
       
        <div className="z-filters">
          <input
            type="text"
            className="z-input z-search-bar"
            placeholder="Search by name or student number"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search officers"
          />
          <select
            className="z-select z-year-filter"
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by year"
          >
            <option value="">All Years</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            className="z-select z-block-filter"
            value={blockFilter}
            onChange={(e) => {
              setBlockFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by block"
          >
            <option value="">All Blocks</option>
            {uniqueBlocks.map((block) => (
              <option key={block} value={block}>
                {block}
              </option>
            ))}
          </select>
        </div>

        <div className={`z-counter ${selectedOfficerIds.length > 0 ? 'has-selection' : ''}`}>
          <span>
            Showing {filteredOfficers.length} officer{filteredOfficers.length !== 1 ? 's' : ''}
          </span>
          <div className="z-counter-actions">
            
            <button
              className="z-btn z-btn-danger z-btn-demote-selected"
              onClick={handleBulkRevoke}
              disabled={selectedOfficerIds.length === 0}
            >
              <i className="fas fa-trash"></i> Demote Selected
            </button>
            <button
              className="z-btn z-btn-secondary"
              onClick={handlePromoteStudents}
            >
              <i className="fas fa-users"></i> Promote Students
            </button>
          </div>
        </div>

        <div className="z-table-container">
          <table className="z-table">
            <thead>
              <tr>
                <th className="z-table-checkbox">
                  <input
                    type="checkbox"
                    className="z-checkbox"
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedOfficerIds.length === filteredOfficers.length && filteredOfficers.length > 0}
                    aria-label="Select all officers"
                  />
                </th>
                <th onClick={() => handleSort('full_name')}>
                  Full Name {sortConfig.key === 'full_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('email')}>
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('year')}>
                  Year {sortConfig.key === 'year' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('block')}>
                  Block {sortConfig.key === 'block' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('position')}>
                  Position {sortConfig.key === 'position' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOfficers.length > 0 ? (
                paginatedOfficers.map((officer) => (
                  <tr
                    key={officer.id}
                    className="z-table-row"
                  >
                    <td>
                      <input
                        type="checkbox"
                        className="z-checkbox"
                        checked={selectedOfficerIds.includes(officer.id)}
                        onChange={(e) => handleCheckboxChange(officer.id, e.target.checked)}
                        aria-label={`Select officer ${officer.full_name}`}
                      />
                    </td>
                    <td>{officer.full_name ? `${officer.full_name} (${officer.student_number || '-'})` : '-'}</td>
                    <td>{officer.email || '-'}</td>
                    <td>{officer.year || '-'}</td>
                    <td>{officer.block || '-'}</td>
                    <td>{officer.position || '-'}</td>
                    <td>
                      <button
                        className="z-btn z-btn-danger z-btn-sm"
                        onClick={() => handleRevoke(officer.id)}
                      >
                        <i className="fas fa-trash"></i> Demote
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="z-no-data">
                    No officers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="z-pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`z-page-btn ${currentPage === page ? 'z-page-btn-active' : ''}`}
                onClick={() => handlePageChange(page)}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        {showUserModal && (
          <div className="z-modal-overlay" onClick={handleCloseUserModal}>
            <div className="z-modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="z-modal-header">
                <h2 className="z-modal-title">Promote Students to Officers</h2>
                <div className="z-modal-header-controls">
                  <button
                    className="z-btn z-btn-primary"
                    onClick={handlePromote}
                    disabled={selectedUserIds.length === 0}
                  >
                    <i className="fas fa-save"></i> Promote Students
                  </button>
                  <button className="z-btn z-btn-ghost" onClick={handleCloseUserModal} aria-label="Close modal">
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className="z-modal-content">
                <div className="z-filters">
                  <input
                    type="text"
                    className="z-input z-search-bar"
                    placeholder="Search by name or student number"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    aria-label="Search students"
                  />
                  <select
                    className="z-select z-year-filter"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    aria-label="Filter by year"
                  >
                    <option value="">All Years</option>
                    {uniqueUserYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    className="z-select z-block-filter"
                    value={blockFilter}
                    onChange={(e) => setBlockFilter(e.target.value)}
                    aria-label="Filter by block"
                  >
                    <option value="">All Blocks</option>
                    {uniqueUserBlocks.map((block) => (
                      <option key={block} value={block}>
                        {block}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="z-counter">
                  Showing {filteredUsers.length} student{filteredUsers.length !== 1 ? 's' : ''}
                </div>

                {filteredUsers.length === 0 && userSearchQuery && (
                  <p className="z-no-results">
                    No students found matching {userSearchQuery}.
                  </p>
                )}

                <div className="z-table-container">
                  <table className="z-table">
                    <thead>
                      <tr>
                        <th className="z-table-checkbox">
                          <input
                            type="checkbox"
                            className="z-checkbox"
                            onChange={(e) => handleSelectAllUsers(e.target.checked)}
                            checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                            aria-label="Select all students"
                          />
                        </th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Year</th>
                        <th>Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="z-table-row">
                            <td>
                              <input
                                type="checkbox"
                                className="z-checkbox"
                                checked={selectedUserIds.includes(user.id)}
                                onChange={(e) => handleUserCheckboxChange(user.id, e.target.checked)}
                                aria-label={`Select student ${user.full_name}`}
                              />
                            </td>
                            <td>{user.full_name ? `${user.full_name} (${user.student_number || '-'})` : '-'}</td>
                            <td>{user.email || '-'}</td>
                            <td>{user.year || '-'}</td>
                            <td>{user.block || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="z-no-data">
                            {userSearchQuery ? 'No matching students found.' : 'No students available.'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="z-modal-footer">
                  <button className="z-btn z-btn-ghost" onClick={handleCloseUserModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleCloseStatusModal}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Confirm"
          cancelText="Cancel"
          type="danger"
          icon="fa-exclamation-triangle"
          isLoading={confirmationModal.isLoading}
        />
      </main>
    </OfficerLayout>
  );
};

export default AdminManageOfficerPage;