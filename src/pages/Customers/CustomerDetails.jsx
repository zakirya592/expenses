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
import { FaArrowLeft, FaPlus, FaSignOutAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import AddExpenseForCustomer from './AddExpenseForCustomer';
import EditExpenseForCustomer from './EditExpenseForCustomer';

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
              onClick={() => navigate('/customers')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow"
            >
              All Customers
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
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              color="default"
              variant="light"
              aria-label="Back"
              onClick={() => navigate('/customers')}
            >
              <FaArrowLeft />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{customerName}</h1>
              <p className="text-gray-600">Customer Expenses</p>
            </div>
          </div>
          <div className="text-right space-y-2 flex flex-row flex-wrap">
            <div className="mt-7 me-3 flex gap-2">
              <Button 
                color="success" 
                startContent={<FaPlus />}
                onPress={() => setShowAddExpenseModal(true)}
              >
                Add Expense
              </Button>
            </div>
            <div className="mx-3 text-start mt-2">
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-2xl font-bold text-green-600">
                Rs. {totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Table */}
        <Table
          aria-label="Customer expenses table"
          className="h-[400px] overflow-y-auto"
        >
          <TableHeader>
            <TableColumn>Sl No</TableColumn>
            <TableColumn>ITEM</TableColumn>
            <TableColumn>DATE & TIME</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
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
                  <div className="relative flex items-center gap-2">
                    <Tooltip content="Edit Expense">
                      <Button
                        size="sm"
                        variant="light"
                        color="warning"
                        startContent={<FaEdit />}
                        onPress={() => handleEditExpense(expense)}
                      >
                        Edit
                      </Button>
                    </Tooltip>
                    <Tooltip color="danger" content="Delete Expense">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        startContent={<FaTrash />}
                        onPress={() => handleDeleteExpense(expense)}
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
    </div>
  );
};

export default CustomerDetails;