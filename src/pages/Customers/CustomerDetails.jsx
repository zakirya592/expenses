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
import { FaArrowLeft, FaPlus, FaSignOutAlt, FaEdit, FaTrash, FaFilePdf } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import AddExpenseForCustomer from './AddExpenseForCustomer';
import EditExpenseForCustomer from './EditExpenseForCustomer';
import IndexRangeModal from './IndexRangeModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [customerName, setCustomerName] = useState("");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showIndexRangeModal, setShowIndexRangeModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch customer details
  const fetchCustomer = async () => {
    try {
      const res = await userRequest.get(`/customers/${customerId}`);
      setCustomerName(res.data.data.name);
      return res.data;
    } catch (error) {
      toast.error("Failed to fetch customer details");
      return { data: {} };
    }
  };

  // Fetch customer expenses
  const fetchCustomerExpenses = async () => {
    try {
      const url = `/customers/${customerId}/expenses?page=${page}&limit=${limit}`;
      const res = await userRequest.get(url);
      return res.data;
    } catch (error) {
      toast.error("Failed to fetch customer expenses");
      return { data: [], total: 0, totalAmount: 0 };
    }
  };

  const { data: customerData } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: fetchCustomer,
    enabled: !!customerId,
  });

  const {
    data: expensesResponse = { data: [], total: 0, totalAmount: 0 },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["customerExpenses", customerId, page],
    queryFn: fetchCustomerExpenses,
    enabled: !!customerId,
    keepPreviousData: true,
  });

  const expensesData = expensesResponse.data || [];
  const total = expensesResponse.total || 0;
  const totalAmount = expensesResponse.totalAmount || 0;

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
        new Date(expense.date).toLocaleDateString(),
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
              onClick={() => navigate('/customers')}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow"
            >
              All Customers
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
              onClick={() => navigate('/customers')}
            >
              <FaArrowLeft />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{customerName}</h1>
              <p className="text-sm text-gray-600">Customer Expenses</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-between sm:justify-end w-full sm:w-auto gap-2 sm:gap-4">
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
            <div className="text-start">
              <div className="text-xs sm:text-sm text-gray-600">Total Expenses</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                Rs. {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="max-w-full overflow-x-auto">
          <Table
            aria-label="Customer expenses table"
            className="h-[400px] overflow-y-auto"
            classNames={{
              wrapper: "min-w-[800px]" // Ensures table has minimum width for scrolling on small screens
            }}
          >
            <TableHeader>
              <TableColumn className="text-xs sm:text-sm">Sl No</TableColumn>
              <TableColumn className="text-xs sm:text-sm">ITEM</TableColumn>
              <TableColumn className="text-xs sm:text-sm">DATE & TIME</TableColumn>
              <TableColumn className="text-xs sm:text-sm">DESCRIPTION</TableColumn>
              <TableColumn className="text-xs sm:text-sm">AMOUNT</TableColumn>
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
                No expenses found for this customer
              </div>
            }
          >
            {expensesData.map((expense, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {expense.item}
                </TableCell>
                <TableCell>
                  <div>
                    {new Date(expense.date).toLocaleString()}
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
            ))}
          </TableBody>
          </Table>
        </div>
        <BottomContent total={total} page={page} setPage={setPage} />
      </div>
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
    </div>
  );
};

export default CustomerDetails;