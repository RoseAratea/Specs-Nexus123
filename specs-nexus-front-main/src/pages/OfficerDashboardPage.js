import React, { useEffect, useState, useCallback } from 'react';
import { getDashboardAnalytics } from '../services/analyticsService';
import { getUsers } from '../services/officerService';
import OfficerLayout from '../components/OfficerLayout';
import Loading from '../components/Loading';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
import { FaChevronDown, FaChevronUp, FaRedo, FaFileExcel } from 'react-icons/fa';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import '../styles/OfficerDashboardPage.css';

const OfficerDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState({
    membership: false,
    payment: false,
    events: false,
    clearance: false,
  });
  const [paymentTab, setPaymentTab] = useState('all');
  const [visibleSeries, setVisibleSeries] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    membership: false,
    payment: false,
    events: false,
    clearance: false,
  });
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [yearFilter, setYearFilter] = useState('All Years');
  const [blockFilter, setBlockFilter] = useState('All Blocks');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const token = localStorage.getItem('officerAccessToken');

  const yearOptions = ['All Years', '1st Year', '2nd Year', '3rd Year', '4th Year'];
  const blockOptions = ['All Blocks', 'A', 'B', 'C', 'D', 'E', 'F'];
  const statusOptions = ['All Statuses', 'Active', 'Inactive'];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (token) {
        setSectionLoading({ membership: true, payment: true, events: true, clearance: true });
        const [analyticsData, usersData] = await Promise.all([
          getDashboardAnalytics(token, {
            start_date: '2023-01-01T00:00:00Z',
            end_date: '2025-12-31T23:59:59Z',
            include_archived: false
          }),
          getUsers(token),
        ]);
        console.log('Raw Analytics Data:', JSON.stringify(analyticsData, null, 2));
        console.log('Users Data:', usersData);
        if (!analyticsData || typeof analyticsData !== 'object') {
          throw new Error('Invalid analytics data received');
        }
        setAnalytics(analyticsData);
        setUsers(usersData);
        setFilteredUsers(usersData);
        setVisibleSeries({
          paymentDetails: { Verifying: true, Paid: true, 'Not Paid': true },
          events: { participant_count: true },
          popularEvents: analyticsData?.eventsEngagement?.popularEvents?.reduce((acc, evt) => ({ ...acc, [evt.title]: true }), {}) || {},
          clearanceByRequirement: { Clear: true, Processing: true, 'Not Yet Cleared': true },
          complianceByYear: { Clear: true, Processing: true, 'Not Yet Cleared': true },
        });
      } else {
        console.warn('No officerAccessToken found in localStorage');
        setError('Authentication token missing. Please log in again.');
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError(`Failed to load dashboard data: ${error.message}`);
      setAnalytics(null);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
      setSectionLoading({ membership: false, payment: false, events: false, clearance: false });
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log('Analytics State Updated:', JSON.stringify(analytics, null, 2));
  }, [analytics]);

  useEffect(() => {
    let filtered = users;
    if (yearFilter !== 'All Years') {
      filtered = filtered.filter(user => (user.year || '') === yearFilter);
    }
    if (blockFilter !== 'All Blocks') {
      filtered = filtered.filter(user => (user.block || '') === blockFilter);
    }
    if (statusFilter !== 'All Statuses') {
      filtered = filtered.filter(user => 
        statusFilter === 'Active' ? isUserActive(user.last_active) : !isUserActive(user.last_active)
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        (user.full_name || '').toLowerCase().includes(query) ||
        (user.email || '').toLowerCase().includes(query) ||
        (user.student_number || '').toLowerCase().includes(query)
      );
    }
    setFilteredUsers(filtered);
  }, [yearFilter, blockFilter, statusFilter, searchQuery, users]);

  const handleLegendClick = (chartKey, dataKey) => {
    setVisibleSeries(prev => ({
      ...prev,
      [chartKey]: {
        ...prev[chartKey],
        [dataKey]: !prev[chartKey][dataKey],
      },
    }));
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePaymentTabChange = (tab) => {
    setPaymentTab(tab);
  };

  const handleYearFilter = (year) => {
    setYearFilter(year);
  };

  const handleBlockFilter = (block) => {
    setBlockFilter(block);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const isUserActive = (lastActive) => {
    if (!lastActive) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(lastActive) >= thirtyDaysAgo;
  };

  if (isLoading) {
    return <Loading message="Loading Officer Dashboard..." />;
  }

  if (error || !analytics) {
    return (
      <OfficerLayout>
        <div className="error-message">
          {error || 'Unable to load dashboard data. Please try again later.'}
          <button
            onClick={fetchData}
            className="retry-button"
            aria-label="Retry loading data"
          >
            <FaRedo className="inline-block mr-2" /> Retry
          </button>
        </div>
      </OfficerLayout>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const membershipInsights = analytics.membershipInsights || {};
  const paymentAnalytics = analytics.paymentAnalytics || {};
  const preferredPaymentData = paymentAnalytics.preferredPaymentMethods || [];
  console.log('preferredPaymentData:', preferredPaymentData);
  
  const transformPaymentDetails = (data) => {
    const arr = [];
    Object.entries(data || {}).forEach(([requirement, years]) => {
      Object.entries(years || {}).forEach(([year, statuses]) => {
        arr.push({
          label: `${requirement} (${year})`,
          requirement,
          year,
          Verifying: statuses.Verifying || 0,
          Paid: statuses.Paid || 0,
          'Not Paid': statuses['Not Paid'] || 0,
        });
      });
    });
    return arr;
  };
  const paymentDetailsData = transformPaymentDetails(paymentAnalytics.byRequirementAndYear);

  const semesterPaymentData = paymentTab === '1st'
    ? preferredPaymentData.map(method => ({
        method: method.method,
        count: method.firstSemCount || 0,
      }))
    : paymentTab === '2nd'
    ? preferredPaymentData.map(method => ({
        method: method.method,
        count: method.secondSemCount || 0,
      }))
    : preferredPaymentData;
  console.log('semesterPaymentData:', semesterPaymentData, 'paymentTab:', paymentTab);

  const hasPaymentData = semesterPaymentData.length > 0 && semesterPaymentData.some(item => item.count > 0);

  const paymentStats = {
    verifying: paymentTab === '1st'
      ? (paymentAnalytics.verifyingFirstSem || 0)
      : paymentTab === '2nd'
      ? (paymentAnalytics.verifyingSecondSem || 0)
      : ((paymentAnalytics.verifyingFirstSem || 0) + (paymentAnalytics.verifyingSecondSem || 0)),
    paid: paymentTab === '1st'
      ? (paymentAnalytics.paidFirstSem || 0)
      : paymentTab === '2nd'
      ? (paymentAnalytics.paidSecondSem || 0)
      : ((paymentAnalytics.paidFirstSem || 0) + (paymentAnalytics.paidSecondSem || 0)),
    notPaid: paymentTab === '1st'
      ? (paymentAnalytics.notPaidFirstSem || 0)
      : paymentTab === '2nd'
      ? (paymentAnalytics.notPaidSecondSem || 0)
      : ((paymentAnalytics.notPaidFirstSem || 0) + (paymentAnalytics.notPaidSecondSem || 0)),
  };

  const eventsEngagement = analytics.eventsEngagement || {};
  const eventsData = eventsEngagement.events || [];
  const popularEvents = eventsEngagement.popularEvents || [];
  const popularEventsPieData = popularEvents.map(evt => ({
    name: evt.title,
    value: evt.participant_count || 0,
  }));
  console.log('eventsData:', eventsData);

  const clearanceTracking = analytics.clearanceTracking || {};
  const clearanceByRequirementData = Object.entries(clearanceTracking.byRequirement || {}).map(
    ([requirement, statuses]) => ({
      requirement,
      Clear: statuses.Clear || 0,
      Processing: statuses.Processing || 0,
      'Not Yet Cleared': statuses['Not Yet Cleared'] || 0,
    })
  );
  const complianceByYearData = Object.entries(clearanceTracking.complianceByYear || {}).map(
    ([year, statuses]) => ({
      year,
      Clear: statuses.Clear || 0,
      Processing: statuses.Processing || 0,
      'Not Yet Cleared': statuses['Not Yet Cleared'] || 0,
    })
  );
  console.log('clearanceByRequirementData:', clearanceByRequirementData);
  console.log('complianceByYearData:', complianceByYearData);

  const handleGenerateReport = async () => {
    try {
      const API_URL =
        process.env.REACT_APP_API_URL ||
        (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
          ? 'http://localhost:8000'
          : 'https://specs-nexus.onrender.com');
      
      const reportUrl = `${API_URL}/analytics/report/officer-dashboard`;
      console.log('Generating report from:', reportUrl);
      
      const response = await fetch(reportUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Report response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Report generation failed:', response.status, errorText);
        throw new Error(`Failed to generate report: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `officer-dashboard-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      setError(`Failed to generate report: ${error.message}. Please try again.`);
    }
  };

  return (
    <OfficerLayout>
      <div className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            onClick={handleGenerateReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            <FaFileExcel /> Generate Report
          </button>
        </div>
        {/* Student Insights */}
        <div className="card">
          <div className="section-header" onClick={() => toggleSection('membership')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('membership')}>
            <h2>Student Insights</h2>
            {collapsedSections.membership ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
          </div>
          {!collapsedSections.membership && (
            sectionLoading.membership ? (
              <Loading message="Loading Student Insights..." />
            ) : (
              <div className="section-content">
                {membershipInsights.totalBSCSStudents === 0 ? (
                  <p className="no-data">No BSCS students registered in the system. Please add users to display student insights.</p>
                ) : (
                  <>
                    <div className="stats-grid">
                      <div className="stat-box" data-tooltip-id="bscs-students-tooltip" data-tooltip-content="Total number of BSCS students registered">
                        <p>Total BSCS Students</p>
                        <h3>{membershipInsights.totalBSCSStudents || 0}</h3>
                      </div>
                      <div className="stat-box" data-tooltip-id="active-members-tooltip" data-tooltip-content="Members active in the last 30 days">
                        <p>Active Members</p>
                        <h3>{membershipInsights.activeMembers || 0}</h3>
                      </div>
                      <div className="stat-box" data-tooltip-id="inactive-members-tooltip" data-tooltip-content="Members not active in the last 30 days or never active">
                        <p>Inactive Members</p>
                        <h3>{membershipInsights.inactiveMembers || 0}</h3>
                      </div>
                    </div>
                    <div className="table-box">
                      <div className="table-header">
                        <h4>BSCS Students</h4>
                        <div className="filters">
                          <input
                            type="text"
                            className="search-bar"
                            placeholder="Search by name, email, or student number..."
                            value={searchQuery}
                            onChange={handleSearch}
                            aria-label="Search students"
                          />
                          <select
                            className="filter-select"
                            value={yearFilter}
                            onChange={(e) => handleYearFilter(e.target.value)}
                            aria-label="Filter by year"
                          >
                            {yearOptions.map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                          <select
                            className="filter-select"
                            value={blockFilter}
                            onChange={(e) => handleBlockFilter(e.target.value)}
                            aria-label="Filter by block"
                          >
                            {blockOptions.map(block => (
                              <option key={block} value={block}>{block}</option>
                            ))}
                          </select>
                          <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            aria-label="Filter by status"
                          >
                            {statusOptions.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {filteredUsers.length > 0 ? (
                        <div className="table-container">
                          <table className="student-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Student Number</th>
                                <th>Year</th>
                                <th>Block</th>
                                <th>Email</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredUsers.map(user => (
                                <tr key={user.id}>
                                  <td>{user.id}</td>
                                  <td>{user.full_name || 'N/A'}</td>
                                  <td>{user.student_number || 'N/A'}</td>
                                  <td>{user.year || 'N/A'}</td>
                                  <td>{user.block || 'N/A'}</td>
                                  <td>{user.email || 'N/A'}</td>
                                  <td>{isUserActive(user.last_active) ? 'Active' : 'Inactive'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : <p className="no-data">No BSCS students found.</p>}
                    </div>
                  </>
                )}
              </div>
            )
          )}
        </div>

        {/* Payment Analytics */}
        <div className="card">
          <div className="section-header" onClick={() => toggleSection('payment')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('payment')}>
            <h2>Payment Analytics</h2>
            {collapsedSections.payment ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
          </div>
          {!collapsedSections.payment && (
            sectionLoading.payment ? (
              <Loading message="Loading Payment Analytics..." />
            ) : (
              <div className="section-content">
                <div className="tabs">
                  <button
                    className={`tab-button ${paymentTab === 'all' ? 'active' : ''}`}
                    onClick={() => handlePaymentTabChange('all')}
                    aria-label="Show all semesters payment data"
                  >
                    All Semesters
                  </button>
                  <button
                    className={`tab-button ${paymentTab === '1st' ? 'active' : ''}`}
                    onClick={() => handlePaymentTabChange('1st')}
                    aria-label="Show 1st semester payment data"
                  >
                    1st Semester
                  </button>
                  <button
                    className={`tab-button ${paymentTab === '2nd' ? 'active' : ''}`}
                    onClick={() => handlePaymentTabChange('2nd')}
                    aria-label="Show 2nd semester payment data"
                  >
                    2nd Semester
                  </button>
                </div>
                <div className="stats-grid">
                  <div className="stat-box" data-tooltip-id="verifying-tooltip" data-tooltip-content="Payments under verification">
                    <p>Verifying</p>
                    <h3>{paymentStats.verifying}</h3>
                  </div>
                  <div className="stat-box" data-tooltip-id="paid-tooltip" data-tooltip-content="Members with confirmed payments">
                    <p>Paid</p>
                    <h3>{paymentStats.paid}</h3>
                  </div>
                  <div className="stat-box" data-tooltip-id="not-paid-tooltip" data-tooltip-content="Members who haven't paid">
                    <p>Not Paid</p>
                    <h3>{paymentStats.notPaid}</h3>
                  </div>
                </div>
                <div className="chart-box">
                  <h4>Preferred Payment Methods</h4>
                  {hasPaymentData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={semesterPaymentData}
                          dataKey="count"
                          nameKey="method"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#3B82F6"
                          label
                        >
                          {semesterPaymentData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('preferredPayment', e.dataKey)} verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="no-data">No payment method data available. Ensure payments have been recorded with valid payment methods.</p>}
                </div>
                <div className="chart-box">
                  <h4>Payment Details by Requirement & Year</h4>
                  {paymentDetailsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={paymentDetailsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('paymentDetails', e.dataKey)} verticalAlign="bottom" />
                        {visibleSeries.paymentDetails?.Verifying && (
                          <Bar dataKey="Verifying" fill="#F59E0B" />
                        )}
                        {visibleSeries.paymentDetails?.Paid && (
                          <Bar dataKey="Paid" fill="#10B981" />
                        )}
                        {visibleSeries.paymentDetails?.['Not Paid'] && (
                          <Bar dataKey="Not Paid" fill="#EF4444" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="no-data">No payment details data available.</p>}
                </div>
              </div>
            )
          )}
        </div>

        {/* Events Engagement */}
        <div className="card">
          <div className="section-header" onClick={() => toggleSection('events')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('events')}>
            <h2>Events Engagement</h2>
            {collapsedSections.events ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
          </div>
          {!collapsedSections.events && (
            sectionLoading.events ? (
              <Loading message="Loading Events Engagement..." />
            ) : (
              <div className="section-content">
                <div className="chart-box">
                  <h4>All Events - Participant Count</h4>
                  {eventsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={eventsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" />
                        <YAxis label={{ value: 'Participants', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('events', e.dataKey)} verticalAlign="bottom" />
                        {visibleSeries.events?.participant_count && (
                          <Bar dataKey="participant_count" fill="#10B981" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="no-data">No events data available. Ensure events are recorded and not all archived.</p>}
                </div>
                <div className="chart-box">
                  <h4>Popular Events</h4>
                  {popularEventsPieData.length > 0 && popularEventsPieData.some(event => event.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={popularEventsPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#3B82F6"
                          label
                        >
                          {popularEventsPieData.map((entry, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('popularEvents', e.dataKey)} verticalAlign="bottom" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="no-data">No popular events data. Ensure events have participant data.</p>}
                </div>
              </div>
            )
          )}
        </div>

        {/* Clearance Tracking */}
        <div className="card">
          <div className="section-header" onClick={() => toggleSection('clearance')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleSection('clearance')}>
            <h2>Clearance Tracking</h2>
            {collapsedSections.clearance ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
          </div>
          {!collapsedSections.clearance && (
            sectionLoading.clearance ? (
              <Loading message="Loading Clearance Tracking..." />
            ) : (
              <div className="section-content">
                <div className="chart-box">
                  <h4>Clearance by Requirement</h4>
                  {clearanceByRequirementData.length > 0 && clearanceByRequirementData.some(item => item.Clear > 0 || item.Processing > 0 || item['Not Yet Cleared'] > 0) ? (
                    clearanceByRequirementData.map((item, idx) => (
                      <ResponsiveContainer key={idx} width="100%" height={250}>
                        <BarChart data={[item]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="requirement" />
                          <YAxis />
                          <Tooltip />
                          <Legend onClick={(e) => handleLegendClick('clearanceByRequirement', e.dataKey)} verticalAlign="bottom" />
                          {visibleSeries.clearanceByRequirement?.Clear && (
                            <Bar dataKey="Clear" fill="#10B981" />
                          )}
                          {visibleSeries.clearanceByRequirement?.Processing && (
                            <Bar dataKey="Processing" fill="#F59E0B" />
                          )}
                          {visibleSeries.clearanceByRequirement?.['Not Yet Cleared'] && (
                            <Bar dataKey="Not Yet Cleared" fill="#EF4444" />
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    ))
                  ) : <p className="no-data">No clearance tracking data available.</p>}
                </div>
                <div className="chart-box">
                  <h4>Compliance by Year</h4>
                  {complianceByYearData.length > 0 && complianceByYearData.some(item => item.Clear > 0 || item.Processing > 0 || item['Not Yet Cleared'] > 0) ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={complianceByYearData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend onClick={(e) => handleLegendClick('complianceByYear', e.dataKey)} verticalAlign="bottom" />
                        {visibleSeries.complianceByYear?.Clear && (
                          <Bar dataKey="Clear" fill="#10B981" />
                        )}
                        {visibleSeries.complianceByYear?.Processing && (
                          <Bar dataKey="Processing" fill="#F59E0B" />
                        )}
                        {visibleSeries.complianceByYear?.['Not Yet Cleared'] && (
                          <Bar dataKey="Not Yet Cleared" fill="#EF4444" />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="no-data">No compliance data available.</p>}
                </div>
              </div>
            )
          )}
        </div>

        <ReactTooltip id="bscs-students-tooltip" place="top" />
        <ReactTooltip id="active-members-tooltip" place="top" />
        <ReactTooltip id="inactive-members-tooltip" place="top" />
        <ReactTooltip id="verifying-tooltip" place="top" />
        <ReactTooltip id="paid-tooltip" place="top" />
        <ReactTooltip id="not-paid-tooltip" place="top" />
      </div>
    </OfficerLayout>
  );
};

export default OfficerDashboardPage;