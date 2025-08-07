import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Tooltip,
  Pagination,
} from '@nextui-org/react';
import { FaEdit, FaSignOutAlt, FaTrash, FaPlus, FaEye } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import Swal from "sweetalert2";
import toast from 'react-hot-toast';
import AddOrganization from './AddOrganization';
import EditOrganization from './EditOrganization';

// BottomContent component for pagination
function BottomContent({ total, page, setPage }) {
  if (!total) return null;
  const totalPages = Math.ceil(total / 10); // 10 is your limit per page

  return (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="text-small text-default-400">
        Total {total}
      </span>
      <Pagination
        isCompact
        showControls
        showShadow
        color="primary"
        page={page}
        total={totalPages}
        onChange={setPage}
        classNames={{
          cursor: "bg-navy-700 text-white",
        }}
      />
    </div>
  );
}

const OrganizationsPage = () => {
  const { user, logout } = useAuth();
  const [nameSearch, setNameSearch] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch organizations
  const fetchOrganizations = async () => {
    let url = `/organizations?page=${page}&limit=${limit}`;
    
    // Add search functionality if needed
    if (nameSearch) {
      url += `&nameSearch=${nameSearch}`;
    }

    try {
      const res = await userRequest.get(url);
      console.log('API Response:', res.data);
      return res.data; // Return the whole response
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return { data: [], total: 0 };
    }
  };

  // Use React Query for data fetching
  const {
    data: organizationsResponse = { data: [], total: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "organizations",
      page,
      nameSearch,
    ],
    queryFn: fetchOrganizations,
    keepPreviousData: true,
  });

  // Refetch when page or search changes
  useEffect(() => {
    refetch();
  }, [
    page,
    nameSearch,
  ]);
  
  // Initial fetch when component mounts
  useEffect(() => {
    refetch();
  }, []);

  // Handle both array response and object with data property
  const organizationsData = Array.isArray(organizationsResponse) 
    ? organizationsResponse 
    : (organizationsResponse.data || []);
  
  // If response is an array, use its length as total
  const total = Array.isArray(organizationsResponse) 
    ? organizationsResponse.length 
    : (organizationsResponse.total || 0);

  const handleDelete = (organization) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this organization: ${organization?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/organizations/${organization?._id || ""}`);
          toast.success("The organization has been deleted.");
          refetch();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the organization."
          );
        }
      }
    });
  };

  const openEditModal = (organization) => {
    setSelectedOrganization(organization);
    setShowEditModal(true);
  };

  const handleViewOrganizationCustomers = (organizationId, organizationName) => {
    navigate(`/customer-details/${organizationId}?isOrganization=true&name=${encodeURIComponent(organizationName)}`);
  };

  return (
    <div>
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 tracking-tight">
            ex<span className="text-blue-600">pen</span>ses
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow"
            >
              <FaSignOutAlt />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <div className="p-1 sm:p-1 md:p-6 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center flex-wrap gap-4 sm:gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Organizations</h1>
            <p className="text-sm text-gray-600">View and manage your organizations</p>
          </div>
          <div className="flex flex-wrap justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-4">
            <div className="flex flex-wrap">
              <Button 
                size="sm"
                color="secondary" 
                startContent={<FaPlus />}
                onPress={() => setShowAddModal(true)}
              >
                Add Organization
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="py-2 px-2 sm:px-4">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="w-full sm:w-auto">
                <Input
                  placeholder="Search organization name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="w-full sm:w-64"
                  size="sm"
                />
              </div>
              <div>
                <Button
                  color="danger"
                  variant="flat"
                  size="sm"
                  onPress={() => {
                    setNameSearch("");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Organizations Table */}
        <div className="max-w-full overflow-x-auto">
          <Table
            aria-label="Organizations table"
            className="h-[400px] overflow-y-auto"
            classNames={{
              wrapper: "min-w-[800px]" // Ensures table has minimum width for scrolling on small screens
            }}
          >
            <TableHeader>
              <TableColumn className="text-xs sm:text-sm">Sl No</TableColumn>
              <TableColumn className="text-xs sm:text-sm">NAME</TableColumn>
              <TableColumn className="text-xs sm:text-sm">CREATED DATE</TableColumn>
              <TableColumn className="text-xs sm:text-sm">UPDATED DATE</TableColumn>
              <TableColumn className="text-xs sm:text-sm">ACTIONS</TableColumn>
            </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={
              <div className="flex justify-center items-center py-8">
                <Spinner color="success" size="lg" />
              </div>
            }
            emptyContent={
              <div className="text-center text-gray-500 py-8">
                No organizations found
              </div>
            }
          >
            {organizationsData.map((organization, index) => (
              <TableRow key={organization._id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {organization.name}
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {formatDate(organization.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {formatDate(organization.updatedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-1 flex-wrap">
                    <Tooltip content="View Customers">
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        isIconOnly
                        className="min-w-0 sm:min-w-unit-10"
                        onPress={() => handleViewOrganizationCustomers(organization._id, organization.name)}
                      >
                        <FaEye className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline ml-1">View</span>
                      </Button>
                    </Tooltip>

                    <Tooltip content="Edit Organization">
                      <Button
                        size="sm"
                        variant="light"
                        color="warning"
                        isIconOnly
                        className="min-w-0 sm:min-w-unit-10"
                        onPress={() => openEditModal(organization)}
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline ml-1">Edit</span>
                      </Button>
                    </Tooltip>

                    <Tooltip color="danger" content="Delete Organization">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        className="min-w-0 sm:min-w-unit-10"
                        onPress={() => handleDelete(organization)}
                      >
                        <FaTrash className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline ml-1">Delete</span>
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
        {/* Pagination */}
        <BottomContent total={total} page={page} setPage={setPage} />
      </div>
      
      {/* Add Organization Modal */}
      <AddOrganization
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        apirefetch={refetch}
      />
      
      {/* Edit Organization Modal */}
      {selectedOrganization && (
        <EditOrganization
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          apirefetch={refetch}
          organization={selectedOrganization}
        />
      )}
    </div>
  );
};

export default OrganizationsPage;