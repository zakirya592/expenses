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
import { FaEdit, FaEye, FaSignOutAlt, FaTrash, FaUserPlus } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import Swal from "sweetalert2";
import toast from 'react-hot-toast';
import AddCustomer from './AddCustomer';


// BottomContent component outside
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

const Expenses = () => {
  const { user, logout } = useAuth();
  const [itemSearch, setItemSearch] = useState("");
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [totalamount, setTotalamount] = useState({ total: 0, count: 0 });
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch customers
  const fetchCustomers = async () => {
    let url = `/customers?page=${page}&limit=${limit}`;
    
    // Keep search functionality if needed
    if (itemSearch) {
      url += `&nameSearch=${itemSearch}`;
    }

    const res = await userRequest.get(url);
    return res.data; // Return the whole response
  };
  const fetchtotalamout = async () => {
    try {
      const response = await userRequest.get(`/expenses/total`);
      const data = response?.data?.data || { total: 0, count: 0 };
      setTotalamount(data);
    } catch (error) {
      console.error("Error fetching total expenses:", error);
      setTotalamount({ total: 0, count: 0 });
    }
  };

  // Use correct destructuring
  const {
    data: customersResponse = { data: [], total: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "customers",
      page,
      itemSearch,
    ],
    queryFn: fetchCustomers,
    keepPreviousData: true,
  });

  useEffect(() => {
    refetch();
  }, [
    page,
    itemSearch,
  ]);

  const bothapi = () => {
    refetch();
    fetchtotalamout();
  };

  const customersData = customersResponse.data || [];
  const total = customersResponse.total || 0;

  useEffect(() => {
    fetchtotalamout();
  }, []);

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
          toast.success("The customer has been deleted.");
          refetch();
          fetchtotalamout();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the customer."
          );
        }
      }
    });
  };

  const openEditModal = (customer) => {
    setSelectedExpense(customer);
    setShowEditModal(true);
  };
  
  const handleViewDetails = (customerId) => {
    navigate(`/customer-details/${customerId}`);
  };

  // PDF export function
  const exportToPdf = (data, filename) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  const totalAmount = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  const titleText = filename || "Expenses Report";
  const totalText = `Total: Rs. ${totalAmount.toFixed(2)}`;

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text(titleText, 10, 20); // Left side

  doc.setFontSize(14);
  doc.setTextColor(22, 160, 133); // Stylish green color
  const totalTextWidth = doc.getTextWidth(totalText);
  doc.text(totalText, pageWidth - totalTextWidth - 10, 20); //


    const headers = [["#", "Item", "Date", "Description", "Amount"]];
    const rows = data.map((row, index) => [
      index + 1,
      row.item || "",
      formatDate(row.date),
      row.description || "",
      row.amount || "",
    ]);
    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    return doc;
  };

  const viewPdfInNewTab = (data, filename) => {
    const doc = exportToPdf(data, filename);
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 10000); // revoke after 10s
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Customers</h1>
            <p className="text-sm text-gray-600">View and manage your customers</p>
          </div>
          <div className="flex flex-wrap justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-4">
            <div className="flex flex-wrap">
              <Button 
                size="sm"
                color="secondary" 
                startContent={<FaUserPlus />}
                onPress={() => setShowAddCustomerModal(true)}
              >
                Add Customer
              </Button>
            </div>
            <div className="text-start">
              <div className="text-xs sm:text-sm text-gray-600">Total Expenses</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                Rs. {totalamount.total || 0}
              </div>
              <div className="text-xs text-gray-500">
                Count: {totalamount.count || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="py-2 px-2 sm:px-4">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="w-full sm:w-auto">
                <Input
                  placeholder="Search customer name..."
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
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
                    setItemSearch("");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Customers Table */}
        <div className="max-w-full overflow-x-auto">
          <Table
            aria-label="Customers table"
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
                    {formatDate(customer.createdAt)}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {formatDate(customer.updatedAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-1 flex-wrap">
                    <Tooltip content="View Details">
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        isIconOnly
                        className="min-w-0 sm:min-w-unit-10"
                        onPress={() => handleViewDetails(customer._id)}
                      >
                        <FaEye className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline ml-1">View</span>
                      </Button>
                    </Tooltip>
                    
                    <Tooltip content="Edit Customer">
                      <Button
                        size="sm"
                        variant="light"
                        color="warning"
                        isIconOnly
                        className="min-w-0 sm:min-w-unit-10"
                        onPress={() => openEditModal(customer)}
                      >
                        <FaEdit className="text-xs sm:text-sm" />
                        <span className="hidden sm:inline ml-1">Edit</span>
                      </Button>
                    </Tooltip>

                    <Tooltip color="danger" content="Delete Customer">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        isIconOnly
                        className="min-w-0 sm:min-w-unit-10"
                        onPress={() => handleDelete(customer)}
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
        {/* 3. Place BottomContent outside the Table */}
        <BottomContent total={total} page={page} setPage={setPage} />
      </div>
      <AddCustomer
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        apirefetch={bothapi}
      />
    </div>
  );
};

export default Expenses;
