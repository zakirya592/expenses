import React, { useState, useEffect, useMemo } from 'react';
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
    Select,
    SelectItem,
    Spinner,
    Tooltip,
    Pagination
} from '@nextui-org/react';
import { FaCalendarAlt, FaEdit, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { useQuery } from 'react-query';
import userRequest from '../../utils/userRequest';
import { useNavigate } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";
import { useAuth } from '../../contexts/AuthContext';
import Addexpenses from './Addexpenses';
import Swal from "sweetalert2";
import toast from 'react-hot-toast';
import Editexpenses from './Editexpenses';


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
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 1. Return the full response object
  const fetchexpenses = async () => {
    let url = `/expenses?page=${page}&limit=${limit}`;
    if (dateFilter !== "all") {
      if (dateFilter === "custom" && startDate) {
        url += `&year=${startDate}`;
      } else {
        url += `&year=${dateFilter}`;
      }
    }
    const res = await userRequest.get(url);
    return res.data; // Return the whole response
  };

  // 2. Use correct destructuring
  const {
    data: expensesResponse = { data: [], total: 0 },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["expenses", dateFilter, startDate, page],
    queryFn: fetchexpenses,
    keepPreviousData: true,
  });

  useEffect(() => {
    refetch();
  }, [dateFilter, startDate, page]);

  const expensesdata = expensesResponse.data || [];
  const total = expensesResponse.total || 0;


    const handleDelete = (expence) => {
        
    Swal.fire({
      title: "Are you sure?",
      text: `You will not be able to recover this ${expence?.item || ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await userRequest.delete(`/expenses/${expence?._id || ""}`);
          toast.success("The Expenses has been deleted.");
          refetch();
        } catch (error) {
          toast.error(error?.response?.data?.message || "Failed to delete the Expenses.");
        }
      }
    });
  };

   const openEditModal = (expense) => {
     setSelectedExpense(expense);
     setShowEditModal(true);
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
            <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
            <p className="text-gray-600">View and manage sales expenses</p>
          </div>
          <div className="text-right space-y-2 flex flex-row flex-wrap">
            <div className="mt-7 me-3">
              <Button color="success" onPress={() => setShowAddModal(true)}>
                Add expenses
              </Button>
            </div>
            <div className="mx-3 text-start mt-2">
              <div className="text-sm text-gray-600">Sales</div>
              <div className="text-2xl font-bold text-green-600">
                Rs.
                {/* {expensesdata.reduce((sum, txn) => sum + txn.amount, 0).toLocaleString()} */}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <Select
                  placeholder="Date Range"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value === "custom") {
                      setStartDate("");
                    }
                  }}
                  className="w-64"
                  startContent={<FaCalendarAlt />}
                >
                  <SelectItem key="all" value="all">
                    All Dates
                  </SelectItem>
                  <SelectItem key="today" value="today">
                    Today
                  </SelectItem>
                  <SelectItem key="yesterday" value="yesterday">
                    Yesterday
                  </SelectItem>
                  <SelectItem key="week" value="week">
                    This Week
                  </SelectItem>
                  <SelectItem key="custom" value="custom">
                    Custom Range
                  </SelectItem>
                </Select>

                {dateFilter === "custom" && (
                  <div className="felx">
                    <p>Start Date</p>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-64"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Expenses Table */}
        <Table
          aria-label="Expenses table"
          className="h-[400px] overflow-y-auto"
        >
          <TableHeader>
            <TableColumn>Sl No</TableColumn>
            <TableColumn>ITEM</TableColumn>
            <TableColumn>DATE & TIME</TableColumn>
            <TableColumn>DESCRIPTION</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
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
                No expenses found
              </div>
            }
          >
            {expensesdata.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="font-mono font-semibold">
                  {transaction.item}
                </TableCell>
                <TableCell>
                  <div>
                    <div>{new Date(transaction.date).toLocaleString()}</div>
                  </div>
                </TableCell>
                <TableCell>{transaction?.description}</TableCell>
                <TableCell className="font-semibold">
                  {transaction.amount}
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  <div>
                    {new Date(transaction.updatedAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center gap-2">
                    <Tooltip content="Edit Expenses">
                      {/* <span >
                        <EditIcon />
                      </span> */}
                      <Button
                        size="sm"
                        variant="light"
                        color="warning"
                        startContent={<FaEdit />}
                        onPress={() => openEditModal(transaction)}
                      >
                        Edit
                      </Button>
                    </Tooltip>

                    <Tooltip color="danger" content="Delete Expenses">
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        startContent={<FaTrash />}
                        onPress={() => handleDelete(transaction)}
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
        {/* 3. Place BottomContent outside the Table */}
        <BottomContent total={total} page={page} setPage={setPage} />
      </div>
      <Addexpenses
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        apirefetch={refetch}
      />
      <Editexpenses
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        selectionexpense={selectedExpense}
        apirefetch={refetch}
      />
    </div>
  );
};

export default Expenses;
