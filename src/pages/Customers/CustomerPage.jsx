import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
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
import { FaEdit, FaTrash, FaEye, FaSignOutAlt } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from "sweetalert2";
import toast from 'react-hot-toast';
import AddCustomer from '../Expenses/AddCustomer';

// BottomContent component
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

const CustomerPage = () => {
  const { user, logout } = useAuth();
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch customers
  const fetchCustomers = async () => {
    let url = `/customers?page=${page}&limit=${limit}`;
    const res = await userRequest.get(url);
    return res.data;
  };

  const {
    data: customersResponse = { data: [], total: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customers", page],
    queryFn: fetchCustomers,
    keepPreviousData: true,
  });

  const customersData = customersResponse.data || [];
  const total = customersResponse.total || 0;

  const handleDelete = (customer) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this customer: ${customer?.name || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/customers/${customer?._id || ""}`);
          toast.success("Customer has been deleted.");
          refetch();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the customer."
          );
        }
      }
    });
  };

  const handleViewDetails = (customerId) => {
    navigate(`/customer-details/${customerId}`);
  };

  return (
    <div>
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
            ex<span className="text-blue-600">pen</span>ses
          </h1>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/expenses')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow"
            >
              Expenses
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md shadow"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="p-1 sm:p-1 md:p-6 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
            <p className="text-gray-600">View and manage your customers</p>
          </div>
          <div className="text-right space-y-2 flex flex-row flex-wrap">
            <div className="mt-7 me-3 flex gap-2">
              <Button 
                color="secondary" 
                onPress={() => setShowAddCustomerModal(true)}
              >
                Add Customer
              </Button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <Table
          aria-label="Customers table"
          className="h-[400px] overflow-y-auto"
        >
          <TableHeader>
            <TableColumn>Sl No</TableColumn>
            <TableColumn>NAME</TableColumn>
            <TableColumn>CREATED DATE</TableColumn>
            <TableColumn>UPDATED DATE</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
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
                No customers found
              </div>
            }
          >
            {customersData.map((customer, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {customer.name}
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {new Date(customer.updatedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    <Tooltip content="View Details">
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        startContent={<FaEye />}
                        onPress={() => handleViewDetails(customer._id)}
                      >
                        View
                      </Button>
                    </Tooltip>
                    
                    <Tooltip content="Edit Customer">
                      <Button
                        size="sm"
                        variant="light"
                        color="warning"
                        startContent={<FaEdit />}
                        onPress={() => console.log("Edit", customer)}
                      >
                        Edit
                      </Button>
                    </Tooltip>

                    <Tooltip color="danger" content="Delete Customer">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        startContent={<FaTrash />}
                        onPress={() => handleDelete(customer)}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <BottomContent total={total} page={page} setPage={setPage} />
      </div>
      <AddCustomer
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        apirefetch={refetch}
      />
    </div>
  );
};

export default CustomerPage;