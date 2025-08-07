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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from '@nextui-org/react';
import { FaArrowLeft, FaPlus, FaSignOutAlt, FaEdit, FaTrash, FaFilePdf, FaEye } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import AddExpenseForCustomer from './AddExpenseForCustomer'; 
import EditExpenseForCustomer from './EditExpenseForCustomer';
import IndexRangeModal from './IndexRangeModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatDateTime } from '../../utils/dateUtils';

// EditCustomer component
const EditCustomer = ({ isOpen, onClose, apirefetch, customer, onTotalUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name || "");
    }
  }, [customer]);

  const handleUpdate = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setLoading(true);
    try {
      await userRequest.put(`/customers/${customer._id}`, {
        name: customerName,
        organization: customer.organization
      });
      setLoading(false);
      toast.success("Customer updated successfully!");
      // Ensure refetch happens before closing the modal
      if (apirefetch) {
        await apirefetch();
      }
      // Update organization total expenses
      if (onTotalUpdate) {
        onTotalUpdate();
      }
      onClose(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update customer."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="bg-white dark:bg-gray-800"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
              Edit Customer
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Input
                    autoFocus
                    label="Customer Name"
                    placeholder="Enter customer name"
                    variant="bordered"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className="font-medium"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleUpdate}
                isLoading={loading}
                className="font-medium"
              >
                Update Customer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

// AddCustomerToOrganization component
const AddCustomerToOrganization = ({ isOpen, onClose, apirefetch, organizationId, organizationName, onTotalUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const handleAdd = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    setLoading(true);
    try {
      await userRequest.post("/customers", {
        name: customerName,
        organization: organizationId
      });
      setCustomerName("");
      setLoading(false);
      toast.success("Customer added successfully!");
      // Ensure refetch happens before closing the modal
      if (apirefetch) {
        await apirefetch();
      }
      // Update organization total expenses
      if (onTotalUpdate) {
        onTotalUpdate();
      }
      onClose(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to add customer."
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="bg-white dark:bg-gray-800"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-xl font-bold">
              Add New Customer to {organizationName}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div>
                  <Input
                    autoFocus
                    label="Customer Name"
                    placeholder="Enter customer name"
                    variant="bordered"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className="font-medium"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleAdd}
                isLoading={loading}
                className="font-medium"
              >
                Add Customer
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
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

const CustomerDetails = () => {
  const { user, logout } = useAuth();
  const { customerId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isOrganization = queryParams.get('isOrganization') === 'true';
  const orgName = queryParams.get('name');
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [customerName, setCustomerName] = useState(orgName || "");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showIndexRangeModal, setShowIndexRangeModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [organizationTotal, setOrganizationTotal] = useState({ total: 0, count: 0 });
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch customer details or organization details
  const fetchCustomer = async () => {
    try {
      if (isOrganization) {
        // If it's an organization, we already have the name from the URL
        return { data: { name: orgName || "Organization" } };
      } else {
        // Regular customer fetch
        const res = await userRequest.get(`/customers/${customerId}`);
        setCustomerName(res.data.data.name);
        return res.data;
      }
    } catch (error) {
      toast.error("Failed to fetch customer details");
      return { data: {} };
    }
  };
  
  // Fetch organization total expenses
  const fetchOrganizationTotal = async () => {
    if (!isOrganization || !customerId) return;
    
    try {
      const response = await userRequest.get(`/expenses/total?organizationId=${customerId}`);
      console.log("Organization total expenses:", response.data);
      if (response.data && response.data.data) {
        setOrganizationTotal({
          total: response.data.data.total || 0,
          count: response.data.data.count || 0
        });
      }
    } catch (error) {
      console.error("Error fetching organization total expenses:", error);
    }
  };

  // Fetch customer expenses or organization customers
  const fetchData = async () => {
    try {
      if (isOrganization) {
        // Fetch customers for the organization
        const url = `/customers/organization/${customerId}`;
        const res = await userRequest.get(url);
        console.log("Organization customers response:", res.data);
        return {
          data: res.data.data || [],
          total: res.data.total || 0,
          organization: res.data.organization
        };
      } else {
        // Regular customer expenses fetch
        const url = `/customers/${customerId}/expenses?page=${page}&limit=${limit}`;
        const res = await userRequest.get(url);
        return res.data;
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(isOrganization ? "Failed to fetch organization customers" : "Failed to fetch customer expenses");
      return { data: [], total: 0, totalAmount: 0 };
    }
  };

  const { data: customerData } = useQuery({
    queryKey: ["customer", customerId, isOrganization],
    queryFn: fetchCustomer,
    enabled: !!customerId,
  });

  const {
    data: responseData = { data: [], total: 0, totalAmount: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customerData", customerId, page, isOrganization],
    queryFn: fetchData,
    enabled: !!customerId,
    keepPreviousData: true,
  });

  // Set organization name if available in the response
  useEffect(() => {
    if (isOrganization && responseData.organization && !orgName) {
      setCustomerName(responseData.organization);
    }
  }, [responseData, isOrganization, orgName]);
  
  // Fetch organization total expenses when component mounts or customerId changes
  useEffect(() => {
    if (isOrganization && customerId) {
      fetchOrganizationTotal();
    }
  }, [isOrganization, customerId]);

  const tableData = responseData.data || [];
  const total = responseData.total || 0;
  const totalAmount = responseData.totalAmount || 0;

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setShowEditExpenseModal(true);
  };

  const handleDeleteExpense = (expense) => {
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this expense: ${expense?.item || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/expenses/${expense?._id || ""}`);
          toast.success("The expense has been deleted.");
          refetch();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the expense."
          );
        }
      }
    });
  };
  
  // Functions for customer management in organization view
  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowEditCustomerModal(true);
  };

  const handleDeleteCustomer = (customer) => {
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
          await refetch();
          fetchOrganizationTotal();
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "Failed to delete the customer."
          );
        }
      }
    });
  };
  
  const handleViewCustomerExpenses = (customerId) => {
    navigate(`/customer-details/${customerId}`);
  };
  
  const fetchAllExpenses = async () => {
    try {
      // Set a large limit to get all expenses
      const url = `/customers/${customerId}/expenses?limit=1000`;
      const response = await userRequest.get(url);
      return response.data.data || [];
    } catch (error) {
      toast.error("Failed to fetch expenses");
      return [];
    }
  };
  
  const getExpensesByIndexRange = async (startIndex, endIndex) => {
    try {
      const allExpenses = await fetchAllExpenses();
      
      // Convert to 0-based index for array slicing
      const start = startIndex - 1;
      const end = endIndex;
      
      // Slice the array to get expenses in the specified range
      return allExpenses.slice(start, end);
    } catch (error) {
      toast.error("Failed to get expenses for the selected range");
      return [];
    }
  };

  const generatePDF = async (startIndex, endIndex) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading("Generating PDF...");
      
      // Fetch expenses for the selected index range
      const expenses = await getExpensesByIndexRange(startIndex, endIndex);
      
      if (expenses.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No expenses found for the selected range");
        return;
      }

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Calculate total amount
      const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      
      // Add title and index range
      const titleText = `Expenses for ${customerName}`;
      const rangeText = `Expenses: ${startIndex} to ${endIndex}`;
      const totalText = `Total: Rs. ${totalAmount.toFixed(2)}`;
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(titleText, 10, 20);
      
      doc.setFontSize(12);
      doc.text(rangeText, 10, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(22, 160, 133);
      const totalTextWidth = doc.getTextWidth(totalText);
      doc.text(totalText, pageWidth - totalTextWidth - 10, 30);
      
      // Define table headers and rows
      const headers = [["#", "Item", "Date", "Description", "Amount"]];
      const rows = expenses.map((expense, index) => [
        startIndex + index, // Start numbering from the startIndex
        expense.item || "",
        formatDate(expense.date),
        expense.description || "",
        expense.amount || "",
      ]);
      
      // Generate table
      autoTable(doc, {
        startY: 40,
        head: headers,
        body: rows,
        theme: "grid",
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 10, cellPadding: 3 },
      });
      
      // Open PDF in new tab
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000); // revoke after 10s
      
      toast.dismiss(loadingToast);
      toast.success("PDF generated successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error("PDF generation error:", error);
    }
  };

  return (
    <div>
      {/* Top Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-800 tracking-tight mb-2 sm:mb-0">
            ex<span className="text-blue-600">pen</span>ses
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => isOrganization ? navigate('/organizations') : navigate('/customers')}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow"
            >
              {isOrganization ? 'All Organizations' : 'All Customers'}
            </button>
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
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              isIconOnly
              size="sm"
              color="default"
              variant="light"
              aria-label="Back"
              onClick={() => isOrganization ? navigate('/organizations') : navigate('/customers')}
            >
              <FaArrowLeft />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{customerName}</h1>
              <p className="text-sm text-gray-600">
                {isOrganization ? 'Organization Customers' : 'Customer Expenses'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-4">
            {isOrganization ? (
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm"
                  color="success" 
                  startContent={<FaPlus />}
                  onPress={() => setShowAddCustomerModal(true)}
                >
                  Add New Customer
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm"
                  color="success" 
                  startContent={<FaPlus />}
                  onPress={() => setShowAddExpenseModal(true)}
                >
                  Add Expense
                </Button>
                <Button 
                  size="sm"
                  color="primary" 
                  startContent={<FaFilePdf />}
                  onPress={() => setShowIndexRangeModal(true)}
                >
                  Generate PDF
                </Button>
              </div>
            )}
            {!isOrganization ? (
              <div className="text-start">
                <div className="text-xs sm:text-sm text-gray-600">Total Expenses</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                  Rs. {totalAmount.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-start">
                <div className="text-xs sm:text-sm text-gray-600">Organization Total Expenses</div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                  Rs. {organizationTotal.total.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  Count: {organizationTotal.count}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="max-w-full overflow-x-auto">
          <Table
            aria-label={isOrganization ? "Organization customers table" : "Customer expenses table"}
            className="h-[400px] overflow-y-auto"
            classNames={{
              wrapper: "min-w-[800px]" // Ensures table has minimum width for scrolling on small screens
            }}
          >
            <TableHeader>
              {isOrganization ? (
                <>
                  <TableColumn className="text-xs sm:text-sm">Sl No</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">NAME</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">CREATED DATE</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">UPDATED DATE</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">ACTIONS</TableColumn>
                </>
              ) : (
                <>
                  <TableColumn className="text-xs sm:text-sm">Sl No</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">ITEM</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">DATE & TIME</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">DESCRIPTION</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">AMOUNT</TableColumn>
                  <TableColumn className="text-xs sm:text-sm">ACTIONS</TableColumn>
                </>
              )}
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
                {isOrganization ? 'No customers found for this organization' : 'No expenses found for this customer'}
              </div>
            }
          >
            {isOrganization ? (
              // Organization customers table
              tableData.map((customer, index) => (
                <TableRow key={customer._id}>
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
                      <Tooltip content="View Expenses">
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          isIconOnly
                          className="min-w-0 sm:min-w-unit-10"
                          onPress={() => handleViewCustomerExpenses(customer._id)}
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
                          onPress={() => handleEditCustomer(customer)}
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
                          onPress={() => handleDeleteCustomer(customer)}
                        >
                          <FaTrash className="text-xs sm:text-sm" />
                          <span className="hidden sm:inline ml-1">Delete</span>
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Customer expenses table
              tableData.map((expense, index) => (
                <TableRow key={expense._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono font-semibold">
                    {expense.item}
                  </TableCell>
                  <TableCell>
                    <div>
                      {formatDateTime(expense.date)}
                    </div>
                  </TableCell>
                  <TableCell>{expense?.description}</TableCell>
                  <TableCell className="font-semibold">
                    {expense.amount}
                  </TableCell>
                  <TableCell>
                    <div className="relative flex items-center gap-1 flex-wrap">
                      <Tooltip content="Edit Expense">
                        <Button
                          size="sm"
                          variant="light"
                          color="warning"
                          isIconOnly
                          className="min-w-0 sm:min-w-unit-10"
                          onPress={() => handleEditExpense(expense)}
                        >
                          <FaEdit className="text-xs sm:text-sm" />
                          <span className="hidden sm:inline ml-1">Edit</span>
                        </Button>
                      </Tooltip>
                      <Tooltip color="danger" content="Delete Expense">
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          isIconOnly
                          className="min-w-0 sm:min-w-unit-10"
                          onPress={() => handleDeleteExpense(expense)}
                        >
                          <FaTrash className="text-xs sm:text-sm" />
                          <span className="hidden sm:inline ml-1">Delete</span>
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          </Table>
        </div>
        <BottomContent total={total} page={page} setPage={setPage} />
      </div>
      
      {/* Only show these modals for customer expenses view, not organization customers view */}
      {!isOrganization && (
        <>
          <AddExpenseForCustomer
            isOpen={showAddExpenseModal}
            onClose={() => setShowAddExpenseModal(false)}
            apirefetch={refetch}
            customerId={customerId}
            customerName={customerName}
          />
          <EditExpenseForCustomer
            isOpen={showEditExpenseModal}
            onClose={() => setShowEditExpenseModal(false)}
            apirefetch={refetch}
            expense={selectedExpense}
            customerName={customerName}
          />
          <IndexRangeModal
            isOpen={showIndexRangeModal}
            onClose={() => setShowIndexRangeModal(false)}
            onGenerate={generatePDF}
            maxIndex={total}
          />
        </>
      )}
      
      {/* Add Customer to Organization modal */}
      {isOrganization && (
        <>
          <AddCustomerToOrganization
            isOpen={showAddCustomerModal}
            onClose={() => setShowAddCustomerModal(false)}
            apirefetch={refetch}
            organizationId={customerId}
            organizationName={customerName}
            onTotalUpdate={fetchOrganizationTotal}
          />
          {selectedCustomer && (
            <EditCustomer
              isOpen={showEditCustomerModal}
              onClose={() => setShowEditCustomerModal(false)}
              apirefetch={refetch}
              customer={selectedCustomer}
              onTotalUpdate={fetchOrganizationTotal}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CustomerDetails;